import React, { useState } from "react";
import { type User, ROLES } from "../../data/mockUsers.ts";

export interface UserTableProps {
  title: string;
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  searchPlaceholder?: string;
  roleFilter?: string;
  onRoleFilterChange?: (role: string) => void;
  showRoleFilter?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: "bg-[#e2f9ee]", text: "text-[#059669]", dot: "bg-[#059669]" },
  "On Leave": { bg: "bg-[#fff1e2]", text: "text-[#92400e]", dot: "bg-[#92400e]" },
  Inactive: { bg: "bg-[#f1f5f9]", text: "text-[#475569]", dot: "bg-[#475569]" },
};

const AVATAR_COLORS = [
  "bg-[#016496]", "bg-[#0d3349]", "bg-[#475569]",
  "bg-[#0891b2]", "bg-slate-700", "bg-indigo-600",
];

function avatarColor(id: string) {
  const index = typeof id === 'string' ? id.charCodeAt(id.length - 1) % AVATAR_COLORS.length : 0;
  return AVATAR_COLORS[index];
}

export default function UserTable({ 
  title, 
  users, 
  onEdit, 
  onDelete, 
  onBulkDelete,
  searchPlaceholder = "Search...",
  roleFilter = "All",
  onRoleFilterChange,
  showRoleFilter = false
}: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Filtering (Each container has its own search state)
  const filtered = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const toggleOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selected.length} selected users?`)) {
      onBulkDelete(selected);
      setSelected([]);
    }
  };

  return (
    <div className="bg-white rounded-[23px] border border-[#e2e8f0] shadow-sm overflow-hidden animate-fade-up mb-8">
      {/* Header / Toolbar */}
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-[#016496] font-extrabold text-[17px] tracking-tight">
          {title}
        </h2>
        
        <div className="flex items-center gap-3 ml-auto">
          {/* Search Integrated with unique highlight */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#016496] opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-4 py-1.5 border border-[#016496]/20 rounded-lg text-[12.5px] font-medium focus:outline-none focus:ring-2 focus:ring-[#016496]/15 bg-[#016496]/5 w-[220px] transition-all placeholder:text-[#016496]/40"
            />
          </div>

          {showRoleFilter && onRoleFilterChange && (
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="text-[11.5px] font-bold border-none bg-slate-50 rounded-lg px-3 py-1.5 text-slate-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value={ROLES.TEACHER}>Teachers</option>
              <option value={ROLES.STUDENT}>Students</option>
            </select>
          )}

          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-600 p-2 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* List Container (Scrollable) */}
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium text-sm italic">No members found matching your search.</div>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className={`group flex items-center gap-4 px-6 py-[18px] transition-all duration-200 hover:bg-[#f8fbfe] relative ${
                selected.includes(user.id) ? "bg-[#f0f9ff]" : ""
              }`}
            >
              {/* Checkbox (branded blue) */}
              <div 
                onClick={(e) => toggleOne(e, user.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                  selected.includes(user.id) ? "bg-[#016496] border-[#016496]" : "border-slate-200 group-hover:border-slate-300"
                }`}
              >
                {selected.includes(user.id) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>

              {/* Avatar */}
              <div className={`${avatarColor(user.id)} w-[42px] h-[42px] rounded-full flex items-center justify-center text-white text-[12px] font-extrabold shadow-sm flex-shrink-0`}>
                {user.avatar}
              </div>

              {/* Identity */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14.5px] font-bold text-[#0d3349] leading-tight truncate tracking-tight">{user.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${user.role === ROLES.TEACHER ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                    {user.role}
                  </span>
                </div>
                <span className="text-[11.5px] text-[#64748b] font-medium truncate mt-0.5">{user.course}</span>
              </div>

              {/* Department Badge */}
              <div className="ml-auto hidden md:block">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#eaf7fd] text-[#006496] text-[11.5px] font-bold tracking-tight">
                  Dept. of {user.department.split(' ').pop()}
                </div>
              </div>

              {/* Status Pill */}
              <div className="md:ml-8">
                <div className={`px-4 py-1.5 rounded-full text-[11.5px] font-bold min-w-[85px] text-center ${STATUS_CONFIG[user.status].bg} ${STATUS_CONFIG[user.status].text}`}>
                  {user.status}
                </div>
              </div>

              {/* Chevron / Actions Overlay */}
              <div className="ml-6 flex items-center justify-end w-12 flex-shrink-0">
                <div className="group-hover:hidden text-slate-300 opacity-60">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                
                {/* Actions on Hover */}
                <div className="hidden group-hover:flex items-center gap-1 animate-fade-in">
                  <button onClick={() => onEdit(user)} className="p-2 text-slate-400 hover:text-[#016496] transition-colors" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
