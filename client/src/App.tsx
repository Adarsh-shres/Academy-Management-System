import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import AllStudentsPage from './pages/AllStudentsPage.tsx';
import StudentDetailsPage from './pages/StudentDetailsPage.tsx';
import RegisterStudentsPage from './pages/RegisterStudentsPage.tsx';

function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="p-[26px_28px_40px]">
      <h2 className="text-2xl font-bold font-sans text-[#0d3349]">{title} Content</h2>
      <p className="mt-4 text-[#64748b]">Under Construction</p>
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

        {/* 3. App Layout Route */}
        <Route element={<DashboardPage />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/all-students" element={<AllStudentsPage />} />
          <Route path="/students/:id" element={<StudentDetailsPage />} />
          <Route path="/register-students" element={<RegisterStudentsPage />} />
          
          {/* Other Sidebar items */}
          <Route path="/user-roles" element={<UnderConstruction title="User Roles" />} />
          <Route path="/teachers" element={<UnderConstruction title="Teachers" />} />
          <Route path="/courses" element={<UnderConstruction title="Courses" />} />
          <Route path="/schedule" element={<UnderConstruction title="Schedule" />} />
          <Route path="/settings" element={<UnderConstruction title="Settings" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;