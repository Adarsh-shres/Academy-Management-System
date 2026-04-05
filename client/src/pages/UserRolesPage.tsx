// UserRolesPage.tsx
import { useState } from "react";
import UserTable from "../components/UserRoles/UserTable.tsx";
import UserModal from "../components/UserRoles/UserModal.tsx";
import DeleteConfirmModal from "../components/UserRoles/DeleteConfirmModal.tsx";
import Toast from "../components/UserRoles/Toast.tsx";
import { useUsers } from "../hooks/useUsers.ts";
import { type User, ROLES } from "../data/mockUsers.ts";

export default function UserRolesPage() {
  const { users, addUser, updateUser, deleteUser, bulkDelete } = useUsers();

  const [roleFilter, setRoleFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => setDeletingId(id);

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteUser(deletingId);
      setDeletingId(null);
      showToast("User deleted successfully");
    }
  };

  const handleModalSubmit = (formData: any) => {
    if (editingUser) {
      updateUser({ ...editingUser, ...formData });
      showToast("User updated successfully");
    } else {
      addUser(formData);
      showToast("User added successfully");
    }
    setIsModalOpen(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDelete(ids);
    showToast(`${ids.length} users deleted successfully`);
  };

  // Split Logic
  const facultyList = users.filter((u) => u.role === ROLES.TEACHER);
  const studentList = users.filter((u) => u.role === ROLES.STUDENT);

  const userToDelete = users.find((u) => u.id === deletingId);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans p-[26px_28px_40px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#016496] tracking-widest uppercase mb-2">
        <span>Institutional Overview</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span>User Roles</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-sans text-[26px] font-extrabold text-[#0d3349] tracking-tight leading-tight">
            User Roles Management
          </h1>
          <p className="text-[#64748b] text-sm mt-1 font-medium italic">
            Student Academic Management System
          </p>
        </div>

        <div className="text-right flex items-center gap-2">
          <span className="text-[#64748b] text-[13px] font-medium opacity-60">
            {users.length} members • {facultyList.length} Teachers • {studentList.length} Students
          </span>
        </div>
      </div>

      {/* Main Content Containers */}
      <div className="max-w-screen-2xl mx-auto space-y-2">
        
        {/* 1. All Faculty Members */}
        {(roleFilter === "All" || roleFilter === ROLES.TEACHER) && (
          <UserTable
            title="All Faculty Members"
            users={facultyList}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onBulkDelete={handleBulkDelete}
            searchPlaceholder="Search faculty..."
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            showRoleFilter={true}
          />
        )}

        {/* 2. All Students */}
        {(roleFilter === "All" || roleFilter === ROLES.STUDENT) && (
          <UserTable
            title="All Students"
            users={studentList}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onBulkDelete={handleBulkDelete}
            searchPlaceholder="Search students..."
            // If Students is shown alone, we need the filter back to switch back
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            showRoleFilter={roleFilter === ROLES.STUDENT}
          />
        )}
      </div>

      {/* Modals & Feedback */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingUser={editingUser}
      />

      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name || ""}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
