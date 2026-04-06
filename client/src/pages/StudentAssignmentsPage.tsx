import { useState } from "react";
import { assignments } from "../data/studentMockData";
import StudentAssignmentCard from "../components/StudentAssignmentCard";
import type { Assignment } from "../components/StudentAssignmentCard";

export default function StudentAssignmentsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | submitted

  const filtered = assignments.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const openAssignments = filtered.filter((a) => a.status === "pending") as Assignment[];
  const closedAssignments = filtered.filter((a) => a.status === "submitted") as Assignment[];

  const filterOptions = [
    { value: "all", label: "All", count: assignments.length },
    { value: "pending", label: "Pending", count: assignments.filter((a) => a.status === "pending").length },
    { value: "submitted", label: "Submitted", count: assignments.filter((a) => a.status === "submitted").length },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[1200px]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Assignments
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{assignments.length} total assignments this semester</p>
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

      {/* Open Assignments */}
      <div className="space-y-[18px]">
        <div className="flex items-center gap-[12px]">
          <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">Open Assignments</h3>
          <span className="text-[11.5px] font-bold px-[10px] py-[3px] rounded-[6px] bg-[#fffbeb] text-[#d97706] border border-[#fef3c7] uppercase tracking-wide">
            {openAssignments.length}
          </span>
        </div>

        {openAssignments.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-10 text-center">
            <p className="text-[32px] mb-3">🎉</p>
            <p className="text-[13px] font-extrabold text-[#7c8697] uppercase tracking-wider">No pending assignments!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {openAssignments.map((a) => (
              <StudentAssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>

      {/* Closed / Submitted Assignments */}
      <div className="space-y-[18px] mt-2">
        <div className="flex items-center gap-[12px]">
          <h3 className="font-sans text-[20px] md:text-[22px] font-extrabold text-[#4b3f68] tracking-tight">Submitted Assignments</h3>
          <span className="text-[11.5px] font-bold px-[10px] py-[3px] rounded-[6px] bg-[#ecfdf5] text-[#059669] border border-[#d1fae5] uppercase tracking-wide">
            {closedAssignments.length}
          </span>
        </div>

        {closedAssignments.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-10 text-center">
            <p className="text-[13px] text-[#778196] font-medium italic">No submitted assignments found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {closedAssignments.map((a) => (
              <StudentAssignmentCard key={a.id} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
