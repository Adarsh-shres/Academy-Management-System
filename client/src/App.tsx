import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Default Route (Redirects "/" to "/login" for now) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 3. Future Dashboard Route (Example) */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;