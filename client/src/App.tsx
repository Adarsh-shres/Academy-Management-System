import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LandingPage from './pages/LandingPage.tsx';

import Dashboard from './components/Dashboard.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import AllStudentsPage from './pages/AllStudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';
import SchedulePage from './pages/SchedulePage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import RegisterStudentsPage from './pages/RegisterStudentsPage.tsx';

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
        {/* 1. The Landing Route */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Dashboard Layout Routes */}
        <Route element={<DashboardPage />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/register-students" element={<RegisterStudentsPage />} />
          <Route path="/all-students" element={<AllStudentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/user-roles" element={<UnderDevelopment />} />
          <Route path="/userroles" element={<UnderDevelopment />} />
          <Route path="/under-development" element={<UnderDevelopment />} />
          <Route path="*" element={<UnderDevelopment />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;