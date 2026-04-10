import { useState, useEffect } from 'react';
import { getPendingEditRequests, updateEditRequestStatus, updateInstructor } from '../../services/instructorApi';
import { UserCog, CheckCircle, XCircle } from 'lucide-react';

export default function EditRequestsAdmin({ setLoading, onRefresh }) {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingEditRequests();
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

  const handleApprove = async (req) => {
    if (!window.confirm('Approve these changes? They will overwrite the instructor\'s data.')) return;
    try {
      setLoading(true);
      await updateInstructor(req.instructor_id, req.requested_updates);
      await updateEditRequestStatus(req.id, 'Approved');
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this edit request?')) return;
    try {
      setLoading(true);
      await updateEditRequestStatus(id, 'Rejected');
      await fetchRequests();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Rejection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Update Requests</h2>
        <p className="text-slate-600">Review and approve changes submitted by instructors to their official records.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
          <UserCog size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-slate-800">Pending Approvals ({requests.length})</h3>
        </div>

        {requests.length === 0 ? (
           <div className="text-center py-12 text-slate-500">
             No pending profile update requests.
           </div>
        ) : (
           <div className="grid grid-cols-1 gap-6">
             {requests.map(req => (
               <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                   <div>
                     <h4 className="font-bold text-slate-800 text-lg">{req.instructors?.name || 'Instructor'}</h4>
                     <p className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">{req.instructor_id}</p>
                   </div>
                 </div>
                 
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                   <h5 className="text-sm font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">Requested Changes:</h5>
                   <ul className="text-sm space-y-1">
                     {Object.entries(req.requested_updates).map(([key, value]) => {
                       // Skip empty or ignored fields if needed, but here we assume the JSON only contains the diff or the full payload.
                       // Usually, displaying the full payload is okay if they submitted the whole form.
                       return (
                         <li key={key} className="flex gap-2">
                           <span className="font-semibold text-slate-600 w-32 capitalize">{key.replace('_', ' ')}:</span>
                           <span className="text-slate-900 break-all">{value || <em className="text-slate-400">Empty</em>}</span>
                         </li>
                       );
                     })}
                   </ul>
                 </div>

                 <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                   <button onClick={() => handleReject(req.id)} className="px-4 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm font-bold transition-colors">
                     Reject
                   </button>
                   <button onClick={() => handleApprove(req)} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white shadow-sm rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                     <CheckCircle size={16} /> Approve & Update
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
