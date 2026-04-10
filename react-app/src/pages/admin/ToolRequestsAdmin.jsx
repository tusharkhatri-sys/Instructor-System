import { useState, useEffect } from 'react';
import { getPendingToolRequests, updateToolRequestStatus } from '../../services/instructorApi';
import { Hammer, CheckCircle, XCircle } from 'lucide-react';

export default function ToolRequestsAdmin({ setLoading, onRefresh }) {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingToolRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatus = async (id, status) => {
    if (!window.confirm(`Mark this tool request as ${status}?`)) return;
    try {
      setLoading(true);
      await updateToolRequestStatus(id, status);
      await fetchRequests();
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Material & Tool Requests</h2>
        <p className="text-slate-600">Review inventory requests from instructors for workshop practicals.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
          <Hammer size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Pending Issues ({requests.length})</h3>
        </div>

        {requests.length === 0 ? (
           <div className="text-center py-12 text-slate-500">
             No pending tool requests.
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {requests.map(req => (
               <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <h4 className="font-bold text-slate-800 text-lg">{req.instructors?.name || 'Unknown'}</h4>
                     <p className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{req.instructor_id}</p>
                   </div>
                   <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">Pending</span>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm flex-1">
                   <span className="text-slate-500 block text-xs mb-1">Requested Items:</span>
                   <p className="text-slate-800 font-medium">{req.tools_needed}</p>
                 </div>

                 <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
                   <button onClick={() => handleStatus(req.id, 'Rejected')} className="flex items-center justify-center gap-1.5 py-2 hover:bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-bold transition-colors">
                     <XCircle size={16} /> Reject
                   </button>
                   <button onClick={() => handleStatus(req.id, 'Issued')} className="flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-bold transition-colors">
                     <CheckCircle size={16} /> Issue Tools
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
