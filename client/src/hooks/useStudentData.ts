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

export function useStudentData() {
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uiColors = ['#6a5182', '#8b6ca8', '#4b3f68', '#b096cc', '#778196'];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentUser = user;

    async function fetchData() {
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
    }

    void fetchData();
  }, [user]);

  return {
    courses,
    assignments,
    profile,
    isLoading,
    error,
  };
}
