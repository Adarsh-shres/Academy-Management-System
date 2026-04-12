import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { useTeachers } from '../context/TeacherContext';
import type { Teacher, TeacherStatus } from '../types/teacher';
import { provisionUser } from '../lib/userProvisioning';
import AppModal from '../components/AppModal';

const STATUS_STYLES: Record<TeacherStatus, { bg: string; text: string }> = {
  Active: { bg: 'bg-[#e7f8ef]', text: 'text-[#15803d]' },
  'On Leave': { bg: 'bg-[#fff4e5]', text: 'text-[#b45309]' },
  Inactive: { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]' },
};

const AVATAR_TILES = [
  'bg-[#6a5182]',
  'bg-[#8b6ca8]',
  'bg-[#4b3f68]',
  'bg-[#7b6591]',
  'bg-[#5b4471]',
  'bg-[#8f77a9]',
];

function avatarTileColor(id: string) {
  const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % AVATAR_TILES.length : 0;
  return AVATAR_TILES[index];
}

export default function TeachersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { teachers, refreshTeachers, updateTeacher, deleteTeacher } = useTeachers();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newStatus, setNewStatus] = useState<TeacherStatus>('Active');
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [createTeacherError, setCreateTeacherError] = useState('');
  const [createTeacherSuccess, setCreateTeacherSuccess] = useState('');

  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<TeacherStatus>('Active');

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewSubject('');
    setNewDept('');
    setNewStatus('Active');
    setCreateTeacherError('');
    setCreateTeacherSuccess('');
  };

  const handleAddTeacher = async () => {
    const name = newName.trim() || 'New Teacher';
    const email = newEmail.trim().toLowerCase();
    const password = newPassword.trim();

    if (!email || !password) {
      setCreateTeacherError('Email and password are required to create a teacher login.');
      return;
    }

    setIsCreatingTeacher(true);
    setCreateTeacherError('');
    setCreateTeacherSuccess('');

    try {
      await provisionUser({
        email,
        password,
        fullName: name,
        role: 'teacher',
        profile: {
          subject: newSubject || 'General Studies',
          department: newDept || 'Dept. of General Studies',
          status: newStatus,
        },
      });

      await refreshTeachers();
      setCreateTeacherSuccess(`Teacher account created for ${name}.`);
      resetAddForm();
      setIsAddModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create teacher account.';
      setCreateTeacherError(message);
    } finally {
      setIsCreatingTeacher(false);
    }
  };

  const openEditModal = () => {
    if (!selectedTeacher) {
      return;
    }

    setEditName(selectedTeacher.name);
    setEditSubject(selectedTeacher.subject);
    setEditDept(selectedTeacher.department);
    setEditStatus(selectedTeacher.status);
    setIsEditModalOpen(true);
  };

  const handleEditTeacher = () => {
    if (!selectedTeacher) {
      return;
    }

    const initials = editName
      .split(' ')
      .map((word) => word[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const updates = {
      name: editName,
      subject: editSubject,
      department: editDept,
      status: editStatus,
      initials,
    };

    updateTeacher(selectedTeacher.id, updates);
    setSelectedTeacher({ ...selectedTeacher, ...updates });
    setIsEditModalOpen(false);
  };

  useEffect(() => {
    const pageState = location.state as { openAddTeacher?: boolean; selectedTeacherId?: string } | null;

    if (pageState?.selectedTeacherId) {
      const teacher = teachers.find((item) => item.id === pageState.selectedTeacherId);

      if (teacher) {
        setSelectedTeacher(teacher);
        navigate(location.pathname, { replace: true, state: null });
      }
      return;
    }

    if (!pageState?.openAddTeacher) {
      return;
    }

    setSelectedTeacher(null);
    resetAddForm();
    setIsAddModalOpen(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, teachers]);

  const filteredTeachers = teachers.filter((teacher) => {
    const query = teacherSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      teacher.name.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.department.toLowerCase().includes(query) ||
      teacher.employeeId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-[26px_28px_40px] flex-1">
      {selectedTeacher ? (
        <div key={selectedTeacher.id} className="contents">
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => setSelectedTeacher(null)}
              className="w-10 h-10 flex items-center justify-center bg-[#f3eff7] border border-[#e2d9ed] rounded-sm hover:bg-[#6a5182] hover:text-white transition-colors text-[#6a5182] cursor-pointer shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teacher Profile</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Viewing details for {selectedTeacher.name}</p>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-up" style={{ animationDelay: '75ms' }}>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-[100px] h-[100px] rounded-2xl bg-gradient-to-br ${selectedTeacher.avatarGradient} text-white text-[32px] font-bold flex items-center justify-center shrink-0`}>
                  {selectedTeacher.initials}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] ${STATUS_STYLES[selectedTeacher.status].bg} ${STATUS_STYLES[selectedTeacher.status].text}`}>
                  {selectedTeacher.status}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-sans text-[22px] font-extrabold text-[#0d3349] tracking-tight leading-tight">{selectedTeacher.name}</h2>
                    <p className="text-[13px] text-[#64748b] mt-1">{selectedTeacher.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openEditModal}
                      className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
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
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] animate-fade-up" style={{ animationDelay: '150ms' }}>
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
              label="Total Classes"
              value={String(selectedTeacher.totalClasses)}
              subContent="Visible overview"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
              label="Total Students"
              value={selectedTeacher.totalStudents.toLocaleString()}
              subContent="Across assigned classes"
            />
            <StatCard
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              label="Upcoming Sessions"
              value={String(selectedTeacher.upcomingSessions)}
              subContent="Current summary"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teachers</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Manage and view faculty members</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#6a5182] hover:bg-[#5b4471] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Teacher
            </button>
          </div>

          <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
              <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">Faculty Members</h3>

              <div className="flex items-center gap-3 ml-auto flex-wrap">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a5182] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    value={teacherSearch}
                    onChange={(event) => setTeacherSearch(event.target.value)}
                    placeholder="Search faculty..."
                    className="pl-9 pr-4 py-2 border border-[#e2d9ed] rounded-sm text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6a5182]/15 bg-[#f3eff7] w-[220px] transition-all placeholder:text-[#8b7aa0] text-[#4b3f68]"
                  />
                </div>

                <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
                  {filteredTeachers.length} members
                </span>
              </div>
            </div>

            <div className="divide-y divide-[#f1eaf7] max-h-[560px] overflow-y-auto custom-scrollbar">
              {filteredTeachers.length === 0 ? (
                <div className="py-16 text-center text-[#64748b] font-medium text-sm">No teachers found matching your search.</div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <button
                    key={teacher.id}
                    type="button"
                    onClick={() => setSelectedTeacher(teacher)}
                    className="w-full group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#fcfaff] text-left cursor-pointer"
                  >
                    <div className={`${avatarTileColor(teacher.id)} w-[42px] h-[42px] rounded-sm flex items-center justify-center text-white text-[12px] font-extrabold shadow-sm flex-shrink-0`}>
                      {teacher.initials}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#0d3349] leading-tight truncate tracking-tight">{teacher.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-[#efe7f8] text-[#6a5182]">
                          teacher
                        </span>
                      </div>
                      <span className="text-[11.5px] text-[#64748b] font-medium truncate mt-0.5">{teacher.subject}</span>
                    </div>

                    <div className="ml-auto hidden md:block">
                      <div className="px-3.5 py-1.5 rounded-sm bg-[#f3eff7] text-[#6a5182] text-[11.5px] font-bold tracking-tight border border-[#e2d9ed]">
                        {teacher.department}
                      </div>
                    </div>

                    <div className="md:ml-8">
                      <div className={`px-4 py-1.5 rounded-full text-[11.5px] font-bold min-w-[85px] text-center ${STATUS_STYLES[teacher.status].bg} ${STATUS_STYLES[teacher.status].text}`}>
                        {teacher.status}
                      </div>
                    </div>

                    <div className="ml-6 flex items-center justify-end w-12 flex-shrink-0 text-[#c4b6d4] group-hover:text-[#6a5182] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {isAddModalOpen && (
        <AppModal onClose={() => { setIsAddModalOpen(false); resetAddForm(); }} widthClass="max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
            <div className="border-b border-[#e7dff0] bg-[#fbf8fe] px-6 py-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">Faculty Provisioning</p>
                  <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">Create Teacher Account</h3>
                  <p className="mt-1 text-[13px] text-[#64748b]">Provision a faculty login and capture the teaching identity details in one clean flow.</p>
                </div>
                <button onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="rounded-sm border border-[#ddd2ea] bg-white p-2 text-[#6a5182] transition-colors hover:bg-[#f4ecfb]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 md:px-8" onSubmit={(event) => { event.preventDefault(); handleAddTeacher(); }}>
              <div className="grid gap-8">
                {createTeacherError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
                    {createTeacherError}
                  </div>
                )}
                {createTeacherSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
                    {createTeacherSuccess}
                  </div>
                )}

                <section className="grid gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">Identity</p>
                    <h4 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0d3349]">Account Credentials</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TeacherField label="Full Name">
                      <TeacherInput value={newName} onChange={setNewName} placeholder="e.g. Dr. Ramesh Kumar" required />
                    </TeacherField>
                    <TeacherField label="Email">
                      <TeacherInput value={newEmail} onChange={setNewEmail} placeholder="teacher@school.edu" type="email" required />
                    </TeacherField>
                    <TeacherField label="Temporary Password">
                      <TeacherInput value={newPassword} onChange={setNewPassword} placeholder="Minimum 8 characters" type="password" minLength={8} required />
                    </TeacherField>
                    <TeacherField label="Status">
                      <TeacherStatusPicker value={newStatus} onChange={setNewStatus} />
                    </TeacherField>
                  </div>
                </section>

                <section className="grid gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">Faculty Details</p>
                    <h4 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0d3349]">Teaching Identity</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TeacherField label="Subject / Specialization">
                      <TeacherInput value={newSubject} onChange={setNewSubject} placeholder="e.g. Quantum Physics" />
                    </TeacherField>
                    <TeacherField label="Department">
                      <TeacherInput value={newDept} onChange={setNewDept} placeholder="e.g. Dept. of Physics" />
                    </TeacherField>
                  </div>
                </section>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="rounded-2xl border border-[#e2d9ed] bg-[#f7f2fb] px-5 py-3 text-[14px] font-bold text-[#6a5182] transition-all hover:bg-[#eadff4]">
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingTeacher} className="rounded-2xl bg-[#6a5182] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(106,81,130,0.22)] transition-all hover:bg-[#5b4471] disabled:cursor-not-allowed disabled:opacity-60">
                  {isCreatingTeacher ? 'Creating...' : 'Create Teacher Account'}
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}

      {isEditModalOpen && (
        <AppModal onClose={() => setIsEditModalOpen(false)} widthClass="max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
            <div className="border-b border-[#ece4f4] bg-[#fbf8fe] px-6 py-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">Faculty Editor</p>
                  <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">Edit Teacher Profile</h3>
                  <p className="mt-1 text-[13px] text-[#64748b]">Adjust the visible faculty card details for this teacher profile.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="rounded-sm border border-[#ddd2ea] bg-white p-2 text-[#6a5182] transition-colors hover:bg-[#f4ecfb]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6a5182] shadow-sm">
                  {editStatus}
                </span>
                <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#006496] shadow-sm">
                  {editDept || 'Department Not Set'}
                </span>
              </div>
            </div>
            <form className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 md:px-8" onSubmit={(event) => { event.preventDefault(); handleEditTeacher(); }}>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TeacherField label="Full Name">
                    <TeacherInput value={editName} onChange={setEditName} />
                  </TeacherField>
                  <TeacherField label="Department">
                    <TeacherInput value={editDept} onChange={setEditDept} />
                  </TeacherField>
                </div>
                <TeacherField label="Subject / Specialization">
                  <TeacherInput value={editSubject} onChange={setEditSubject} />
                </TeacherField>
                <TeacherField label="Status">
                  <TeacherStatusPicker value={editStatus} onChange={setEditStatus} />
                </TeacherField>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-2xl border border-[#e2d9ed] bg-[#f7f2fb] px-5 py-3 text-[14px] font-bold text-[#6a5182] transition-all hover:bg-[#eadff4]">
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-[#6a5182] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(106,81,130,0.22)] transition-all hover:bg-[#5b4471]">
                  Save Teacher Changes
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 border-l-[3px] border-[#e6f7f9] pl-3">
      <span className="text-[11.5px] font-bold text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-[#1e293b] font-semibold text-[15px]">{value}</span>
    </div>
  );
}

function TeacherField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{label}</label>
      {children}
    </div>
  );
}

function TeacherInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
  minLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      minLength={minLength}
      className="w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#6a5182] focus:ring-4 focus:ring-[#6a5182]/10"
    />
  );
}

function TeacherStatusPicker({
  value,
  onChange,
}: {
  value: TeacherStatus;
  onChange: (value: TeacherStatus) => void;
}) {
  const statuses: TeacherStatus[] = ['Active', 'On Leave', 'Inactive'];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {statuses.map((status) => {
        const isSelected = value === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={`rounded-2xl border px-4 py-3 text-[13px] font-bold transition-all ${
              isSelected
                ? 'border-[#6a5182] bg-[#f6f0fb] text-[#6a5182] shadow-sm'
                : 'border-[#dbe4f0] bg-[#fbfdff] text-[#475569] hover:border-[#c7b5db] hover:bg-[#faf7fd]'
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
