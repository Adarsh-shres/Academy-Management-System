import { useState } from "react";

type AssignmentStatus = 'Pending Grading' | 'Ready for Grading' | 'Graded' | 'Overdue' | 'Draft';

interface Assignment {
  id: string;
  title: string;
  course: string;
  unit: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: string; // AssignmentStatus
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Add and Subtract Numbers', course: 'Math 101', unit: 'Unit 2', dueDate: '23 Dec 2026', submitted: 18, total: 25, status: 'Pending Grading' },
  { id: '2', title: 'Motion and Forces Lab Report', course: 'Math 102', unit: 'Unit 2', dueDate: '20 Dec 2026', submitted: 25, total: 25, status: 'Ready for Grading' },
  { id: '3', title: 'Linear Equations Worksheet', course: 'Math 104', unit: 'Unit 1', dueDate: '13 Dec 2026', submitted: 25, total: 25, status: 'Graded' },
  { id: '4', title: 'Quadratic Formula Practice', course: 'Math 103', unit: 'Unit 3', dueDate: '10 Dec 2026', submitted: 10, total: 22, status: 'Overdue' },
  { id: '5', title: 'Geometry Basics', course: 'Math 101', unit: 'Unit 3', dueDate: '30 Dec 2026', submitted: 0, total: 25, status: 'Draft' },
  { id: '6', title: 'Trigonometry Introduction', course: 'Math 102', unit: 'Unit 4', dueDate: '05 Jan 2027', submitted: 0, total: 20, status: 'Draft' },
];

function TeacherAssignmentCard({ assignment }: { assignment: Assignment }) {
  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending Grading':
        return 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]';
      case 'Ready for Grading':
      case 'Graded':
        return 'bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]';
      case 'Overdue':
        return 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]';
      default:
        return 'bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]';
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] hover:shadow-[0_4px_16px_rgba(57,31,86,0.06)] transition-all p-5 flex flex-col justify-between group">
      <div>
        <div className="flex justify-between items-start mb-3 gap-2">
          <h4 className="font-sans text-[16px] font-extrabold text-[#4b3f68] leading-tight group-hover:text-primary transition-colors">
            {assignment.title}
          </h4>
          <span className={`text-[10px] font-bold uppercase tracking-[0.05em] px-2 py-[2px] rounded-full flex-shrink-0 ${getBadgeClass(assignment.status)}`}>
            {assignment.status}
          </span>
        </div>
        
        <div className="text-[12px] font-semibold text-[#7c8697] mb-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[#4b3f68]">{assignment.course}</span>
          <span className="text-[#cbd5e1]">•</span>
          <span>{assignment.unit}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-t border-dashed border-[#e7dff0]">
          <span className="text-[12px] font-bold text-[#778196] uppercase tracking-wide">Due Date</span>
          <span className="text-[13px] font-semibold text-[#4b3f68]">{assignment.dueDate}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-t border-dashed border-[#e7dff0] mb-4">
          <span className="text-[12px] font-bold text-[#778196] uppercase tracking-wide">Submitted</span>
          <span className="text-[13px] font-bold text-primary">{assignment.submitted} / {assignment.total}</span>
        </div>
      </div>
      
      <button className="w-full py-[12px] rounded-sm text-[13px] font-bold text-white bg-primary hover:opacity-90 transition-opacity uppercase tracking-wider">
        View Submissions
      </button>
    </div>
  );
}

export default function TeacherAssignments() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_ASSIGNMENTS.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || a.status.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  const needingAction = filtered.filter((a) => a.status === "Pending Grading" || a.status === "Ready for Grading");
  const otherAssignments = filtered.filter((a) => a.status !== "Pending Grading" && a.status !== "Ready for Grading");

  const filterOptions = [
    { value: "all", label: "All", count: MOCK_ASSIGNMENTS.length },
    { value: "pending grading", label: "Pending", count: MOCK_ASSIGNMENTS.filter((a) => a.status === "Pending Grading").length },
    { value: "ready for grading", label: "Ready", count: MOCK_ASSIGNMENTS.filter((a) => a.status === "Ready for Grading").length },
    { value: "graded", label: "Graded", count: MOCK_ASSIGNMENTS.filter((a) => a.status === "Graded").length },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-6 md:p-8 flex-1 min-w-0 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Assignments
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Manage and track all your class assignments</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button className="flex items-center gap-2 bg-primary hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Assignment
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#e7dff0] rounded-sm px-4 py-[10px] shadow-[0_2px_10px_rgba(57,31,86,0.02)] transition-shadow focus-within:shadow-[0_4px_16px_rgba(57,31,86,0.06)] focus-within:border-[#d8c8e9] w-full">
          <svg className="w-4 h-4 text-[#7c8697]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[13px] text-[#4b3f68] placeholder-[#cbd5e1] outline-none bg-transparent font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#cbd5e1] hover:text-[#7c8697] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 bg-white border border-[#e7dff0] rounded-sm p-1.5 shadow-[0_2px_10px_rgba(57,31,86,0.02)] w-full md:w-auto overflow-x-auto">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[12px] font-bold transition-all uppercase tracking-wide whitespace-nowrap ${
                filter === opt.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-[#778196] hover:bg-[#faf8fc]"
              }`}
            >
              {opt.label}
              <span
                className={`text-[10px] px-2 py-[2px] rounded-full font-extrabold ${
                  filter === opt.value ? "bg-white/20 text-white" : "bg-[#f3eff7] text-[#4b3f68]"
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Need Action */}
      <div className="space-y-[18px]">
        <div className="flex items-center gap-[12px]">
          <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">Active Assignments</h3>
          <span className="text-[11.5px] font-bold px-[10px] py-[3px] rounded-[6px] bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] uppercase tracking-wide">
            {needingAction.length}
          </span>
        </div>

        {needingAction.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-10 text-center">
            <p className="text-[32px] mb-3">🎉</p>
            <p className="text-[13px] font-extrabold text-[#7c8697] uppercase tracking-wider">No active assignments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {needingAction.map((a) => (
              <TeacherAssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>

      {/* Other Assignments */}
      <div className="space-y-[18px] mt-2">
        <div className="flex items-center gap-[12px]">
          <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">Other Assignments</h3>
          <span className="text-[11.5px] font-bold px-[10px] py-[3px] rounded-[6px] bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] uppercase tracking-wide">
            {otherAssignments.length}
          </span>
        </div>

        {otherAssignments.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-10 text-center">
            <p className="text-[13px] text-[#778196] font-medium italic">No other assignments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherAssignments.map((a) => (
              <TeacherAssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
