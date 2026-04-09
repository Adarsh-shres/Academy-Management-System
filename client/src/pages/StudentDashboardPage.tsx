import React from 'react';
import { useNavigate } from 'react-router-dom';
import { recentActivity } from '../data/studentMockData';
import { useStudentData } from '../hooks/useStudentData';
import StudentAssignmentCard from '../components/StudentAssignmentCard';
import StatCard from '../components/StatCard';

import EnrolledCoursesList from '../components/EnrolledCoursesList';

import AcademyCalendar from '../components/AcademyCalendar';

function ActivityItem({ item }: { item: { icon: string, text: string, time: string } }) {
  const iconMap: Record<string, React.ReactNode> = {
    check: <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    star: <svg className="w-4 h-4 text-[#4b3f68]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    bell: <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    calendar: <svg className="w-4 h-4 text-[#7c8697]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  };

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#f3eff7] last:border-0 hover:bg-[#faf8fc] px-3.5 rounded-[6px] transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-[8px] bg-[#f3eff7] flex items-center justify-center flex-shrink-0">
        {iconMap[item.icon as string] || iconMap.bell}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#4b3f68] leading-snug">{item.text}</p>
        <p className="text-[11px] font-medium text-[#778196] uppercase tracking-wide mt-1">{item.time}</p>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { courses, assignments, profile: studentProfile, isLoading, error } = useStudentData();

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Dashboard...</div>;
  }

  if (error || !studentProfile) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error || "Failed to load profile"}</div>;
  }

  const totalCourses = courses.length;
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length;
  const submittedAssignments = assignments.filter((a) => a.status === "submitted").length;
  const avgAttendance = courses.length > 0 ? Math.round(
    courses.reduce((sum, c) => sum + c.attendance, 0) / courses.length
  ) : 100;

  const upcomingAssignments = assignments
    .filter((a) => a.status === "pending")
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] rounded-[10px] p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </div>
        <p className="text-[#efe8f5] text-[11px] font-semibold uppercase tracking-[0.12em] mb-1.5">Academic Dashboard</p>
        <h2 className="text-[28px] md:text-[32px] font-bold tracking-tight font-sans">{studentProfile.name}</h2>
        <p className="text-[#f5effa] text-[14px] mt-1.5 font-medium">{studentProfile.course} <span className="mx-2 text-[#bca6cf]">&bull;</span> {studentProfile.semester}</p>

        <div className="mt-7 flex gap-3 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11px] font-semibold uppercase tracking-wider border border-white/15">
            Group: Morning - B
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11px] font-semibold uppercase tracking-wider border border-white/15">
            ID: {studentProfile.rollNo}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11px] font-semibold uppercase tracking-wider border border-white/15">
            {studentProfile.batch}
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
          subContent={<span className="text-[11px] font-semibold text-[#4b3f68] bg-[#faf8fc] border border-[#e7dff0] px-2.5 py-0.5 rounded-full tracking-wide">Requires attention</span>}
        />
        <StatCard 
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          label="Completed"
          value={submittedAssignments.toString()}
          subContent="Successfully turned in"
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
            <h2 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight">
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
            {upcomingAssignments.map((a) => (
              <StudentAssignmentCard key={a.id} assignment={a} compact={false} />
            ))}
          </div>
          
          <div className="pt-2">
            <AcademyCalendar assignmentsList={assignments as any[]} />
          </div>
        </div>

        {/* Right Column: Actions & Recent Activity */}
        <div className="flex flex-col gap-6">
          <EnrolledCoursesList courses={courses} />
          
          <div className="space-y-4">
            <h2 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight">
              Recent Activity
            </h2>
            <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_4px_12px_rgba(57,31,86,0.03)] p-2">
              {recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
