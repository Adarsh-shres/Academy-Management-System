import { useState } from 'react';
import UserTable from '../components/UserRoles/UserTable.tsx';
import UserModal from '../components/UserRoles/UserModal.tsx';
import DeleteConfirmModal from '../components/UserRoles/DeleteConfirmModal.tsx';
import Toast from '../components/UserRoles/Toast.tsx';
import { useUsers } from '../hooks/useUsers.ts';
import { type User, ROLES } from '../data/mockUsers.ts';
import { useNavigate } from 'react-router-dom';

export default function UserRolesPage() {
  const navigate = useNavigate();
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

  const handleRowOpen = (user: User) => {
    if (user.role === ROLES.TEACHER) {
      navigate('/teachers', { state: { selectedTeacherId: user.id } });
      return;
    }

    navigate(`/students/${user.id}`);
  };

  const facultyList = users.filter((u) => u.role === ROLES.TEACHER);
  const studentList = users.filter((u) => u.role === ROLES.STUDENT);
  const userToDelete = users.find((u) => u.id === deletingId);
  const filteredUsers =
    roleFilter === ROLES.TEACHER
      ? facultyList
      : roleFilter === ROLES.STUDENT
        ? studentList
        : users;

  const getFilterChipClass = (filterValue: string, isPrimary = false) =>
    `inline-flex items-center rounded-sm px-3 py-2 text-[12px] font-semibold border transition-all cursor-pointer ${
      roleFilter === filterValue
        ? 'bg-[#f3eff7] text-[#6a5182] border-[#e2d9ed]'
        : isPrimary
          ? 'bg-white text-[#64748b] border-[#e2e8f0] hover:text-[#6a5182] hover:border-[#d9cde8]'
          : 'bg-white text-[#64748b] border-[#e2e8f0] hover:text-[#6a5182] hover:border-[#d9cde8]'
    }`;

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">User Roles</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage student and teacher access from one place.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setRoleFilter('All')}
            className={getFilterChipClass('All', true)}
          >
            {users.length} members
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter(ROLES.TEACHER)}
            className={getFilterChipClass(ROLES.TEACHER)}
          >
            {facultyList.length} teachers
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter(ROLES.STUDENT)}
            className={getFilterChipClass(ROLES.STUDENT)}
          >
            {studentList.length} students
          </button>
        </div>
      </div>

      <UserTable
        title="Members"
        users={filteredUsers}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onBulkDelete={handleBulkDelete}
        onRowClick={handleRowOpen}
        searchPlaceholder="Search members..."
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        showRoleFilter={false}
      />

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
