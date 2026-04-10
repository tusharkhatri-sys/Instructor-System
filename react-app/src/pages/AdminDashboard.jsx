import { useState, useEffect } from 'react';
import { UserPlus, Users, Frame, Settings, LogOut, Megaphone, Calendar, UserCog, Hammer } from 'lucide-react';
import RegisterInstructor from './admin/RegisterInstructor';
import ViewInstructors from './admin/ViewInstructors';
import AdminSettings from './admin/AdminSettings';
import IdCardGenerator from './admin/IdCardGenerator';
import NoticeBoardAdmin from './admin/NoticeBoardAdmin';
import LeaveAdmin from './admin/LeaveAdmin';
import EditRequestsAdmin from './admin/EditRequestsAdmin';
import ToolRequestsAdmin from './admin/ToolRequestsAdmin';
import { getInstructors, getPendingCounts } from '../services/instructorApi';

export default function AdminDashboard({ admin, onLogout, setLoading }) {
  const [activeTab, setActiveTab] = useState('register');
  const [instructorsList, setInstructorsList] = useState([]);
  const [pendingCounts, setPendingCounts] = useState({ leaves: 0, tools: 0, edits: 0 });

  // Fetch list of instructors when dashboard mounts
  const fetchIntructorsData = async () => {
    try {
      setLoading(true);
      const data = await getInstructors();
      setInstructorsList(data);
      const counts = await getPendingCounts();
      setPendingCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntructorsData();
  }, []);

  const navItems = [
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'view', label: 'View Instructors', icon: Users },
    { id: 'idcard', label: 'ID Cards', icon: Frame },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'leaves', label: 'Leave Approvals', icon: Calendar },
    { id: 'tools', label: 'Material Requests', icon: Hammer },
    { id: 'edits', label: 'Profile Updates', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-[#1a73a7] text-white">
          <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center font-bold text-xs mr-3">
            ITI
          </div>
          <h2 className="font-semibold text-lg tracking-tight">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            let badgeCount = 0;
            if (item.id === 'leaves') badgeCount = pendingCounts.leaves;
            if (item.id === 'tools') badgeCount = pendingCounts.tools;
            if (item.id === 'edits') badgeCount = pendingCounts.edits;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {item.label}
                </div>
                
                {badgeCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-[#f0f4f8] to-[#e0eaf3]">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-white/40 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <div>
             <h3 className="text-xl font-bold text-slate-800">
                {navItems.find((n) => n.id === activeTab)?.label}
             </h3>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'register' && <RegisterInstructor setLoading={setLoading} onSuccess={fetchIntructorsData} />}
            {activeTab === 'view' && <ViewInstructors instructors={instructorsList} setLoading={setLoading} onRefresh={fetchIntructorsData} />}
            {activeTab === 'idcard' && <IdCardGenerator instructors={instructorsList} setLoading={setLoading} />}
            {activeTab === 'notices' && <NoticeBoardAdmin setLoading={setLoading} />}
            {activeTab === 'leaves' && <LeaveAdmin setLoading={setLoading} onRefresh={fetchIntructorsData} />}
            {activeTab === 'tools' && <ToolRequestsAdmin setLoading={setLoading} onRefresh={fetchIntructorsData} />}
            {activeTab === 'edits' && <EditRequestsAdmin setLoading={setLoading} onRefresh={fetchIntructorsData} />}
            {activeTab === 'settings' && <AdminSettings setLoading={setLoading} />}
          </div>
        </main>
      </div>
    </div>
  );
}
