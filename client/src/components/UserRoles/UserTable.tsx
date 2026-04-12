import React, { useState } from 'react';
import { type User, ROLES } from '../../data/mockUsers.ts';

export interface UserTableProps {
  title: string;
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onRowClick?: (user: User) => void;
  searchPlaceholder?: string;
  roleFilter?: string;
  onRoleFilterChange?: (role: string) => void;
  showRoleFilter?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'bg-[#e7f8ef]', text: 'text-[#15803d]' },
  'On Leave': { bg: 'bg-[#fff4e5]', text: 'text-[#b45309]' },
  Inactive: { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]' },
};

const AVATAR_COLORS = [
  'bg-[#6a5182]',
  'bg-[#8b6ca8]',
  'bg-[#4b3f68]',
  'bg-[#7b6591]',
  'bg-[#5b4471]',
  'bg-[#8f77a9]',
];

function avatarColor(id: string) {
  const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

function getRoleSummary(user: User) {
  if (user.course.trim()) return user.course;
  return user.role === ROLES.TEACHER ? 'Teacher account' : 'Student account';
}

function getDepartmentLabel(user: User) {
  if (!user.department.trim()) {
    return 'No department set';
  }

  const lastWord = user.department.split(' ').pop();
  return lastWord ? `Dept. of ${lastWord}` : user.department;
}

export default function UserTable({
  title,
  users,
  onEdit,
  onDelete,
  onBulkDelete,
  onRowClick,
  searchPlaceholder = 'Search...',
  roleFilter = 'All',
  onRoleFilterChange,
  showRoleFilter = false,
}: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const toggleOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selected.length} selected users?`)) {
      onBulkDelete(selected);
      setSelected([]);
    }
  };

  return (
    <div className="bg-white rounded-sm border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up">
      <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-[#fbf8fe]">
        <h2 className="text-[#4b3f68] font-bold text-[14px] uppercase tracking-wide">{title}</h2>

        <div className="flex items-center gap-3 ml-auto flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6a5182] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-2 border border-[#e2d9ed] rounded-sm text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6a5182]/15 bg-[#f3eff7] w-[220px] transition-all placeholder:text-[#8b7aa0] text-[#4b3f68]"
            />
          </div>

          {showRoleFilter && onRoleFilterChange && (
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="text-[12px] font-semibold border border-[#e2d9ed] bg-white rounded-sm px-3 py-2 text-[#6a5182] focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value={ROLES.TEACHER}>Teachers</option>
              <option value={ROLES.STUDENT}>Students</option>
            </select>
          )}

          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="text-rose-500 hover:text-rose-600 p-2 transition-colors" title="Delete selected users">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-[#f1eaf7] max-h-[500px] overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#64748b] font-medium text-sm">No members found matching your search.</div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => onRowClick?.(user)}
              onKeyDown={(event) => {
                if (!onRowClick) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(user);
                }
              }}
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : -1}
              className={`group flex items-center gap-4 px-5 py-4 transition-all duration-200 hover:bg-[#fcfaff] relative ${
                selected.includes(user.id) ? 'bg-[#f7f2fb]' : ''
              } ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              <div
                onClick={(e) => toggleOne(e, user.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                  selected.includes(user.id) ? 'bg-[#6a5182] border-[#6a5182]' : 'border-[#d6c9e5] group-hover:border-[#bda8d6]'
                }`}
              >
                {selected.includes(user.id) && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              <div className={`${avatarColor(user.id)} w-[42px] h-[42px] rounded-sm flex items-center justify-center text-white text-[12px] font-extrabold shadow-sm flex-shrink-0`}>
                {user.avatar}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#0d3349] leading-tight truncate tracking-tight">{user.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      user.role === ROLES.TEACHER ? 'bg-[#efe7f8] text-[#6a5182]' : 'bg-[#f3eff7] text-[#7b6591]'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <span className="text-[11.5px] text-[#64748b] font-medium truncate mt-0.5">{getRoleSummary(user)}</span>
              </div>

              <div className="ml-auto hidden md:block">
                <div className="px-3.5 py-1.5 rounded-sm bg-[#f3eff7] text-[#6a5182] text-[11.5px] font-bold tracking-tight border border-[#e2d9ed]">
                  {getDepartmentLabel(user)}
                </div>
              </div>

              <div className="md:ml-8">
                <div className={`px-4 py-1.5 rounded-full text-[11.5px] font-bold min-w-[85px] text-center ${STATUS_CONFIG[user.status].bg} ${STATUS_CONFIG[user.status].text}`}>
                  {user.status}
                </div>
              </div>

              <div className="ml-6 flex items-center justify-end w-12 flex-shrink-0">
                <div className="group-hover:hidden text-[#c4b6d4] opacity-60">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                <div className="hidden group-hover:flex items-center gap-1 animate-fade-in">
                  <button onClick={(event) => { event.stopPropagation(); onEdit(user); }} className="p-2 text-[#94a3b8] hover:text-[#6a5182] transition-colors" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={(event) => { event.stopPropagation(); onDelete(user.id); }} className="p-2 text-[#94a3b8] hover:text-rose-500 transition-colors" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
