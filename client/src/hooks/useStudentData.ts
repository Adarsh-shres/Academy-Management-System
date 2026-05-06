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
  portalOpen: boolean;
  isPastDue: boolean;
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

export function useStudentData() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
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

        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', currentUser.id);

        if (enrollError && enrollError.code !== '42P01') {
          console.error('Fetch Enrollments Error:', enrollError);
        }

        const { data: attendanceData, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', currentUser.id);

        if (attError && attError.code !== '42P01') {
          console.error('Fetch Attendance Error:', attError);
        }

        const mappedCourses: CourseData[] = (enrollmentsData || []).map((enr: any, idx: number) => {
          const course = enr.courses;
          const courseAttendance = (attendanceData || []).filter((a: any) => a.course_id === course.id);
          const totalClasses = courseAttendance.length;
          const attendedClasses = courseAttendance.filter((a: any) => a.status === 'Present').length;
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

        setCourses(mappedCourses);

        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, courses(name, course_code)')
          .contains('student_ids', [currentUser.id]);

        if (classesError) {
          console.error('Fetch Classes Error:', classesError);
        }

        const classIds = (classesData || []).map(c => c.id);

        let mappedAssignments: AssignmentData[] = [];
        if (classIds.length > 0) {
          const { data: assignmentsData, error: aError } = await supabase
            .from('assignments')
            .select('*')
            .in('class_id', classIds);

          if (aError) {
            console.error('Fetch Assignments Error:', aError);
          }

          const { data: submissionsData, error: subError } = await supabase
            .from('submissions')
            .select('*')
            .eq('student_id', currentUser.id);

          if (subError) {
            console.error('Fetch Submissions Error:', subError);
          }

          const submissionMap = (submissionsData || []).reduce((acc: any, sub: any) => {
            acc[sub.assignment_id] = sub;
            return acc;
          }, {});

          mappedAssignments = (assignmentsData || []).map((assign: any) => {
            const classObj = (classesData || []).find(c => c.id === assign.class_id);
            const courseObj = classObj?.courses;
            const sub = submissionMap[assign.id];
            
            return {
              id: assign.id,
              title: assign.title || 'Untitled',
              course: courseObj?.name || 'Uncategorized',
              courseCode: courseObj?.course_code || '---',
              deadline: assign.due_date || new Date().toISOString(),
              status: sub ? 'submitted' : 'pending',
              marks: sub?.grade !== null && sub?.grade !== undefined ? `${sub.grade} marks` : 'Pending',
              grade: sub?.grade !== undefined ? String(sub.grade) : null,
              submittedOn: sub?.submitted_at || null,
              isPending: !sub,
              description: assign.description,
              fileUrl: sub?.file_url,
              portalOpen: assign.portal_open ?? true,
              isPastDue: assign.due_date ? new Date(assign.due_date) < new Date() : false,
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
    profile,
    isLoading,
    error,
    refetch: fetchData,
  };
}
