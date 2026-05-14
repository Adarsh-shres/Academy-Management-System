import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AIChatBot from './components/shared/AIChatBot';
import ProtectedRoute from './components/shared/ProtectedRoute';

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
import BatchesPage from './pages/BatchesPage.tsx';
import BatchDetailsPage from './pages/BatchDetailsPage.tsx';
import ClassesPage from './pages/ClassesPage.tsx';
import ClassBatchSelectPage from './pages/ClassBatchSelectPage.tsx';
import BatchClassesPage from './pages/BatchClassesPage.tsx';
import ClassFormPage from './pages/ClassFormPage.tsx';
import CourseClassesPage from './pages/CourseClassesPage.tsx';
import CourseClassDetailPage from './pages/CourseClassDetailPage.tsx';
import SchedulePage from './pages/SchedulePage.tsx';
import ScheduleClassDetailPage from './pages/ScheduleClassDetailPage.tsx';
import AdminTeacherSchedulePage from './pages/AdminTeacherSchedulePage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';
import TeacherDashboardPage from './pages/TeacherDashboardPage.tsx';
import TeacherCourseClassesPage from './pages/TeacherCourseClassesPage.tsx';
import TeacherClassDetailPage from './pages/TeacherClassDetailPage.tsx';
import TeacherNotificationsPage from './pages/TeacherNotificationsPage.tsx';
import TeacherUpdatePasswordPage from './pages/TeacherUpdatePasswordPage.tsx';
import StudentDashboardPage from './pages/StudentDashboardPage.tsx';
import StudentCoursesPage from './pages/StudentCoursesPage.tsx';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage.tsx';
import StudentAssignmentSubmissionPage from './pages/StudentAssignmentSubmissionPage.tsx';
import StudentClassDetailPage from './pages/StudentClassDetailPage.tsx';
import StudentQuizzesPage from './pages/StudentQuizzesPage.tsx';
import StudentAttendancePage from './pages/StudentAttendancePage.tsx';
import StudentAttendanceDetailPage from './pages/StudentAttendanceDetailPage.tsx';
import StudentProfilePage from './pages/StudentProfilePage.tsx';
import StudentSchedulePage from './pages/StudentSchedulePage.tsx';
import UpdatePasswordPage from './pages/UpdatePasswordPage.tsx';
import StudentFoldersPage from './pages/StudentFoldersPage.tsx';
import FolderContentsPage from './pages/FolderContentsPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import SendNotificationPage from './pages/SendNotificationPage.tsx';

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
        <Route path="/batches" element={<BatchesPage />} />
        <Route path="/batches/:batchId" element={<BatchDetailsPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/new" element={<ClassBatchSelectPage />} />
        <Route path="/classes/:batchId/new" element={<ClassFormPage />} />
        <Route path="/classes/:batchId/:classId/edit" element={<ClassFormPage />} />
        <Route path="/classes/:batchId" element={<BatchClassesPage />} />
        <Route path="/courses/:courseId/classes" element={<CourseClassesPage />} />
        <Route path="/courses/:courseId/classes/:classId" element={<CourseClassDetailPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/schedule/classes/:classId" element={<ScheduleClassDetailPage />} />
        <Route path="/schedule/teachers/:teacherId" element={<AdminTeacherSchedulePage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/user-management" element={<AdminUsersPage />} />
        <Route path="/send-notification" element={<SendNotificationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
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
        path="/teacher/courses/:courseId/classes"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourseClassesPage />
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
        path="/teacher/notifications"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherNotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/update-password"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherUpdatePasswordPage />
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
        <Route path="/student/classes/:classId" element={<StudentClassDetailPage />} />
        <Route path="/student/quizzes" element={<StudentQuizzesPage />} />
        <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
        <Route path="/student/assignments/:assignmentId/submissions" element={<StudentAssignmentSubmissionPage />} />
        <Route path="/student/schedule" element={<StudentSchedulePage />} />
        <Route path="/student/attendance" element={<StudentAttendancePage />} />
        <Route path="/student/attendance/:classId" element={<StudentAttendanceDetailPage />} />
        <Route path="/student/profile" element={<StudentProfilePage />} />
        <Route path="/student/update-password" element={<UpdatePasswordPage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route path="/student/courses/:courseId/folders" element={<StudentFoldersPage />} />
        <Route path="/student/courses/:courseId/folders/:folderId" element={<FolderContentsPage />} />
      </Route>
    </Routes>
    <AIChatBot />
  </Router>
  );
}

export default App;
