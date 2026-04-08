import { useState } from 'react';
import StatCard from '../components/StatCard';
import { useTeachers } from '../context/TeacherContext';
import type { Teacher, TeacherStatus } from '../types/teacher';

const STATUS_STYLES: Record<string, string> = {
  'Active':    'bg-[#d1fae5] text-[#065f46]',
  'On Leave':  'bg-[#fef3c7] text-[#92400e]',
  'Inactive':  'bg-[#f1f5f9] text-[#475569]',
};

const GRADIENTS = [
  'from-[#0ea5b0] to-[#006496]',
  'from-[#164e6a] to-[#0d3349]',
  'from-[#fbbf24] to-[#d97706]',
  'from-[#f87171] to-[#ef4444]',
];

/* ─── Component ─────────────────────────────────────────────── */

export default function TeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useTeachers();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /* ─── Add Teacher form state ───────────────────────────────── */
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newStatus, setNewStatus] = useState<TeacherStatus>('Active');

  const resetAddForm = () => {
    setNewName(''); setNewSubject(''); setNewDept(''); setNewStatus('Active');
  };

  const handleAddTeacher = () => {
    const name = newName.trim() || 'New Teacher';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const empNum = String(Math.floor(Math.random() * 900) + 100);
    addTeacher({
      name,
      initials,
      subject: newSubject || 'General Studies',
      department: newDept || 'Dept. of General Studies',
      employeeId: `FAC-00${empNum}`,
      status: newStatus,
      avatarGradient: GRADIENTS[teachers.length % GRADIENTS.length],
      totalClasses: 0,
      totalStudents: 0,
      avgAttendance: 0,
      upcomingSessions: 0,
      schedule: [],
      activities: [{ id: 1, text: 'Profile created', time: 'Just now', icon: '🆕' }],
    });
    resetAddForm();
    setIsAddModalOpen(false);
  };

  /* ─── Edit Teacher form state ──────────────────────────────── */
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<TeacherStatus>('Active');

  const openEditModal = () => {
    if (selectedTeacher) {
      setEditName(selectedTeacher.name);
      setEditSubject(selectedTeacher.subject);
      setEditDept(selectedTeacher.department);
      setEditStatus(selectedTeacher.status);
      setIsEditModalOpen(true);
    }
  };

  const handleEditTeacher = () => {
    if (selectedTeacher) {
      const initials = editName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const updates = {
        name: editName,
        subject: editSubject,
        department: editDept,
        status: editStatus,
        initials
      };
      updateTeacher(selectedTeacher.id, updates);
      setSelectedTeacher({ ...selectedTeacher, ...updates });
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-[26px_28px_40px] flex-1">
      {selectedTeacher ? (
        /* ── DETAIL PANEL ── */
        <div key={selectedTeacher.id} className="contents">
          {/* Back + Page Title */}
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => setSelectedTeacher(null)}
              className="w-10 h-10 flex items-center justify-center bg-[#f3eff7] border border-[#e2d9ed] rounded-sm hover:bg-[#6a5182] hover:text-white transition-colors text-[#6a5182] cursor-pointer shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teacher Profile</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Viewing details for {selectedTeacher.name}</p>
            </div>
          </div>

          {/* ── Header Card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-up" style={{ animationDelay: '75ms' }}>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-[100px] h-[100px] rounded-2xl bg-gradient-to-br ${selectedTeacher.avatarGradient} text-white text-[32px] font-bold flex items-center justify-center shrink-0`}>
                  {selectedTeacher.initials}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[selectedTeacher.status]}`}>
                  {selectedTeacher.status}
                </span>
              </div>
              {/* Info + Edit */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-sans text-[22px] font-extrabold text-[#0d3349] tracking-tight leading-tight">{selectedTeacher.name}</h2>
                    <p className="text-[13px] text-[#64748b] mt-1">{selectedTeacher.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openEditModal} className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this teacher profile permanently?')) {
                          deleteTeacher(selectedTeacher.id);
                          setSelectedTeacher(null);
                        }
                      }} 
                      className="flex items-center justify-center w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-sm transition-all cursor-pointer shrink-0 border border-rose-200"
                      title="Delete Profile"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
                  <DetailField label="Employee ID" value={selectedTeacher.employeeId} />
                  <DetailField label="Department" value={selectedTeacher.department} />
                  <DetailField label="Specialization" value={selectedTeacher.subject} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] animate-fade-up" style={{ animationDelay: '150ms' }}>
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Total Classes"
              value={String(selectedTeacher.totalClasses)}
              subContent={<><span className="text-[#10b981] font-bold">↑ 4</span> this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              label="Total Students"
              value={selectedTeacher.totalStudents.toLocaleString()}
              subContent="Across all courses"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Avg. Attendance"
              value={`${selectedTeacher.avgAttendance}%`}
              isAccent
              subContent={
                selectedTeacher.avgAttendance >= 85
                  ? <span className="text-[10.5px] font-bold text-[#6a5182] bg-[#f3eff7] px-[9px] py-0.5 rounded-sm tracking-wide">Above Target</span>
                  : <span className="text-[10.5px] font-bold text-[#92400e] bg-[#fef3c7] px-[9px] py-0.5 rounded-full tracking-wide">Below Target</span>
              }
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Upcoming Sessions"
              value={String(selectedTeacher.upcomingSessions)}
              subContent="Scheduled this week"
            />
          </div>

          {/* ── Two-Column: Schedule + Activity ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 animate-fade-up" style={{ animationDelay: '225ms' }}>
            {/* Class Schedule Table */}
            <div className="bg-white border border-[#e2e8f0] rounded-sm overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
                <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">Class Schedule</h3>
                <button className="bg-[#f3eff7] hover:bg-[#6a5182] text-[#6a5182] hover:text-white text-[13px] font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
                  This Week
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Day</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Time</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Course</th>
                      <th className="py-3 px-6 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeacher.schedule.map((row, i) => (
                      <tr key={i} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors">
                        <td className="py-3 px-6 text-[13px] font-semibold text-[#0d3349]">{row.day}</td>
                        <td className="py-3 px-6 text-[13px] text-[#475569] whitespace-nowrap">{row.time}</td>
                        <td className="py-3 px-6 text-[13px] font-medium text-[#1e293b]">{row.course}</td>
                        <td className="py-3 px-6">
                          <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold">{row.room}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-[22px] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">Recent Activity</h3>
                <span className="text-[12px] font-semibold text-[#6a5182] cursor-pointer hover:underline transition-all">View All</span>
              </div>
              <div className="flex flex-col gap-0 flex-1">
                {selectedTeacher.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 py-3 border-b border-[#e2e8f0] last:border-0">
                    <div className="w-[34px] h-[34px] bg-[#e6f7f9] rounded-[10px] flex items-center justify-center text-[16px] shrink-0">
                      {act.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1e293b] leading-snug">{act.text}</p>
                      <p className="text-[11px] text-[#64748b] mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
                {selectedTeacher.activities.length === 0 && (
                  <p className="text-[13px] text-[#64748b] italic py-3 text-center">No recent activity found.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Quick Actions Bar ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm animate-fade-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-sans text-[15px] font-bold text-[#0d3349] mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} label="Take Attendance" primary />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>} label="Create Assignment" />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>} label="Send Announcement" />
              <QuickActionBtn icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} label="View Reports" />
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST VIEW (Default) ── */
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teachers</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Manage and view faculty members</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Teacher
            </button>
          </div>

          {/* Summary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label="Total Faculty"
              value={String(teachers.length)}
              isAccent
              subContent={<><span className="text-[#10b981] font-bold">↑ 2</span> new this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              label="Total Classes"
              value="186"
              subContent={<><span className="text-[#10b981] font-bold">↑ 12</span> this semester</>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              label="Avg. Attendance"
              value="87.3%"
              subContent={<span className="text-[10.5px] font-bold text-[#006496] bg-[#e6f7f9] px-[9px] py-0.5 rounded-full tracking-wide">Above Target</span>}
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Upcoming Sessions"
              value="24"
              subContent="Scheduled this week"
            />
          </div>

          {/* Teacher List */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e2e8f0]">
              <h3 className="font-sans text-[15px] font-bold text-[#0d3349]">All Faculty Members</h3>
              <span className="text-[12px] text-[#64748b]">{teachers.length} members</span>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors group"
                >
                  {/* Avatar */}
                  <div className={`w-[40px] h-[40px] rounded-full bg-gradient-to-br ${teacher.avatarGradient} text-white text-[13px] font-bold flex items-center justify-center shrink-0`}>
                    {teacher.initials}
                  </div>

                  {/* Name + Subject */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#0d3349] group-hover:text-[#6a5182] transition-colors truncate">{teacher.name}</p>
                    <p className="text-[12px] text-[#64748b] mt-0.5 truncate">{teacher.subject}</p>
                  </div>

                  {/* Department */}
                  <div className="hidden md:block">
                    <span className="bg-[#e6f7f9] text-[#006496] px-2.5 py-1 rounded-md text-[12px] font-bold">{teacher.department}</span>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex min-w-[80px] justify-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[teacher.status]}`}>
                    {teacher.status}
                  </span>

                  {/* Chevron */}
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="text-[#cbd5e1] group-hover:text-[#6a5182] transition-colors shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* ─── Add Teacher Modal ─────────────────────────────── */}
      {isAddModalOpen && (
            <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }}>
              <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[18px] font-bold text-[#0d3349]">Add New Teacher</h3>
                  <button onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleAddTeacher(); }}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Full Name</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Dr. Ramesh Kumar" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Subject / Specialization</label>
                    <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Quantum Physics" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
                    <input type="text" value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="e.g. Dept. of Physics" className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
                    <div className="flex bg-[#f8fafc] rounded-lg p-1 gap-1 border border-[#cbd5e1] w-full">
                      {(['Active', 'On Leave', 'Inactive'] as TeacherStatus[]).map(s => (
                        <button key={s} type="button" onClick={() => setNewStatus(s)} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${newStatus === s ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">Add Teacher</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Edit Teacher Modal ────────────────────────────── */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[200] bg-[#0d3349]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsEditModalOpen(false)}>
              <div className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[18px] font-bold text-[#0d3349]">Edit Teacher Profile</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-[#64748b] hover:text-[#0d3349] transition-colors cursor-pointer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); handleEditTeacher(); }}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Full Name</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Subject / Specialization</label>
                    <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Department</label>
                    <input type="text" value={editDept} onChange={e => setEditDept(e.target.value)} className="bg-[#e2e8f0]/40 border-0 rounded-sm px-4 py-2.5 text-[14px] w-full outline-none focus:ring-2 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</label>
                    <div className="flex bg-[#f8fafc] rounded-lg p-1 gap-1 border border-[#cbd5e1] w-full">
                      {(['Active', 'On Leave', 'Inactive'] as TeacherStatus[]).map(s => (
                        <button key={s} type="button" onClick={() => setEditStatus(s)} className={`flex-1 rounded-sm py-1.5 text-[13px] transition-all cursor-pointer ${editStatus === s ? 'bg-white font-semibold text-[#6a5182] shadow-sm border border-[#e2e8f0]' : 'font-medium text-[#64748b] hover:text-[#4b3f68] hover:bg-black/5'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-[#f3eff7] border border-[#e2d9ed] hover:bg-[#6a5182] hover:text-white text-[#6a5182] text-[14px] font-semibold px-6 py-3 rounded-sm transition-all active:scale-[0.98] cursor-pointer">Cancel</button>
                    <button type="submit" className="flex-[2] bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-semibold px-6 py-3 rounded-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );
}

/* ─── Sub-Components ────────────────────────────────────────── */

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-[#1e293b] font-semibold text-[15px]">{value}</span>
    </div>
  );
}

function QuickActionBtn({ icon, label, primary }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return primary ? (
    <button className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer">
      {icon}
      {label}
    </button>
  ) : (
    <button className="flex items-center gap-2 bg-[#f3eff7] hover:bg-[#6a5182] active:bg-[#5b4471] text-[#6a5182] hover:text-white text-[13px] font-semibold px-4 py-2.5 rounded-sm transition-all cursor-pointer border border-[#e2d9ed]">
      {icon}
      {label}
    </button>
  );
}


