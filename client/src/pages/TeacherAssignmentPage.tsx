import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlusCircle, Search, FileText } from '../components/shared/icons';
import AssignmentCard from '../components/teachers/AssignmentCard';
import CreateAssignmentModal from '../components/teachers/CreateAssignmentModal';
import ViewSubmissionsModal from '../components/teachers/ViewSubmissionsModal';



/** Shows assignment tracking and submission status for teachers. */
export default function TeacherAssignmentPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissionsCountMap, setSubmissionsCountMap] = useState<Record<string, number>>({});
  const [totalStudents, setTotalStudents] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'GRADED'>('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const fetchAssignmentsData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`*, courses(name)`)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (!assignmentsData) return;

      setTotalStudents(1);

      const mappedAssignments = assignmentsData.map((a: any) => {
        let dueDateStr = '';
        if (a.due_date) {
          const raw = String(a.due_date);
          if (raw.includes('T')) {
            dueDateStr = raw;
          } else {
            const time = a.due_time || '23:59:00';
            dueDateStr = `${raw}T${time}`;
          }
        }

        return {
          id: a.id,
          title: a.title,
          course: a.courses?.name || 'Unknown Course',
          due_date: dueDateStr,
          due_time: a.due_time || '',
          created_at: a.created_at,
          class_id: a.class_id,
          course_id: a.course_id,  // ✅ added course_id
          portal_open: a.portal_open || false,
          attachment_url: a.attachment_url || '',
        };
      });

      // Auto-close portals for assignments whose due date has passed
      const currentTime = new Date();
      const expiredOpenPortals = mappedAssignments.filter(a => {
        if (!a.portal_open || !a.due_date) return false;
        const d = new Date(a.due_date);
        return !isNaN(d.getTime()) && d < currentTime;
      });

      if (expiredOpenPortals.length > 0) {
        await Promise.all(
          expiredOpenPortals.map(a =>
            supabase
              .from('assignments')
              .update({ portal_open: false })
              .eq('id', a.id)
          )
        );
        expiredOpenPortals.forEach(a => { a.portal_open = false; });
      }

      setAssignments(mappedAssignments);

      const assignIds = mappedAssignments.map(a => a.id);
      if (assignIds.length > 0) {
        const { data: subData } = await supabase
          .from('submissions')
          .select('assignment_id, id')
          .in('assignment_id', assignIds)
          .not('file_url', 'is', null); // Fixed: use file_url not attachment_url

        const countMap: Record<string, number> = {};
        if (subData) {
          subData.forEach((sub: any) => {
            countMap[sub.assignment_id] = (countMap[sub.assignment_id] || 0) + 1;
          });
        }
        setSubmissionsCountMap(countMap);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();

    const intervalId = setInterval(() => {
      fetchAssignmentsData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const processedAssignments = assignments.map(a => {
    const submitted = submissionsCountMap[a.id] || 0;
    const currentNow = new Date();
    const dueDate = a.due_date ? new Date(a.due_date) : null;
    const isDuePassed = dueDate && !isNaN(dueDate.getTime()) && dueDate < currentNow;

    let statusLabel = 'CLOSED';
    if (submitted > 0 && submitted >= (a.totalStudents || totalStudents) && (a.totalStudents || totalStudents) > 0) {
      statusLabel = 'GRADED';
    } else if (a.portal_open && !isDuePassed) {
      statusLabel = 'OPEN';
    }

    return { ...a, submitted, statusLabel };
  }).filter(a => {
    if (searchTerm && !a.title?.toLowerCase().includes(searchTerm.toLowerCase()) && !a.course?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (activeFilter !== 'ALL' && a.statusLabel !== activeFilter) return false;
    return true;
  });

  const now = new Date();
  const activeAssignmentsList = processedAssignments.filter(a => {
    if (!a.due_date) return true;
    const d = new Date(a.due_date);
    return isNaN(d.getTime()) || d >= now;
  });
  const otherAssignmentsList = processedAssignments.filter(a => {
    if (!a.due_date) return false;
    const d = new Date(a.due_date);
    return !isNaN(d.getTime()) && d < now;
  });

  const openCount = assignments.filter(a => {
    const dueDate = a.due_date ? new Date(a.due_date) : null;
    const isDuePassed = dueDate && !isNaN(dueDate.getTime()) && dueDate < now;
    return a.portal_open && !isDuePassed;
  }).length;
  const closedCount = assignments.filter(a => {
    const dueDate = a.due_date ? new Date(a.due_date) : null;
    const isDuePassed = dueDate && !isNaN(dueDate.getTime()) && dueDate < now;
    return !a.portal_open || isDuePassed;
  }).length;
  const gradedCount = assignments.filter(a => {
    const sub = submissionsCountMap[a.id] || 0;
    const currentTotal = a.totalStudents || totalStudents;
    return sub > 0 && sub >= currentTotal && currentTotal > 0;
  }).length;

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col min-w-0 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#4b3f68] tracking-tight">Assignments</h1>
          <p className="text-[#64748b] font-medium mt-1">Manage and track all your class assignments</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer whitespace-nowrap"
        >
          <PlusCircle size={16} />
          Create Assignment
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-sm border border-[#e7dff0] shadow-[0_10px_28px_rgba(57,31,86,0.06)] gap-4 mb-8">
        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#f6f2fb] border-transparent rounded-sm text-[13px] outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
          {[
            { label: 'ALL', count: assignments.length, id: 'ALL' },
            { label: 'OPEN', count: openCount, id: 'OPEN' },
            { label: 'CLOSED', count: closedCount, id: 'CLOSED' },
            { label: 'GRADED', count: gradedCount, id: 'GRADED' },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${activeFilter === filter.id
                ? 'bg-[#6a5182] text-white border border-[#6a5182] shadow-sm'
                : 'bg-white border border-[#e7dff0] text-[#64748b] hover:bg-[#f3eff7] hover:border-[#d8c8e9]'
                }`}
            >
              {filter.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#475569]'
                }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white p-5 h-[180px] rounded-sm border border-[#e7dff0]"></div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-[#e7dff0] pb-2">
              <h2 className="text-[16px] font-bold text-[#4b3f68]">Active Assignments</h2>
              <span className="bg-[#e2d9ed] text-[#4b3f68] text-[11px] font-bold px-2 py-0.5 rounded-sm">
                {activeAssignmentsList.length}
              </span>
            </div>
            {activeAssignmentsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAssignmentsList.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    totalStudents={assignment.totalStudents || totalStudents}
                    submittedCount={assignment.submitted}
                    onViewSubmissions={setSelectedAssignment}
                    onRefresh={fetchAssignmentsData}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-dashed border-[#d8c8e9] rounded-sm text-center">
                <div className="bg-[#f3eff7] p-4 rounded-full mb-3"><FileText size={24} className="text-[#6a5182]" /></div>
                <h3 className="text-[15px] font-bold text-[#4b3f68] mb-1">No active assignments</h3>
                <p className="text-[13px] text-[#64748b]">You don't have any active assignments matching this filter.</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-[#e7dff0] pb-2">
              <h2 className="text-[16px] font-bold text-[#4b3f68]">Other Assignments</h2>
              <span className="bg-[#e2e8f0] text-[#475569] text-[11px] font-bold px-2 py-0.5 rounded-sm">
                {otherAssignmentsList.length}
              </span>
            </div>
            {otherAssignmentsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherAssignmentsList.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    totalStudents={assignment.totalStudents || totalStudents}
                    submittedCount={assignment.submitted}
                    onViewSubmissions={setSelectedAssignment}
                    onRefresh={fetchAssignmentsData}
                  />
                ))}
              </div>
            ) : (
              <div className="text-[13px] font-medium text-[#94a3b8] italic px-2">
                No past assignments found.
              </div>
            )}
          </section>
        </div>
      )}

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchAssignmentsData}
      />
      <ViewSubmissionsModal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignment={selectedAssignment}
      />
    </div>
  );
}
