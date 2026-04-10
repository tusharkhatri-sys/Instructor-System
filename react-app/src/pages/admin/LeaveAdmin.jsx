import { useState, useEffect } from 'react';
import { getPendingLeaves, updateLeaveStatus } from '../../services/instructorApi';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function LeaveAdmin({ setLoading, onRefresh }) {
  const [leaves, setLeaves] = useState([]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getPendingLeaves();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatus = async (id, status) => {
    if (!window.confirm(`Mark this leave as ${status}?`)) return;
    try {
      setLoading(true);
      await updateLeaveStatus(id, status);
      await fetchLeaves();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Leave Approvals</h2>
        <p className="text-slate-600">Review and manage time-off requests from instructors.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
          <Calendar size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Pending Requests ({leaves.length})</h3>
        </div>

        {leaves.length === 0 ? (
           <div className="text-center py-12 text-slate-500">
             No pending leave requests!
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {leaves.map(l => (
               <div key={l.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <h4 className="font-bold text-slate-800 text-lg">{l.instructors?.name || 'Unknown'}</h4>
                     <p className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{l.instructor_id}</p>
                   </div>
                   <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">Pending</span>
                 </div>
                 
                 <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                   <div className="flex justify-between mb-1">
                     <span className="text-slate-500">From:</span>
                     <span className="font-semibold">{l.start_date}</span>
                   </div>
                   <div className="flex justify-between mb-2">
                     <span className="text-slate-500">To:</span>
                     <span className="font-semibold">{l.end_date}</span>
                   </div>
                   <div className="border-t border-slate-200 pt-2 mt-2">
                     <span className="text-slate-500 block text-xs mb-1">Reason:</span>
                     <p className="text-slate-700 font-medium italic">"{l.reason}"</p>
                   </div>
                 </div>

                 <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                   <button onClick={() => handleStatus(l.id, 'Rejected')} className="flex items-center justify-center gap-1.5 py-2 hover:bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold transition-colors">
                     <XCircle size={16} /> Reject
                   </button>
                   <button onClick={() => handleStatus(l.id, 'Approved')} className="flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-bold transition-colors">
                     <CheckCircle size={16} /> Approve
                   </button>
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
