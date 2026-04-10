import { useState, useEffect } from 'react';
import { getNotices, createNotice, deleteNotice } from '../../services/instructorApi';
import { Megaphone, Trash2, Send } from 'lucide-react';

export default function NoticeBoardAdmin({ setLoading }) {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    try {
      await createNotice({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      await fetchNotices();
    } catch (err) {
      alert('Failed to post notice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    setLoading(true);
    try {
      await deleteNotice(id);
      await fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (ds) => new Date(ds).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Notice Board</h2>
        <p className="text-slate-600">Post announcements and important updates globally to all instructors.</p>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 border border-white">
        <form onSubmit={handleCreate} className="space-y-4 mb-8 border-b border-slate-200 pb-8">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notice Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Government Holiday Tomorrow"
              required
            />
          </div>
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1">Message Content</label>
             <textarea 
               value={content} 
               onChange={e => setContent(e.target.value)} 
               className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
               placeholder="Enter the main message details here..."
               required
             />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow transition-all flex items-center gap-2">
            <Send size={16} /> Publish Notice
          </button>
        </form>

        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Megaphone size={20} className="text-slate-500" /> Recent Notices ({notices.length})
        </h3>
        
        {notices.length === 0 ? (
           <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
             No notices published yet.
           </div>
        ) : (
           <div className="space-y-4">
             {notices.map(n => (
               <div key={n.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative">
                 <button onClick={() => handleDelete(n.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                   <Trash2 size={16} />
                 </button>
                 <h4 className="font-bold text-slate-800 pr-8">{n.title}</h4>
                 <p className="text-xs text-slate-400 font-medium mb-3">{formatDate(n.created_at)}</p>
                 <p className="text-sm text-slate-600 whitespace-pre-wrap">{n.content}</p>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
