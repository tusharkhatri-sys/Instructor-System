import { useState, useEffect } from 'react';
import LoginScreen from './pages/LoginScreen';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('iti_session');
      return stored ? JSON.parse(stored).user : null;
    } catch { return null; }
  });
  
  const [role, setRole] = useState(() => {
    try {
      const stored = localStorage.getItem('iti_session');
      return stored ? JSON.parse(stored).role : null;
    } catch { return null; }
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    // Explicitly persist session across page reloads
    localStorage.setItem('iti_session', JSON.stringify({ user: userData, role: userRole }));
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('iti_session');
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-semibold text-lg tracking-wide animate-pulse">Processing...</p>
        </div>
      )}

      {!user ? (
        <LoginScreen onLogin={handleLogin} setLoading={setIsLoading} />
      ) : role === 'admin' ? (
        <AdminDashboard admin={user} onLogout={handleLogout} setLoading={setIsLoading} />
      ) : (
        <InstructorDashboard instructor={user} onLogout={handleLogout} setLoading={setIsLoading} />
      )}
    </>
  );
}

export default App;
