import { useState } from 'react';
import type { ReactNode } from 'react';

import { useUsers } from '../hooks/useUsers';
import { type User, ROLES } from '../data/mockUsers.ts';
import AppModal from '../components/shared/AppModal';
import ConfirmActionModal from '../components/shared/ConfirmActionModal';



const AVATAR_TILES = [
  'bg-[#006496]',
  'bg-[#0d3349]',
  'bg-[#6a5182]',
  'bg-[#8b6ca8]',
  'bg-[#164e6a]',
  'bg-[#5b4471]',
];

function avatarTileColor(id: string) {
  const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % AVATAR_TILES.length : 0;
  return AVATAR_TILES[index];
}

export default function AdminUsersPage() {
  const { users, updateUser, deleteUser, addUser } = useUsers();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Add User State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<string>(ROLES.STUDENT);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState('');

  // Edit User State
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole(ROLES.STUDENT);
    setCreateUserError('');
    setCreateUserSuccess('');
  };

  const handleAddUser = async () => {
    const name = newName.trim();
    const email = newEmail.trim().toLowerCase();
    const password = newPassword.trim();

    if (!name || !email || !password) {
      setCreateUserError('Name, email, and password are required.');
      return;
    }

    setIsCreatingUser(true);
    setCreateUserError('');
    setCreateUserSuccess('');

    try {
      await addUser({
        name,
        email,
        password,
        role: newRole,
      });

      setCreateUserSuccess(`User account created for ${name}.`);
      resetAddForm();
      setIsAddModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user account.';
      setCreateUserError(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const openEditModal = () => {
    if (!selectedUser) return;
    setEditName(selectedUser.name);
    setEditRole(selectedUser.role);
    setIsEditModalOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser({
        ...selectedUser,
        name: editName,
        role: editRole as User['role'],
      });
      setSelectedUser({ ...selectedUser, name: editName, role: editRole as User['role'] });
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setSelectedUser(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = userSearch.trim().toLowerCase();
    const matchesSearch = !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-[26px_28px_40px] flex-1">
      {selectedUser ? (
        <div key={selectedUser.id} className="contents">
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => setSelectedUser(null)}
              className="w-10 h-10 flex items-center justify-center bg-[#f3eff7] border border-[#e2d9ed] rounded-sm hover:bg-[#6a5182] hover:text-white transition-colors text-[#6a5182] cursor-pointer shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">User Profile</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Viewing details for {selectedUser.name}</p>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 md:p-8 shadow-sm animate-fade-up" style={{ animationDelay: '75ms' }}>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-[100px] h-[100px] rounded-2xl ${avatarTileColor(selectedUser.id)} text-white text-[32px] font-bold flex items-center justify-center shrink-0`}>
                  {selectedUser.avatar}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.02em] bg-[#e7f8ef] text-[#15803d]`}>
                  Active
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-sans text-[22px] font-extrabold text-[#0d3349] tracking-tight leading-tight">{selectedUser.name}</h2>
                    <p className="text-[13px] text-[#64748b] mt-1">{selectedUser.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openEditModal}
                      className="flex items-center gap-2 bg-[#006496] hover:bg-[#0a4d70] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit User
                    </button>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center justify-center w-10 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-sm transition-all cursor-pointer shrink-0 border border-rose-200"
                      title="Delete User"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-10 gap-y-4 mt-5">
                  <DetailField label="Role" value={selectedUser.role} />
                  <DetailField label="Account ID" value={selectedUser.id.substring(0, 8).toUpperCase()} />
                  <DetailField label="Joined" value={selectedUser.joinDate || 'N/A'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">User Management</h1>
              <p className="text-[14px] text-[#64748b] mt-1">Manage all system users, access roles, and provisions.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#006496] hover:bg-[#0a4d70] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-sm transition-all shadow-sm hover:shadow hover:-translate-y-px cursor-pointer shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Provision User
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {['All', ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN, ROLES.SUPER_ADMIN].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`inline-flex items-center rounded-sm px-4 py-2 text-[12.5px] font-semibold border transition-all cursor-pointer ${
                  roleFilter === role
                    ? 'bg-[#eef6ff] text-[#006496] border-[#006496]/20 shadow-sm'
                    : 'bg-white text-[#64748b] border-[#e2e8f0] hover:text-[#006496] hover:border-[#b8daee]'
                }`}
              >
                {role === 'All' ? `All Users (${users.length})` : role}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
              <h3 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">User Directory</h3>

              <div className="flex items-center gap-3 ml-auto flex-wrap">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a5182] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search users..."
                    className="pl-9 pr-4 py-2 border border-[#e2d9ed] rounded-sm text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[#006496]/20 bg-[#f3eff7] w-[220px] transition-all placeholder:text-[#8b7aa0] text-[#0d3349]"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#f1eaf7] max-h-[560px] overflow-y-auto custom-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-[#64748b] font-medium text-sm">No users found.</div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className="w-full group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#fcfaff] text-left cursor-pointer"
                  >
                    <div className={`${avatarTileColor(u.id)} w-[42px] h-[42px] rounded-sm flex items-center justify-center text-white text-[12px] font-extrabold shadow-sm flex-shrink-0`}>
                      {u.avatar}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#0d3349] leading-tight truncate tracking-tight">{u.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-[#efe7f8] text-[#6a5182]">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-[11.5px] text-[#64748b] font-medium truncate mt-0.5">{u.email}</span>
                    </div>

                    <div className="md:ml-8 ml-auto">
                      <div className="px-4 py-1.5 rounded-full text-[11.5px] font-bold min-w-[85px] text-center bg-[#e7f8ef] text-[#15803d]">
                        Active
                      </div>
                    </div>

                    <div className="ml-6 flex items-center justify-end w-12 flex-shrink-0 text-[#c4b6d4] group-hover:text-[#006496] transition-colors">
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
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#006496]">User Provisioning</p>
                  <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">Create User Account</h3>
                  <p className="mt-1 text-[13px] text-[#64748b]">Provision a new user login and configure their system role.</p>
                </div>
                <button onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="rounded-sm border border-[#ddd2ea] bg-white p-2 text-[#006496] transition-colors hover:bg-[#eef6ff]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 md:px-8" onSubmit={(event) => { event.preventDefault(); handleAddUser(); }}>
              <div className="grid gap-8">
                {createUserError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700">
                    {createUserError}
                  </div>
                )}
                {createUserSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
                    {createUserSuccess}
                  </div>
                )}

                <section className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UserField label="Full Name">
                      <UserInput value={newName} onChange={setNewName} placeholder="e.g. Jane Doe" required />
                    </UserField>
                    <UserField label="Email">
                      <UserInput value={newEmail} onChange={setNewEmail} placeholder="user@school.edu" type="email" required />
                    </UserField>
                    <UserField label="Temporary Password">
                      <UserInput value={newPassword} onChange={setNewPassword} placeholder="Minimum 6 characters" type="password" minLength={6} required />
                    </UserField>
                    <UserField label="System Role">
                      <select 
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#006496] focus:ring-4 focus:ring-[#006496]/10"
                      >
                        <option value={ROLES.STUDENT}>Student</option>
                        <option value={ROLES.TEACHER}>Teacher</option>
                        <option value={ROLES.ADMIN}>Admin</option>
                      </select>
                    </UserField>
                  </div>
                </section>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setIsAddModalOpen(false); resetAddForm(); }} className="rounded-2xl border border-[#e2d9ed] bg-white px-5 py-3 text-[14px] font-bold text-[#64748b] transition-all hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingUser} className="rounded-2xl bg-[#006496] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(0,100,150,0.22)] transition-all hover:bg-[#0a4d70] disabled:cursor-not-allowed disabled:opacity-60">
                  {isCreatingUser ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}

      {isEditModalOpen && (
        <AppModal onClose={() => setIsEditModalOpen(false)} widthClass="max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.14)]">
            <div className="border-b border-[#ece4f4] bg-[#fbf8fe] px-6 py-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[24px] font-extrabold tracking-tight text-[#0d3349]">Edit User Role</h3>
                  <p className="mt-1 text-[13px] text-[#64748b]">Change the name and role of this user account.</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="rounded-sm border border-[#ddd2ea] bg-white p-2 text-[#006496] transition-colors hover:bg-[#eef6ff]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form className="px-6 py-6 md:px-8" onSubmit={(event) => { event.preventDefault(); handleEditUser(); }}>
              <div className="grid gap-6">
                <UserField label="Full Name">
                  <UserInput value={editName} onChange={setEditName} />
                </UserField>
                <UserField label="System Role">
                  <select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#006496] focus:ring-4 focus:ring-[#006496]/10"
                  >
                    <option value={ROLES.STUDENT}>Student</option>
                    <option value={ROLES.TEACHER}>Teacher</option>
                    <option value={ROLES.ADMIN}>Admin</option>
                  </select>
                </UserField>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-2xl border border-[#e2d9ed] bg-white px-5 py-3 text-[14px] font-bold text-[#64748b] transition-all hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="rounded-2xl bg-[#006496] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(0,100,150,0.22)] transition-all hover:bg-[#0a4d70]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </AppModal>
      )}

      <ConfirmActionModal
        isOpen={isDeleteModalOpen && !!selectedUser}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="You're about to completely remove this user from the system. This cannot be undone."
        subjectLabel={selectedUser ? `${selectedUser.name} • ${selectedUser.email}` : ''}
        confirmLabel="Delete User"
      />
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

function UserField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{label}</label>
      {children}
    </div>
  );
}

function UserInput({
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
      className="w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#006496] focus:ring-4 focus:ring-[#006496]/10"
    />
  );
}
