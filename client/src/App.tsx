import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import RegisterStudentForm from './components/RegisterStudentForm.tsx';
import AllStudentsPage from './pages/AllStudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import CoursesPage from './pages/CoursesPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Default Route (Redirects "/" to "/login" for now) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 3. Dashboard Layout Routes */}
        <Route element={<DashboardPage />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/register-students" element={<RegisterStudentForm />} />
          <Route path="/all-students" element={<AllStudentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/under-construction" element={
            <div className="p-[26px_28px_40px]">
              <h2 className="text-2xl font-bold font-sans text-[#0d3349]">Under Construction</h2>
              <p className="mt-4 text-[#64748b]">This page is currently being built.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;