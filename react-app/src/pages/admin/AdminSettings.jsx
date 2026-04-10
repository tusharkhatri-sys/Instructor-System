import { useState } from 'react';
import { uploadAdminSignature } from '../../services/instructorApi';

export default function AdminSettings({ setLoading }) {
  const [sigFile, setSigFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('https://wqjtvgndhcktvcgjmryc.supabase.co/storage/v1/object/public/photos/admin_signature.png');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSigFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!sigFile) {
      setErrorMsg('Please select a signature image first.');
      return;
    }
    
    setLoading(true);
    try {
      const url = await uploadAdminSignature(sigFile);
      setPreviewUrl(url);
      setSuccessMsg('Admin signature updated globally for all ID cards.');
    } catch (err) {
      setErrorMsg('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">System Settings</h2>
        <p className="text-slate-600">Configure global application settings and manage visual assets.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-white">
        <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">ID Card Configuration</h3>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="adminSig">
              Director Training Signature
            </label>
            <input
              type="file"
              id="adminSig"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-all outline-none"
            />
            
            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 shadow-inner max-w-[300px]">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Preview</p>
              <div className="h-16 flex items-center justify-center bg-slate-50 rounded border border-dashed border-slate-300">
                <img 
                  src={previewUrl} 
                  alt="Director Signature Preview" 
                  className="max-h-full max-w-full object-contain mix-blend-multiply"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  onLoad={(e) => { e.target.style.display = 'block'; }}
                />
              </div>
            </div>
            
            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
              <span className="text-blue-500">ℹ️</span>
              Upload a high-quality image of the signature. White backgrounds will be removed automatically on the ID card.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!sigFile}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all ${
                sigFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              Save Signature
            </button>
          </div>

          {successMsg && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
              ❌ {errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
