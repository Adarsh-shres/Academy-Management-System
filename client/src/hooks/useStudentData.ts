import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Define the mapped frontend types we need to build for the UI
export interface CourseData {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  attendance: number;       // calculated %
  totalClasses: number;     // calculated count
  attendedClasses: number;  // calculated count
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

  // Helper colors for UI matching the brand
  const uiColors = ["#6a5182", "#8b6ca8", "#4b3f68", "#b096cc", "#778196"];

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Fetch Profile Info (from users table, joining anything extra if available)
        // Since student_profiles doesn't exist, we map what we can from user.
        setProfile({
          id: user!.id,
          name: user!.name || 'Student',
          email: user!.email || '',
          avatar: (user!.name || 'S').substring(0, 2).toUpperCase(),
          course: 'Bachelor of Computer Science', // mocked fallback
          semester: '5th Semester', // mocked fallback
          rollNo: 'STD-' + user!.id.substring(0, 4).toUpperCase(),
          department: 'Computer Science',
          batch: '2023-2027',
          phone: 'N/A'
        });

        // 2. Fetch Enrollments (joined with courses) + Attendance
        // NOTE: These operations rely on the new schema tables you create.
        
        // Fetch enrollments
        const { data: enrollmentsData, error: enrollError } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', user!.id);
          
        if (enrollError && enrollError.code !== '42P01') console.error('Fetch Enrollments Error:', enrollError);

        // Fetch attendance for these courses
        const { data: attendanceData, error: attError } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', user!.id);
          
        if (attError && attError.code !== '42P01') console.error('Fetch Attendance Error:', attError);

        const mappedCourses: CourseData[] = (enrollmentsData || []).map((enr: any, idx: number) => {
          const course = enr.courses;
          // Calculate attendance metrics
          const courseAttendance = (attendanceData || []).filter((a: any) => a.course_id === course.id);
          const totalClasses = courseAttendance.length;
          const attendedClasses = courseAttendance.filter((a: any) => a.status === 'Present').length;
          const attendancePercent = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;
          
          return {
            id: course.id,
            name: course.name || 'Unknown Course',
            code: course.course_code || '---',
            instructor: course.faculty_lead || 'Unknown',
            credits: 3, // Missing from schema, default 3
            attendance: attendancePercent,
            totalClasses: totalClasses || 0,
            attendedClasses: attendedClasses || 0,
            color: uiColors[idx % uiColors.length],
            schedule: (course.schedule_days || []).join(', ') + ' — TBD'
          };
        });
        
        setCourses(mappedCourses);

        // 3. Fetch Assignment Submissions (joined with assignments)
        const { data: submissionsData, error: subError } = await supabase
          .from('assignment_submissions')
          .select('*, assignments(*)')
          .eq('student_id', user!.id);

        if (subError && subError.code !== '42P01') console.error('Fetch Submissions Error:', subError);

        const mappedAssignments: AssignmentData[] = (submissionsData || []).map((sub: any) => {
          const assign = sub.assignments;
          const isPending = sub.status === 'pending';
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
            isPending,
            description: assign.description,
            fileUrl: sub.file_url
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

    fetchData();
  }, [user]);

  return {
    courses,
    assignments,
    profile,
    isLoading,
    error
  };
}
