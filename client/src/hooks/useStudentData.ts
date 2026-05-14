import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { buildStudentAvatar, STUDENT_PROFILE_SELECT, type StudentProfileRow } from '../lib/studentProfiles';

export interface CourseData {
  id: string;
  name: string;
  code: string;
  instructor: string;
  attendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  classNames: string[];
  classIds: string[];
}

export interface AssignmentData {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  deadline: string;
  status: 'pending' | 'submitted';
  grade: number | null;
  gradeStatus: 'pending' | 'partial' | 'completed';
  feedback: string | null;
  gradedAt: string | null;
  submittedOn: string | null;
  isPending: boolean;
  description?: string;
  fileUrl?: string;
  portalOpen: boolean;
  isPastDue: boolean;
  submissionHistory: SubmissionHistoryItem[];
}

export interface SubmissionHistoryItem {
  id: string;
  fileUrl: string | null;
  status: string;
  grade: number | null;
  gradeStatus: 'pending' | 'partial' | 'completed';
  feedback: string | null;
  gradedAt: string | null;
  submittedAt: string | null;
}

export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  semester: string;
  rollNo: string;
  department: string;
  batch: string;
  phone: string;
}

/** Per-class attendance data exposed for the student attendance page */
export interface ClassAttendanceData {
  classId: string;
  className: string;
  courseName: string;
  courseCode: string;
  teacherName: string;
  color: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercent: number;
  records: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  time: string;
  status: 'present' | 'absent';
}

export function useStudentData() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [classAttendance, setClassAttendance] = useState<ClassAttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uiColors = ['#6a5182', '#8b6ca8', '#4b3f68', '#b096cc', '#778196'];

  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentUser = user;
    setIsLoading(true);
      setError(null);

      try {
        const { data: studentProfileRow, error: profileError } = await supabase
          .from('student_profiles')
          .select(STUDENT_PROFILE_SELECT)
          .eq('student_id', currentUser.id)
          .maybeSingle();

        if (profileError && profileError.code !== '42P01') {
          console.error('Fetch Student Profile Error:', profileError);
        }

        const profileRow = (studentProfileRow as StudentProfileRow | null) ?? null;
        const enrolledYear = profileRow?.date_enrolled ? new Date(profileRow.date_enrolled).getFullYear() : null;

        setProfile({
          id: currentUser.id,
          name: currentUser.name || 'Student',
          email: currentUser.email || '',
          avatar: buildStudentAvatar(currentUser.name || 'Student'),
          course: 'Course assigned through batches',
          semester: profileRow?.semester || 'Semester not set',
          rollNo: '',
          department: profileRow?.department || 'Department not set yet',
          batch: enrolledYear ? `${enrolledYear}-${enrolledYear + 4}` : 'Batch not set',
          phone: profileRow?.mobile_no || 'N/A',
        });

        // ── Fetch classes where this student is enrolled (student_ids contains user id) ──
        const classSelect = 'id, name, batch_id, course_id, teacher_id, student_ids';

        const { data: directClassesData, error: classesError } = await supabase
          .from('classes')
          .select(classSelect)
          .contains('student_ids', [currentUser.id]);

        if (classesError && classesError.code !== '42P01') {
          console.error('Fetch Classes Error:', classesError);
        }

        const { data: batchRows, error: batchError } = await supabase
          .from('batches')
          .select('id, student_ids')
          .contains('student_ids', [currentUser.id]);

        if (batchError && batchError.code !== '42P01') {
          console.error('Fetch Student Batches Error:', batchError);
        }

        const batchIds = (batchRows || []).map((batch: any) => batch.id).filter(Boolean);
        let batchClassesData: any[] = [];

        if (batchIds.length > 0) {
          const { data, error: batchClassesError } = await supabase
            .from('classes')
            .select(classSelect)
            .in('batch_id', batchIds);

          if (batchClassesError && batchClassesError.code !== '42P01') {
            console.error('Fetch Batch Classes Error:', batchClassesError);
          }

          batchClassesData = data || [];
        }

        // Deduplicate classes by ID to prevent the same class from showing twice
        const rawClasses = [...(directClassesData || []), ...batchClassesData];
        const seenClassIds = new Set<string>();
        const enrolledClasses = rawClasses.filter((cls: any) => {
          if (seenClassIds.has(cls.id)) return false;
          seenClassIds.add(cls.id);
          return true;
        });

        const enrolledClassIds = enrolledClasses.map((cls: any) => cls.id);

        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', currentUser.id);

        if (enrollError && enrollError.code !== '42P01') {
          console.error('Fetch Enrollments Error:', enrollError);
        }

        const enrollmentCourses = (enrollmentsData || [])
          .map((enr: any) => Array.isArray(enr.courses) ? enr.courses[0] : enr.courses)
          .filter(Boolean);

        // ── Fetch course details for enrolled classes ──
        const enrolledCourseIds = Array.from(new Set([
          ...enrolledClasses.map((cls: any) => cls.course_id).filter(Boolean),
          ...enrollmentCourses.map((course: any) => course.id).filter(Boolean),
        ]));
        const courseMap = new Map<string, any>();

        if (enrolledCourseIds.length > 0) {
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id, name, course_code, faculty_lead')
            .in('id', enrolledCourseIds);

          (coursesData || []).forEach((c: any) => courseMap.set(c.id, c));
        }

        enrollmentCourses.forEach((course: any) => courseMap.set(course.id, course));

        // ── Fetch teacher names for enrolled classes ──
        const teacherIds = Array.from(new Set(enrolledClasses.map((cls: any) => cls.teacher_id).filter(Boolean)));
        const teacherMap = new Map<string, string>();

        if (teacherIds.length > 0) {
          const { data: teacherData } = await supabase
            .from('users')
            .select('id, name')
            .in('id', teacherIds);

          (teacherData || []).forEach((t: any) => teacherMap.set(t.id, t.name || 'Unknown'));
        }

        // ── Fetch attendance records for enrolled classes ──
        let attendanceRows: any[] = [];
        if (enrolledClassIds.length > 0) {
          const { data: attData, error: attError } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', currentUser.id)
            .in('class_id', enrolledClassIds)
            .order('date', { ascending: false });

          if (attError && attError.code !== '42P01') {
            console.error('Fetch Attendance Error:', attError);
          }
          attendanceRows = attData || [];
        }

        // ── Build per-class attendance data ──
        const classAttendanceList: ClassAttendanceData[] = enrolledClasses.map((cls: any, idx: number) => {
          const course = courseMap.get(cls.course_id);
          const classRecords = attendanceRows.filter((a: any) => a.class_id === cls.id);
          const presentCount = classRecords.filter((a: any) => a.status === 'present').length;
          const absentCount = classRecords.filter((a: any) => a.status === 'absent').length;
          const totalSessions = classRecords.length;
          const attendancePercent = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

          return {
            classId: cls.id,
            className: cls.name || 'Unknown Class',
            courseName: course?.name || 'Unknown Course',
            courseCode: course?.course_code || '---',
            teacherName: teacherMap.get(cls.teacher_id) || course?.faculty_lead || 'Unknown',
            color: uiColors[idx % uiColors.length],
            totalSessions,
            presentCount,
            absentCount,
            attendancePercent,
            records: classRecords.map((rec: any) => {
              const dateStr = rec.date || '-';
              const dayName = dateStr !== '-'
                ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })
                : '-';
              return {
                id: rec.id,
                date: dateStr,
                day: dayName,
                time: rec.time || '-',
                status: rec.status as 'present' | 'absent',
              };
            }),
          };
        });

        setClassAttendance(classAttendanceList);

        // ── Build CourseData for backwards-compat (dashboard, courses page) ──
        // Aggregate per-course from the class-level attendance
        const courseAttendanceMap = new Map<string, { total: number; present: number }>();
        classAttendanceList.forEach((ca) => {
          const key = ca.courseName;
          const prev = courseAttendanceMap.get(key) || { total: 0, present: 0 };
          prev.total += ca.totalSessions;
          prev.present += ca.presentCount;
          courseAttendanceMap.set(key, prev);
        });

        const coursesById = new Map<string, any>();
        (enrollmentsData || []).forEach((enr: any) => {
          const course = Array.isArray(enr.courses) ? enr.courses[0] : enr.courses;
          if (course?.id) coursesById.set(course.id, course);
        });
        enrolledClasses.forEach((cls: any) => {
          const course = courseMap.get(cls.course_id);
          if (course?.id) coursesById.set(course.id, course);
        });

        const mappedCourses: CourseData[] = Array.from(coursesById.values()).map((course: any, idx: number) => {
          const courseAtt = courseAttendanceMap.get(course?.name) || { total: 0, present: 0 };
          const totalClasses = courseAtt.total;
          const attendedClasses = courseAtt.present;
          const attendancePercent = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
          const courseClasses = enrolledClasses.filter((cls: any) => cls.course_id === course?.id);
          const classNames = courseClasses.map((cls: any) => cls.name).filter(Boolean);
          const instructor = courseClasses
            .map((cls: any) => teacherMap.get(cls.teacher_id))
            .find(Boolean) || course?.faculty_lead || '';

          return {
            id: course.id,
            name: course.name || 'Untitled Course',
            code: course.course_code || '',
            instructor,
            attendance: attendancePercent,
            totalClasses,
            attendedClasses,
            color: uiColors[idx % uiColors.length],
            classNames,
            classIds: courseClasses.map((cls: any) => cls.id).filter(Boolean),
          };
        });

        setCourses(mappedCourses);

        const classIds = enrolledClassIds;

        let mappedAssignments: AssignmentData[] = [];
        if (classIds.length > 0) {
          const { data: assignmentsData, error: aError } = await supabase
            .from('assignments')
            .select('*, courses(name, course_code)')
            .in('class_id', classIds);

          if (aError) {
            console.error('Fetch Assignments Error:', aError);
          }

          const { data: submissionsData, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('student_id', currentUser.id)
            .order('submitted_at', { ascending: false });

          if (subError) {
            console.error('Fetch Submissions Error:', subError);
          }

          const toGradeStatus = (grade: number | null | undefined): 'pending' | 'partial' | 'completed' => {
            if (grade === null || grade === undefined) return 'pending';
            return grade >= 80 ? 'completed' : 'partial';
          };

          const submissionMap = (submissionsData || []).reduce((acc: Record<string, any[]>, sub: any) => {
            const isActualSubmission = !!sub.file_url || sub.status !== 'pending' || sub.grade !== null;
            if (!isActualSubmission) return acc;
            if (!acc[sub.assignment_id]) acc[sub.assignment_id] = [];
            acc[sub.assignment_id].push(sub);
            return acc;
          }, {});

          mappedAssignments = (assignmentsData || []).map((assign: any) => {
            const courseObj = Array.isArray(assign.courses) ? assign.courses[0] : assign.courses;
            const submissionHistoryRows = submissionMap[assign.id] || [];
            const sub = submissionHistoryRows[0];
            const grade = sub?.grade ?? null;
            
            return {
              id: assign.id,
              title: assign.title || 'Untitled',
              course: courseObj?.name || 'Uncategorized',
              courseCode: courseObj?.course_code || '---',
              deadline: assign.due_date || new Date().toISOString(),
              status: sub ? 'submitted' : 'pending',
              grade,
              gradeStatus: toGradeStatus(grade),
              feedback: sub?.feedback || null,
              gradedAt: sub?.graded_at || null,
              submittedOn: sub?.submitted_at || null,
              isPending: !sub,
              description: assign.description,
              fileUrl: sub?.file_url,
              portalOpen: assign.portal_open ?? true,
              isPastDue: assign.due_date ? new Date(assign.due_date) < new Date() : false,
              submissionHistory: submissionHistoryRows.map((row: any) => ({
                id: row.id,
                fileUrl: row.file_url || null,
                status: row.status || 'submitted',
                grade: row.grade ?? null,
                gradeStatus: toGradeStatus(row.grade),
                feedback: row.feedback || null,
                gradedAt: row.graded_at || null,
                submittedAt: row.submitted_at || null,
              })),
            };
          });
        }

        setAssignments(mappedAssignments.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
      } catch (err: any) {
        console.error('Data loading error:', err);
        setError(err.message || 'An error occurred while loading data.');
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    void fetchData();
  }, [user]);

  return {
    courses,
    assignments,
    classAttendance,
    profile,
    isLoading,
    error,
    refetch: fetchData,
  };
}
