import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import AllStudentsPage from './pages/AllStudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import RegisterStudentsPage from './pages/RegisterStudentsPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import UserRolesPage from './pages/UserRolesPage.tsx';
import TeacherDashboardPage from './pages/TeacherDashboardPage.tsx';
import TeacherClassDetailPage from './pages/TeacherClassDetailPage.tsx';
import TeacherSettingsPage from './pages/TeacherSettingsPage.tsx';
import StudentDashboardPage from './pages/StudentDashboardPage.tsx';
import StudentCoursesPage from './pages/StudentCoursesPage.tsx';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage.tsx';
import StudentAttendancePage from './pages/StudentAttendancePage.tsx';
import StudentProfilePage from './pages/StudentProfilePage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import SendNotificationPage from './pages/SendNotificationPage.tsx';
import StudentFoldersPage from './pages/StudentFoldersPage.tsx';
import FolderContentsPage from './pages/FolderContentsPage.tsx';

function UnderDevelopment() {
  return (
    <div className="p-[26px_28px_40px]">
      <h2 className="text-2xl font-bold font-sans text-[#0d3349]">Under Development</h2>
      <p className="mt-4 text-[#64748b]">This page is currently being developed.</p>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
        {/* ── Public routes ──────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Admin dashboard routes ─────────────────────────────── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/register-students" element={<RegisterStudentsPage />} />
          <Route path="/all-students" element={<AllStudentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/user-roles" element={<UserRolesPage />} />
          <Route path="/userroles" element={<UserRolesPage />} />
          <Route path="/admin/users" element={<UserRolesPage />} />
          <Route path="/send-notification" element={<SendNotificationPage />} />
          <Route path="/under-development" element={<UnderDevelopment />} />
          <Route path="*" element={<UnderDevelopment />} />
        </Route>

        {/* ── Teacher dashboard routes ───────────────────────────── */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes/:classId"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherClassDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* ── Student dashboard routes ───────────────────────────── */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboardPage />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
          <Route path="/student/notifications" element={<NotificationsPage />} />
          <Route path="/student/folders" element={<StudentFoldersPage />} />
          <Route path="/student/folders/:folderId" element={<FolderContentsPage />} />
        </Route>
      </Routes>
    </Router>
    </NotificationProvider>
  );
}

export default App;
