import { useState } from 'react';
import { updateInstructor, uploadPhoto, uploadSignature } from '../../services/instructorApi';
import { X, Upload } from 'lucide-react';

export default function EditInstructorModal({ instructor, onClose, onRefresh, setLoading }) {
  const [formData, setFormData] = useState({
    name: instructor.name || '',
    father_name: instructor.father_name || '',
    trade: instructor.trade || 'COPA',
    designation: instructor.designation || 'Instructor',
    phone: instructor.phone || '',
    email: instructor.email || '',
    dob: instructor.dob || '',
    join_date: instructor.join_date || '',
    blood_group: instructor.blood_group || '',
    aadhar_no: instructor.aadhar_no || '',
    pan_no: instructor.pan_no || '',
    cpf_gpf: instructor.cpf_gpf || '',
    si_no: instructor.si_no || '',
    address: instructor.address || '',
    iti_name: instructor.iti_name || '',
    iti_address: instructor.iti_address || ''
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(instructor.photo || '');
  const [sigPreview, setSigPreview] = useState(instructor.signature || '');
  const [errorMsg, setErrorMsg] = useState('');

  const trades = ["COPA", "Electrician", "Fitter", "Welder", "Mechanic Diesel", "Wireman", "Plumber", "Turner", "Machinist", "Other"];
  const designations = ["Instructor", "Senior Instructor", "Group Instructor", "Principal", "Superintendent", "Other"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    try {
      let finalPhotoUrl = instructor.photo;
      let finalSigUrl = instructor.signature;

      // Handle new uploads if selected
      if (photoFile) finalPhotoUrl = await uploadPhoto(photoFile, instructor.id);
      if (sigFile) finalSigUrl = await uploadSignature(sigFile, instructor.id);
      
      const updates = {
        name: formData.name.trim(),
        father_name: formData.father_name.trim(),
        trade: formData.trade,
        designation: formData.designation,
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        dob: formData.dob || null,
        join_date: formData.join_date || null,
        blood_group: formData.blood_group || null,
        aadhar_no: formData.aadhar_no.trim() || null,
        pan_no: formData.pan_no.trim() || null,
        cpf_gpf: formData.cpf_gpf.trim() || null,
        si_no: formData.si_no.trim() || null,
        address: formData.address.trim(),
        photo: finalPhotoUrl,
        signature: finalSigUrl,
        iti_name: formData.iti_name.trim(),
        iti_address: formData.iti_address.trim() || null
      };

      await updateInstructor(instructor.id, updates);
      await onRefresh();
      onClose(); // Close modal on success
      
    } catch (err) {
      setErrorMsg('Update failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const InputGroup = ({ label, id, children, required }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Edit Instructor / ID Card Details</h3>
            <p className="text-sm text-slate-500">Editing Emp. ID: {instructor.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6">
          <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputGroup label="Full Name" id="name" required>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} required />
              </InputGroup>
              
              <InputGroup label="Father's Name" id="father_name">
                <input type="text" name="father_name" id="father_name" value={formData.father_name} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="Trade" id="trade" required>
                <select name="trade" id="trade" value={formData.trade} onChange={handleChange} className={inputClass} required>
                  {trades.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </InputGroup>

              <InputGroup label="Designation" id="designation" required>
                <select name="designation" id="designation" value={formData.designation} onChange={handleChange} className={inputClass} required>
                  {designations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </InputGroup>

              <InputGroup label="Phone Number" id="phone" required>
                 <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} required />
              </InputGroup>

              <InputGroup label="Email Address" id="email">
                 <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="Date of Birth" id="dob" required>
                 <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className={inputClass} required />
              </InputGroup>

              <InputGroup label="Joining Date" id="join_date">
                 <input type="date" name="join_date" id="join_date" value={formData.join_date} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="Blood Group" id="blood_group">
                <select name="blood_group" id="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                  <option value="">Select Group</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </InputGroup>

              <InputGroup label="Aadhar No." id="aadhar_no">
                <input type="text" name="aadhar_no" id="aadhar_no" value={formData.aadhar_no} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="PAN No." id="pan_no">
                <input type="text" name="pan_no" id="pan_no" value={formData.pan_no} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="CPF/GPF No." id="cpf_gpf">
                <input type="text" name="cpf_gpf" id="cpf_gpf" value={formData.cpf_gpf} onChange={handleChange} className={inputClass} />
              </InputGroup>

              <InputGroup label="SI No." id="si_no">
                <input type="text" name="si_no" id="si_no" value={formData.si_no} onChange={handleChange} className={inputClass} />
              </InputGroup>
              
              <div className="md:col-span-2 lg:col-span-3">
                <InputGroup label="Full Address" id="address" required>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} required />
                </InputGroup>
              </div>

              <div className="md:col-span-1">
                <InputGroup label="ITI Name" id="iti_name" required>
                  <input type="text" name="iti_name" id="iti_name" value={formData.iti_name} onChange={handleChange} className={inputClass} required />
                </InputGroup>
              </div>

              <div className="md:col-span-2">
                <InputGroup label="ITI Address" id="iti_address">
                  <input type="text" name="iti_address" id="iti_address" value={formData.iti_address} onChange={handleChange} className={inputClass} />
                </InputGroup>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Media Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Update Profile Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-md object-cover border border-slate-300" />
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">Select New Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setPhotoFile, setPhotoPreview)} />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Update Signature (Optional)</label>
                <div className="flex items-center gap-4">
                  {sigPreview && (
                    <div className="h-16 w-32 bg-white border border-slate-300 rounded-md flex items-center justify-center p-1">
                      <img src={sigPreview} alt="Signature" className="max-h-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 font-medium">Select New Signature</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setSigFile, setSigPreview)} />
                  </label>
                </div>
              </div>
            </div>

            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
                  {errorMsg}
                </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} type="button" className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button form="editForm" type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
