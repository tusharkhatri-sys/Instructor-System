import { useState } from 'react';
import { findInstructorByIdAndDob } from '../services/instructorApi';
import { User, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginScreen({ onLogin, setLoading }) {
  const [activeTab, setActiveTab] = useState('instructor'); // 'instructor' or 'admin'
  const [instrId, setInstrId] = useState('');
  const [instrDob, setInstrDob] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleInstructorLogin = async (e) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);
    try {
      const found = await findInstructorByIdAndDob(instrId, instrDob);
      if (found) {
        onLogin(found, 'instructor');
      } else {
        setErrorText('Invalid Emp. ID or Date of Birth');
      }
    } catch (err) {
      setErrorText('Login failed: ' + err.message);
    }
    setLoading(false);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorText('');
    setLoading(true);
    // Hardcoded per original app.js
    setTimeout(() => {
      if (adminUser === 'jaisalmeriti@gmail.com' && adminPass === '345001') {
        onLogin({ email: adminUser, id: 'admin' }, 'admin');
      } else {
        setErrorText('Invalid Admin Credentials');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-5 relative overflow-hidden bg-gradient-to-br from-[#f0f4f8] to-[#e0eaf3]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full bg-blue-500/10 mix-blend-multiply blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#1a73a7]/5 mix-blend-multiply blur-3xl"></div>

      <header className="mb-8 text-center relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white mb-4 shadow-lg ring-4 ring-white">
          <Shield size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#1a73a7] tracking-tight mb-2">
          ITI Instructor System
        </h1>
        <p className="text-slate-500 font-medium">Verify your identity to proceed</p>
      </header>

      <section className="glass-card w-full max-w-md rounded-2xl p-8 relative z-10">
        <nav className="flex space-x-2 mb-6 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => { setActiveTab('instructor'); setErrorText(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
              activeTab === 'instructor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <User size={18} />
            Instructor
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setErrorText(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md font-semibold text-sm transition-all duration-300 ${
              activeTab === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Shield size={18} />
            Head / Admin
          </button>
        </nav>

        {activeTab === 'instructor' ? (
          <form onSubmit={handleInstructorLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="instrId">
                Emp. ID
              </label>
              <input
                type="text"
                id="instrId"
                placeholder="Enter your Emp. ID"
                required
                autoComplete="off"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-medium text-slate-800"
                value={instrId}
                onChange={(e) => setInstrId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="instrDob">
                Date of Birth
              </label>
              <input
                type="date"
                id="instrDob"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-800"
                value={instrDob}
                onChange={(e) => setInstrDob(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full mt-2 bg-[#1a73a7] hover:bg-[#145a85] text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
            >
              <span>Login</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="headUser">
                Username
              </label>
              <input
                type="text"
                id="headUser"
                placeholder="Enter admin username"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-medium text-slate-800"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="headPass">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="headPass"
                  placeholder="Enter admin password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 pr-12"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-2 bg-[#1a73a7] hover:bg-[#145a85] text-white font-bold py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
            >
              <span>Login as Head</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {errorText && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
            {errorText}
          </div>
        )}
      </section>

      <footer className="mt-12 text-slate-500 text-sm font-medium relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
           <span>Made by A COPA Student</span>
           <strong className="text-slate-700">Tushar Khatri</strong>
           <span className="text-slate-400 mx-1">|</span>
           <span>Session 2025-26</span>
        </div>
        
        <div className="relative">
             <button 
               onClick={() => setShowContact(!showContact)} 
               className="font-bold text-blue-600 hover:bg-blue-50 bg-white shadow-sm transition-all focus:ring-2 focus:ring-blue-200 flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 text-xs tracking-wide"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
               Contact Help Desk
             </button>
             
             {showContact && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-1.5">
                   <a href="tel:8094353411" className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-green-700 bg-slate-50 hover:bg-green-50 rounded-lg transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                     Call
                   </a>
                   <a href="mailto:tusharkhatri002@gmail.com" className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                     Email
                   </a>
                   <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                </div>
             )}
        </div>
      </footer>
    </main>
  );
}
