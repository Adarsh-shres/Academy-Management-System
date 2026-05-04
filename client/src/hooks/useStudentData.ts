import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { buildStudentAvatar, STUDENT_PROFILE_SELECT, type StudentProfileRow } from '../lib/studentProfiles';

export interface CourseData {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  attendance: number;
  totalClasses: number;
  attendedClasses: number;
  color: string;
  schedule: string;
}

export interface AssignmentData {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  deadline: string;
  status: 'pending' | 'submitted';
  marks: string;
  grade: string | null;
  submittedOn: string | null;
  isPending: boolean;
  description?: string;
  fileUrl?: string;
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
          course: profileRow?.course || 'Course not set yet',
          semester: 'Semester not set',
          rollNo: `STD-${currentUser.id.substring(0, 4).toUpperCase()}`,
          department: profileRow?.department || 'Department not set yet',
          batch: enrolledYear ? `${enrolledYear}-${enrolledYear + 4}` : 'Batch not set',
          phone: profileRow?.mobile_no || 'N/A',
        });

        // ── Fetch classes where this student is enrolled (student_ids contains user id) ──
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, course_id, teacher_id, student_ids')
          .contains('student_ids', [currentUser.id]);

        if (classesError && classesError.code !== '42P01') {
          console.error('Fetch Classes Error:', classesError);
        }

        // Deduplicate classes by ID to prevent the same class from showing twice
        const rawClasses = classesData || [];
        const seenClassIds = new Set<string>();
        const enrolledClasses = rawClasses.filter((cls: any) => {
          if (seenClassIds.has(cls.id)) return false;
          seenClassIds.add(cls.id);
          return true;
        });

        const enrolledClassIds = enrolledClasses.map((cls: any) => cls.id);

        // ── Fetch course details for enrolled classes ──
        const enrolledCourseIds = Array.from(new Set(enrolledClasses.map((cls: any) => cls.course_id).filter(Boolean)));
        const courseMap = new Map<string, any>();

        if (enrolledCourseIds.length > 0) {
          const { data: coursesData } = await supabase
            .from('courses')
            .select('id, name, course_code, faculty_lead')
            .in('id', enrolledCourseIds);

          (coursesData || []).forEach((c: any) => courseMap.set(c.id, c));
        }

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

        // Also try enrollments table for course list (fallback)
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', currentUser.id);

        if (enrollError && enrollError.code !== '42P01') {
          console.error('Fetch Enrollments Error:', enrollError);
        }

        let mappedCourses: CourseData[];

        if (enrollmentsData && enrollmentsData.length > 0) {
          // Use enrollments table if available
          mappedCourses = enrollmentsData.map((enr: any, idx: number) => {
            const course = enr.courses;
            // Use class-based attendance instead of course_id-based attendance
            const courseAtt = courseAttendanceMap.get(course?.name) || { total: 0, present: 0 };
            const totalClasses = courseAtt.total;
            const attendedClasses = courseAtt.present;
            const attendancePercent = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
            return {
              id: course.id,
              name: course.name || 'Unknown Course',
              code: course.course_code || '---',
              instructor: course.faculty_lead || 'Unknown',
              credits: 3,
              attendance: attendancePercent,
              totalClasses,
              attendedClasses,
              color: uiColors[idx % uiColors.length],
              schedule: 'See assigned class schedule',
            };
          });
        } else {
          // Build courses list from enrolled classes
          const seenCourses = new Set<string>();
          mappedCourses = [];
          enrolledClasses.forEach((cls: any, idx: number) => {
            const course = courseMap.get(cls.course_id);
            if (!course || seenCourses.has(course.id)) return;
            seenCourses.add(course.id);
            const courseAtt = courseAttendanceMap.get(course.name) || { total: 0, present: 0 };
            const totalClasses = courseAtt.total;
            const attendedClasses = courseAtt.present;
            const attendancePercent = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
            mappedCourses.push({
              id: course.id,
              name: course.name || 'Unknown Course',
              code: course.course_code || '---',
              instructor: teacherMap.get(cls.teacher_id) || course.faculty_lead || 'Unknown',
              credits: 3,
              attendance: attendancePercent,
              totalClasses,
              attendedClasses,
              color: uiColors[mappedCourses.length % uiColors.length],
              schedule: 'See assigned class schedule',
            });
          });
        }

        setCourses(mappedCourses);

        const { data: submissionsData, error: subError } = await supabase
          .from('assignment_submissions')
          .select('*, assignments(*)')
          .eq('student_id', currentUser.id);

        if (subError && subError.code !== '42P01') {
          console.error('Fetch Submissions Error:', subError);
        }

        const mappedAssignments: AssignmentData[] = (submissionsData || []).map((sub: any) => {
          const assign = sub.assignments;
          return {
            id: sub.id,
            title: assign.title || 'Untitled',
            course: assign.course || 'Uncategorized',
            courseCode: assign.course?.split(' ')[0] || assign.course || '---',
            deadline: assign.due_date || new Date().toISOString(),
            status: sub.status,
            marks: sub.marks_awarded ? `${sub.marks_awarded} marks` : 'Pending',
            grade: sub.grade || null,
            submittedOn: sub.submitted_at || null,
            isPending: sub.status === 'pending',
            description: assign.description,
            fileUrl: sub.file_url,
          };
        });

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
