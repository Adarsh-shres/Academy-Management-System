import React, { useState } from 'react';
import { courses, assignments, recentActivity, studentProfile } from '../data/studentMockData';
import StudentAssignmentCard from '../components/StudentAssignmentCard';
import StatCard from '../components/StatCard';
import type { Assignment } from '../components/StudentAssignmentCard';

function AcademyCalendarModal({ isOpen, onClose, assignmentsList }: { isOpen: boolean, onClose: () => void, assignmentsList: Assignment[] }) {
  if (!isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getDayStatus = (day: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const deadlineInfo = assignmentsList.find(a => {
      const d = new Date(a.deadline);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });

    if (!deadlineInfo) return null;

    if (deadlineInfo.status === "submitted") return "bg-[#10b981] text-white shadow-sm ring-1 ring-[#047857]";
    if (new Date(deadlineInfo.deadline) < today && deadlineInfo.status !== "submitted") return "bg-[#ef4444] text-white shadow-sm ring-1 ring-[#b91c1c]";
    return "bg-[#f59e0b] text-white shadow-sm ring-1 ring-[#b45309]";
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = today.toLocaleString("default", { month: "long" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="fixed inset-0 bg-[#391f56]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-[0_20px_40px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden border border-[#e7dff0]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-9 h-9 rounded-[8px] bg-white/20 flex items-center justify-center text-[18px]">📅</span>
            <h2 className="text-[20px] font-extrabold tracking-tight">Academy Calendar</h2>
          </div>
          <p className="text-[#efe8f5] text-[13px] font-medium">{monthName} {year} Schedule</p>
        </div>

        {/* Calendar Grid */}
        <div className="p-7">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em] pb-2">
                {d}
              </div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const statusCls = getDayStatus(day);
              const isToday = day === today.getDate() && month === today.getMonth();

              return (
                <div
                  key={day}
                  className={`
                    h-[38px] flex items-center justify-center rounded-[8px] text-[13px] font-extrabold transition-all cursor-default
                    ${statusCls ? statusCls : isToday ? "bg-[#f3eff7] text-primary border border-[#e7dff0]" : "text-[#4b3f68] hover:bg-[#faf8fc]"}
                  `}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-[#f3eff7]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-[10.5px] font-bold text-[#778196] uppercase tracking-wide">Done</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-[10.5px] font-bold text-[#778196] uppercase tracking-wide">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-[10.5px] font-bold text-[#778196] uppercase tracking-wide">Missed</span>
            </div>
          </div>
        </div>

        <div className="px-7 pb-7">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-[8px] bg-primary text-white text-[13px] font-bold hover:opacity-90 transition-opacity uppercase tracking-wider"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: { icon: string, text: string, time: string } }) {
  const iconMap: Record<string, React.ReactNode> = {
    check: <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
    star: <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    bell: <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    calendar: <svg className="w-4 h-4 text-[#7c8697]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  };

  return (
    <div className="flex items-start gap-[14px] py-[15px] border-b border-[#f3eff7] last:border-0 hover:bg-[#faf8fc] px-[14px] rounded-sm transition-colors cursor-pointer">
      <div className="w-[34px] h-[34px] rounded-[8px] bg-[#f3eff7] flex items-center justify-center flex-shrink-0">
        {iconMap[item.icon as string] || iconMap.bell}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-extrabold text-[#4b3f68] leading-tight">{item.text}</p>
        <p className="text-[10px] font-bold text-[#778196] uppercase tracking-wide mt-1">{item.time}</p>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const totalCourses = courses.length;
  const pendingAssignments = assignments.filter((a) => a.status === "pending").length;
  const submittedAssignments = assignments.filter((a) => a.status === "submitted").length;
  const avgAttendance = Math.round(
    courses.reduce((sum, c) => sum + c.attendance, 0) / courses.length
  );

  const upcomingAssignments = assignments
    .filter((a) => a.status === "pending")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3) as Assignment[];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[1200px]">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] rounded-sm p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </div>
        <p className="text-[#efe8f5] text-[11.5px] font-bold uppercase tracking-[0.1em] mb-[6px]">Academic Dashboard</p>
        <h2 className="text-[32px] font-extrabold tracking-tight font-sans">{studentProfile.name}</h2>
        <p className="text-[#f5effa] text-[14px] mt-1.5 font-medium">{studentProfile.course} <span className="mx-2 text-[#bca6cf]">•</span> {studentProfile.semester}</p>

        <div className="mt-8 flex gap-3 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11.5px] font-bold uppercase tracking-wider border border-white/20">
            Group: {studentProfile.classGroup}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11.5px] font-bold uppercase tracking-wider border border-white/20">
            ID: {studentProfile.rollNo}
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-[6px] px-4 py-[7px] text-[11.5px] font-bold uppercase tracking-wider border border-white/20">
            {studentProfile.batch}
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
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
          subContent={<span className="text-[10.5px] font-bold text-[#f59e0b] bg-[#fffbeb] px-[9px] py-0.5 rounded-full tracking-wide">Requires attention</span>}
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column: Upcoming assignments */}
        <div className="space-y-[18px]">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">
              Timeline
            </h2>
            <button className="text-[11.5px] font-bold text-primary hover:opacity-80 transition-opacity uppercase tracking-wide">
              Global View
            </button>
          </div>
          <div className="space-y-[14px]">
            {upcomingAssignments.map((a) => (
              <StudentAssignmentCard key={a.id} assignment={a} compact={false} />
            ))}
          </div>
        </div>

        {/* Right Column: Actions & Recent Activity */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions / Academy Calendar Button */}
          <div className="space-y-[18px]">
            <h2 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">
              Utilities
            </h2>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="w-full bg-[#f3eff7] group hover:bg-[#e7dff0] p-[22px] rounded-sm transition-all flex items-center justify-between border border-[#e7dff0]"
            >
              <div className="flex items-center gap-[18px]">
                <div className="w-[42px] h-[42px] rounded-[8px] bg-white flex items-center justify-center text-[20px] group-hover:scale-105 transition-transform shadow-sm">
                  📅
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-extrabold text-primary uppercase tracking-wide leading-none">Academy Calendar</p>
                  <p className="text-[11px] font-medium text-[#7c8697] mt-1.5">Click to view schedule</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-[#8b6ca8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-[18px]">
            <h2 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">
              Recent Activity
            </h2>
            <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_12px_rgba(57,31,86,0.03)] p-2">
              {recentActivity.map((item) => (
                <ActivityItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Academy Calendar Modal Component */}
      <AcademyCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        assignmentsList={assignments as Assignment[]}
      />
    </div>
  );
}
