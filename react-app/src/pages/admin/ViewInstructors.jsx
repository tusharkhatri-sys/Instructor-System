import { useState } from 'react';
import { removeInstructor } from '../../services/instructorApi';
import { Search, Users, Trash2, FileBadge, Edit } from 'lucide-react';
import EditInstructorModal from './EditInstructorModal';

export default function ViewInstructors({ instructors, setLoading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [editingInstructor, setEditingInstructor] = useState(null);

  const filtered = instructors.filter(inst => {
    const q = search.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.id.toLowerCase().includes(q) ||
      inst.trade.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    setLoading(true);
    try {
      await removeInstructor(id);
      await onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Registered Instructors</h2>
          <p className="text-slate-600">Manage all registered staff in the ITI Instructor System.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or trade..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
             <Users size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{instructors.length}</p>
             <p className="text-sm font-medium text-slate-500">Total Instructors</p>
           </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-white flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
             <FileBadge size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-slate-800">{instructors.length}</p>
             <p className="text-sm font-medium text-slate-500">ID Cards Available</p>
           </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 border border-white">
          <Users size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No instructors found</h3>
          <p>Register a new instructor or adjust your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(inst => (
            <div key={inst.id} className="glass-card bg-white/60 rounded-xl overflow-hidden border border-white hover:shadow-lg transition-all group flex flex-col">
              <div className="h-24 bg-gradient-to-r from-[#1a73a7] to-[#3bb2ce] relative">
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                  <img src={inst.photo} alt={inst.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-10 pb-4 px-4 text-center flex-1 flex flex-col">
                <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{inst.name}</h4>
                <p className="text-xs font-semibold text-blue-600 bg-blue-50 py-1 px-2 rounded-md mx-auto mt-1 mb-2 inline-block">
                  {inst.trade}
                </p>
                <p className="text-sm text-slate-500 font-mono mb-auto bg-slate-100 px-2 py-0.5 rounded-md self-center">{inst.id}</p>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-2">
                  <button 
                    onClick={() => setEditingInstructor(inst)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(inst.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conditionally Render Edit Modal */}
      {editingInstructor && (
        <EditInstructorModal
          instructor={editingInstructor}
          onClose={() => setEditingInstructor(null)}
          onRefresh={onRefresh}
          setLoading={setLoading}
        />
      )}
    </div>
  );
}
