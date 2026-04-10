import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { LogOut, Download, Frame, User, Calendar, Hammer, Megaphone, Edit3 } from 'lucide-react';
import IdCardFront from '../components/idcard/IdCardFront';
import IdCardBack from '../components/idcard/IdCardBack';
import { submitLeave, getMyLeaves, submitToolRequest, getMyToolRequests, getNotices, submitEditRequest } from '../services/instructorApi';

export default function InstructorDashboard({ instructor, onLogout, setLoading }) {
  const [activeTab, setActiveTab] = useState('profile');
  
  const [isFlipped, setIsFlipped] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const downloadCard = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      const config = { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' };
      const canvasFront = await html2canvas(frontRef.current, config);
      const canvasBack = await html2canvas(backRef.current, config);

      const finalCanvas = document.createElement('canvas');
      const margin = 30; 
      finalCanvas.width = canvasFront.width + canvasBack.width + (margin * 3);
      finalCanvas.height = Math.max(canvasFront.height, canvasBack.height) + (margin * 2);

      const ctx = finalCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      ctx.drawImage(canvasFront, margin, margin);
      ctx.drawImage(canvasBack, canvasFront.width + (margin * 2), margin);

      const link = document.createElement('a');
      link.download = `ID_Card_${instructor.id}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      alert('Error generating ID card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ds) => {
    if (!ds) return '—';
    const d = new Date(ds);
    return isNaN(d) ? ds : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'leaves', label: 'Leave Requests', icon: Calendar },
    { id: 'tools', label: 'Material Request', icon: Hammer },
    { id: 'edit', label: 'Update Profile', icon: Edit3 },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] text-slate-800 overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-20 w-full relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a73a7] text-white flex items-center justify-center font-bold text-xs">
            ITI
          </div>
          <h2 className="font-semibold text-lg tracking-tight text-slate-800 hidden sm:block">Instructor Panel</h2>
        </div>
        
        {/* Horizontal Navigation */}
        <nav className="hidden md:flex gap-1 absolute left-1/2 -translate-x-1/2 h-full">
           {navItems.map(item => {
              const Icon = item.icon;
              return (
                 <button 
                   key={item.id} onClick={() => setActiveTab(item.id)}
                   className={`h-full px-4 flex items-center gap-2 border-b-2 text-sm font-semibold transition-colors ${activeTab === item.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                 >
                   <Icon size={16} /> {item.label}
                 </button>
              );
           })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden lg:inline-block">Welcome, <strong className="text-slate-800">{instructor.name}</strong></span>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>
      
      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-b border-slate-200 flex overflow-x-auto px-4 gap-2 pt-2 scrollbar-hide">
         {navItems.map(item => (
             <button 
               key={item.id} onClick={() => setActiveTab(item.id)}
               className={`py-2 px-3 whitespace-nowrap border-b-2 text-xs font-semibold ${activeTab === item.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
             >
               {item.label}
             </button>
         ))}
      </nav>

      <main className="flex-1 overflow-y-auto w-full">
        {activeTab === 'profile' && (
          <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex-1 space-y-6">
               <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col h-full">
                 <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8">
                   <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-sm shrink-0 bg-slate-50">
                      <img src={instructor.photo} alt={instructor.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-slate-800">{instructor.name}</h2>
                      <p className="text-blue-600 font-semibold mt-1">{instructor.designation} — {instructor.iti_name}</p>
                      <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block mt-2">{instructor.id}</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <DetailItem label="Trade" value={instructor.trade} />
                    <DetailItem label="Father's Name" value={instructor.father_name} />
                    <DetailItem label="Phone" value={instructor.phone} />
                    <DetailItem label="Email" value={instructor.email} />
                    <DetailItem label="Date of Birth" value={formatDate(instructor.dob)} />
                    <DetailItem label="Join Date" value={formatDate(instructor.join_date)} />
                    <DetailItem label="Blood Group" value={instructor.blood_group} />
                    <div className="sm:col-span-2">
                      <DetailItem label="Address" value={instructor.address} />
                    </div>
                 </div>
               </div>
            </div>

            <div className="md:w-[400px] shrink-0">
               <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 w-full border-b border-slate-200 pb-4">Virtual ID Card</h3>
                  <div style={{perspective: 1000}}>
                    <div onClick={() => setIsFlipped(!isFlipped)} className="relative transition-transform duration-700 cursor-pointer shadow-2xl rounded-xl ring-1 ring-slate-200" style={{ width: 350, height: 490, transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                       <div className="absolute top-0 left-0 w-full h-full" style={{backfaceVisibility: 'hidden'}}>
                          <div ref={frontRef} style={{width: 350, height: 490}}><IdCardFront instructor={instructor} id="self_front" /></div>
                       </div>
                       <div className="absolute top-0 left-0 w-full h-full" style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
                          <div ref={backRef} style={{width: 350, height: 490}}><IdCardBack instructor={instructor} id="self_back" /></div>
                       </div>
                    </div>
                  </div>
                  <button onClick={downloadCard} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
                    <Download size={18} /> Download High-Res ID
                  </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'notices' && <InstructorNotices setLoading={setLoading} />}
        {activeTab === 'leaves' && <InstructorLeaves instructorId={instructor.id} setLoading={setLoading} />}
        {activeTab === 'tools' && <InstructorTools instructorId={instructor.id} setLoading={setLoading} />}
        {activeTab === 'edit' && <InstructorEditRequest instructor={instructor} setLoading={setLoading} />}
      </main>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col border-b border-slate-100 pb-2">
    <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase mb-0.5">{label}</span>
    <span className="font-medium text-slate-700">{value || '—'}</span>
  </div>
);

// --- Sub Components ---

function InstructorNotices({ setLoading }) {
  const [notices, setNotices] = useState([]);
  
  useEffect(() => {
    getNotices().then(setNotices);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Notice Board</h2>
      {notices.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">No new notices.</div>
      ) : (
        <div className="space-y-4">
          {notices.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
               <h3 className="font-bold text-lg text-slate-800">{n.title}</h3>
               <p className="text-xs text-slate-400 mb-3">{new Date(n.created_at).toLocaleString()}</p>
               <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorLeaves({ instructorId, setLoading }) {
  const [leaves, setLeaves] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');

  const fetchL = () => getMyLeaves(instructorId).then(setLeaves);
  useEffect(() => { fetchL(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLeave({ instructor_id: instructorId, start_date: start, end_date: end, reason });
      setStart(''); setEnd(''); setReason('');
      await fetchL();
      alert('Leave application submitted!');
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="md:w-1/3">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
           <h3 className="font-bold text-lg mb-4">Apply for Leave</h3>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div><label className="text-xs font-bold text-slate-500">Start Date</label><input type="date" required value={start} onChange={e=>setStart(e.target.value)} className="w-full border p-2 rounded outline-none" /></div>
             <div><label className="text-xs font-bold text-slate-500">End Date</label><input type="date" required value={end} onChange={e=>setEnd(e.target.value)} className="w-full border p-2 rounded outline-none" /></div>
             <div><label className="text-xs font-bold text-slate-500">Reason</label><textarea required value={reason} onChange={e=>setReason(e.target.value)} className="w-full border p-2 rounded outline-none" rows="3"></textarea></div>
             <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Submit Request</button>
           </form>
         </div>
       </div>
       <div className="flex-1">
         <h3 className="font-bold text-lg mb-4">Leave History</h3>
         <div className="space-y-3">
           {leaves.length === 0 && <p className="text-slate-500">No leaves applied.</p>}
           {leaves.map(l => (
             <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-800">{l.start_date} to {l.end_date}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${l.status==='Approved'?'bg-green-100 text-green-700':l.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                </div>
                <p className="text-sm text-slate-600">{l.reason}</p>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}

function InstructorTools({ instructorId, setLoading }) {
  const [tools, setTools] = useState([]);
  const [needed, setNeeded] = useState('');

  const fetchT = () => getMyToolRequests(instructorId).then(setTools);
  useEffect(() => { fetchT(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitToolRequest({ instructor_id: instructorId, tools_needed: needed });
      setNeeded('');
      await fetchT();
      alert('Request sent to Admin!');
    } catch (e) {
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
       <div className="md:w-1/3">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
           <h3 className="font-bold text-lg mb-4">Request Material</h3>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div><label className="text-xs font-bold text-slate-500">Items Needed</label><textarea required value={needed} onChange={e=>setNeeded(e.target.value)} className="w-full border p-2 rounded outline-none" rows="4" placeholder="e.g. 5 Welding Rods, 10m Wire"></textarea></div>
             <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Submit Request</button>
           </form>
         </div>
       </div>
       <div className="flex-1">
         <h3 className="font-bold text-lg mb-4">Request History</h3>
         <div className="space-y-3">
           {tools.length === 0 && <p className="text-slate-500">No requests.</p>}
           {tools.map(t => (
             <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${t.status==='Issued'?'bg-green-100 text-green-700':t.status==='Rejected'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                </div>
                <p className="text-sm font-medium text-slate-800">{t.tools_needed}</p>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}

function InstructorEditRequest({ instructor, setLoading }) {
  const [formData, setFormData] = useState({ phone: instructor.phone, address: instructor.address, email: instructor.email || '', blood_group: instructor.blood_group || '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitEditRequest({ instructor_id: instructor.id, requested_updates: formData });
      alert('Edit request submitted to Admin for approval!');
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Update Profile Details</h2>
        <p className="text-sm text-slate-500 mb-6">Modify the fields you want to update. The Admin will review and approve your changes, which will then reflect automatically on your ID Card.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           <div><label className="text-xs font-bold text-slate-500">Phone</label><input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded outline-none" required /></div>
           <div><label className="text-xs font-bold text-slate-500">Email</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded outline-none" /></div>
           <div><label className="text-xs font-bold text-slate-500">Blood Group</label><input type="text" value={formData.blood_group} onChange={e=>setFormData({...formData, blood_group: e.target.value})} className="w-full border p-2 rounded outline-none" /></div>
           <div><label className="text-xs font-bold text-slate-500">Address</label><textarea value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full border p-2 rounded outline-none" rows="3" required></textarea></div>
           
           <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded">Submit Update Request</button>
        </form>
      </div>
    </div>
  );
}
