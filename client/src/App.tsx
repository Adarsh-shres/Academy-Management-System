import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import LandingPage from './pages/LandingPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. The Landing Route */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. The Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 3. Future Dashboard Route (Example) */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;