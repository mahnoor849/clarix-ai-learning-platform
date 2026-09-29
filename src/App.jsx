import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import LearnerLogin from './pages/LearnerLogin';
import Diagnostic from './pages/Diagnostic';
import LearnerDashboard from './pages/LearnerDashboard';
import EducatorLogin from './pages/EducatorLogin';
import EducatorDashboard from './pages/EducatorDashboard';
import LearnerDetail from './pages/LearnerDetail';
import LearnerSignup from './pages/LearnerSignup';
import StudentProfile from './pages/StudentProfile';
import { initializeProfiles } from './services/storageService';

function App() {
  useEffect(() => {
    initializeProfiles();
  }, []);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/learner" element={<LearnerLogin />} />
        <Route path="/learner/signup" element={<LearnerSignup />} />
        <Route path="/learner/diagnostic" element={<Diagnostic />} />
        <Route path="/learner/dashboard" element={<LearnerDashboard />} />
        <Route path="/learner/profile" element={<StudentProfile />} />
        <Route path="/educator" element={<EducatorLogin />} />
        <Route path="/educator/dashboard" element={<EducatorDashboard />} />
        <Route path="/educator/learner/:id" element={<LearnerDetail />} />
      </Routes>
    </div>
  );
}

export default App;
