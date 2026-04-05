import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import RegisterStudentForm from './components/RegisterStudentForm.tsx';
import AllStudentsPage from './pages/AllStudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import TeacherDashboardPage from './pages/TeacherDashboardPage.tsx';

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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardPage />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/register-students" element={<RegisterStudentForm />} />
          <Route path="/all-students" element={<AllStudentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/userroles" element={<UnderDevelopment />} />
          <Route path="/under-development" element={<UnderDevelopment />} />
        </Route>

        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;