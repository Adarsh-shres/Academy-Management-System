import { useState } from 'react';
import UserTable from '../components/UserRoles/UserTable.tsx';
import UserModal from '../components/UserRoles/UserModal.tsx';
import DeleteConfirmModal from '../components/UserRoles/DeleteConfirmModal.tsx';
import Toast from '../components/UserRoles/Toast.tsx';
import { useUsers } from '../hooks/useUsers.ts';
import { type User, ROLES } from '../data/mockUsers.ts';

export default function UserRolesPage() {
  const { users, addUser, updateUser, deleteUser, bulkDelete } = useUsers();

  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
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
      showToast('User deleted successfully');
    }
  };

  const handleModalSubmit = (formData: any) => {
    if (editingUser) {
      updateUser({ ...editingUser, ...formData });
      showToast('User updated successfully');
    } else {
      addUser(formData);
      showToast('User added successfully');
    }
    setIsModalOpen(false);
  };

  const handleBulkDelete = (ids: string[]) => {
    bulkDelete(ids);
    showToast(`${ids.length} users deleted successfully`);
  };

  const facultyList = users.filter((u) => u.role === ROLES.TEACHER);
  const studentList = users.filter((u) => u.role === ROLES.STUDENT);
  const userToDelete = users.find((u) => u.id === deletingId);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">User Roles</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage student and teacher access from one place.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-sm bg-[#f3eff7] px-3 py-2 text-[12px] font-semibold text-[#6a5182] border border-[#e2d9ed]">
            {users.length} members
          </span>
          <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
            {facultyList.length} teachers
          </span>
          <span className="inline-flex items-center rounded-sm bg-white px-3 py-2 text-[12px] font-semibold text-[#64748b] border border-[#e2e8f0]">
            {studentList.length} students
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {(roleFilter === 'All' || roleFilter === ROLES.TEACHER) && (
          <UserTable
            title="Faculty Members"
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

        {(roleFilter === 'All' || roleFilter === ROLES.STUDENT) && (
          <UserTable
            title="Students"
            users={studentList}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onBulkDelete={handleBulkDelete}
            searchPlaceholder="Search students..."
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            showRoleFilter={roleFilter === ROLES.STUDENT}
          />
        )}
      </div>

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
        userName={userToDelete?.name || ''}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
