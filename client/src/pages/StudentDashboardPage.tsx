import { useNavigate } from 'react-router-dom';
import { useStudentData } from '../hooks/useStudentData';
import StudentAssignmentCard from '../components/students/StudentAssignmentCard';
import StatCard from '../components/dashboard/StatCard';

import EnrolledCoursesList from '../components/courses/EnrolledCoursesList';

import AcademyCalendar from '../components/schedule/AcademyCalendar';

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { courses, assignments, profile: studentProfile, isLoading, error, refetch } = useStudentData();

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Dashboard...</div>;
  }

  if (error || !studentProfile) {
    return <div className="flex h-[300px] items-center justify-center text-[#232529] font-semibold">{error || "Failed to load profile"}</div>;
  }

  const totalCourses = courses.length;
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length;
  const submittedAssignments = assignments.filter((a) => a.status === "submitted").length;
  const completedGradeCount = assignments.filter((a) => a.gradeStatus === "completed").length;
  const partialGradeCount = assignments.filter((a) => a.gradeStatus === "partial").length;
  const gradedAssignmentCount = completedGradeCount + partialGradeCount;
  const statisticalGrade = gradedAssignmentCount > 0
    ? Math.round((completedGradeCount * 100 + partialGradeCount * 50) / gradedAssignmentCount)
    : 0;
  const avgAttendance = courses.length > 0 ? Math.round(
    courses.reduce((sum, c) => sum + c.attendance, 0) / courses.length
  ) : 100;

  const upcomingAssignments = assignments
    .filter((a) => a.status === "pending")
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#3E4FFF] to-[#5F73F5] rounded-[10px] p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </div>
        <p className="text-[#efe8f5] text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5">Academic Dashboard</p>
        <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight font-sans">{studentProfile.name}</h2>
        <p className="text-[#f5effa] text-[14px] mt-1.5 font-medium">{studentProfile.course} <span className="mx-2 text-[#bca6cf]">&bull;</span> {studentProfile.semester}</p>

        <div className="mt-7 flex gap-3 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11px] font-semibold uppercase tracking-wider border border-white/15">
            {studentProfile.batch}
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          label="My Courses"
          value={totalCourses.toString()}
          subContent="Current Semester"
        />
        <StatCard 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Due Work"
          value={pendingAssignments.toString()}
          isAccent
          subContent={<span className="text-[11px] font-semibold text-[#232529] bg-[#faf8fc] border border-[#E1E6EE] px-2.5 py-0.5 rounded-full tracking-wide">Requires attention</span>}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Completed"
          value={submittedAssignments.toString()}
          subContent="Successfully turned in"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>}
          label="Grade Score"
          value={`${statisticalGrade}%`}
          subContent={gradedAssignmentCount > 0 ? `${completedGradeCount} completed / ${partialGradeCount} partial` : 'No graded work yet'}
        />
        <StatCard 
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>}
          label="Attendance Avg"
          value={`${avgAttendance}%`}
          subContent="Across all subjects"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7">
        {/* Left Column: Upcoming assignments */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[19px] md:text-[21px] font-bold text-[#232529] tracking-tight">
              Timeline
            </h2>
            <button 
              onClick={() => navigate('/student/assignments')}
              className="text-[11.5px] font-semibold text-primary hover:opacity-80 transition-opacity uppercase tracking-wide cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((a) => (
                <StudentAssignmentCard key={a.id} assignment={a} compact={false} onSubmitted={refetch} />
              ))
            ) : (
              <div className="rounded-[10px] border border-dashed border-[#E1E6EE] bg-white p-7 text-center">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#232529]">No pending assignments</p>
                <p className="mt-1 text-[12.5px] text-[#64748b]">New assignments will appear here when they are assigned.</p>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <AcademyCalendar assignmentsList={assignments as any[]} />
          </div>
        </div>

        {/* Right Column: Enrolled courses */}
        <div className="flex flex-col gap-6">
          <EnrolledCoursesList courses={courses} />
        </div>
      </div>
    </div>
  );
}
