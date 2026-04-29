import { useState, useMemo } from "react";
import { useStudentData } from "../hooks/useStudentData";
import StudentAssignmentCard from "../components/students/StudentAssignmentCard";
import type { Assignment } from "../components/students/StudentAssignmentCard";

export default function StudentAssignmentsPage() {
  const { assignments, isLoading, error } = useStudentData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | submitted
  const [subjectFilter, setSubjectFilter] = useState("all");

  const allSubjects = useMemo(() => {
    return Array.from(new Set(assignments.map((a) => a.course))).sort();
  }, [assignments]);

  const filtered = assignments.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.course.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    const matchSubject = subjectFilter === "all" || a.course === subjectFilter;
    return matchSearch && matchFilter && matchSubject;
  });

  const groupedAssignments = useMemo(() => {
    return filtered.reduce((acc, assignment) => {
      if (!acc[assignment.course]) acc[assignment.course] = [];
      acc[assignment.course].push(assignment);
      return acc;
    }, {} as Record<string, Assignment[]>);
  }, [filtered]);

  const filterOptions = [
    { value: "all", label: "All", count: assignments.length },
    { value: "pending", label: "Pending", count: assignments.filter((a) => a.status === "pending").length },
    { value: "submitted", label: "Submitted", count: assignments.filter((a) => a.status === "submitted").length },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10 flex-1 min-w-0 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Assignments
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">{assignments.length} total assignments</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[200px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">
          Loading assignments...
        </div>
      ) : error ? (
        <div className="flex h-[200px] items-center justify-center text-[#4b3f68] font-semibold">
          {error}
        </div>
      ) : (
        <>
          {/* Search + Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#e7dff0] rounded-[8px] px-4 py-2.5 shadow-[0_1px_4px_rgba(57,31,86,0.02)] transition-shadow focus-within:shadow-[0_2px_10px_rgba(57,31,86,0.06)] focus-within:border-[#d8c8e9] w-full">
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

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto">
          {/* Subject Dropdown */}
          <div className="bg-white border border-[#e7dff0] rounded-[8px] px-3 flex items-center shadow-[0_1px_4px_rgba(57,31,86,0.02)] w-full sm:w-auto shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#b096cc] mr-2 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <select 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="py-2.5 text-[13px] text-[#4b3f68] font-bold uppercase tracking-wide outline-none bg-transparent cursor-pointer truncate flex-1 min-w-[130px]"
            >
              <option value="all">ALL SUBJECTS</option>
              {allSubjects.map(sub => (
                 <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 bg-white border border-[#e7dff0] rounded-[8px] p-1.5 shadow-[0_1px_4px_rgba(57,31,86,0.02)] w-full sm:w-auto overflow-x-auto shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[6px] text-[12px] font-semibold transition-all uppercase tracking-wide whitespace-nowrap ${
                filter === opt.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-[#778196] hover:bg-[#faf8fc]"
              }`}
            >
              {opt.label}
              <span
                className={`text-[10px] px-2 py-[2px] rounded-full font-semibold ${
                  filter === opt.value ? "bg-white/20 text-white" : "bg-[#f3eff7] text-[#4b3f68]"
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Grouped Assignments Content */}
      <div className="flex flex-col gap-8 mt-2">
        {Object.entries(groupedAssignments).map(([subject, assignmentsInSubject]) => (
          <div key={subject} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="font-sans text-[19px] md:text-[21px] font-bold text-[#4b3f68] tracking-tight">{subject}</h3>
              <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-[6px] bg-[#fbf8fe] text-[#8b6ca8] border border-[#f3eff7] uppercase tracking-wide">
                {assignmentsInSubject.length}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {assignmentsInSubject.map((a) => (
                <StudentAssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedAssignments).length === 0 && (
          <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-10 text-center">
            <p className="text-[13px] font-semibold text-[#7c8697] uppercase tracking-wider">No assignments found.</p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
