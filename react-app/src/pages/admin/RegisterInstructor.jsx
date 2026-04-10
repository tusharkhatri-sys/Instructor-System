import { useState } from 'react';
import { addInstructor, uploadPhoto, uploadSignature } from '../../services/instructorApi';
import { Upload } from 'lucide-react';

export default function RegisterInstructor({ setLoading, onSuccess }) {
  const [formData, setFormData] = useState({
    regEmpId: '', regName: '', regFather: '', regTrade: 'COPA', regDesig: 'Instructor',
    regPhone: '', regEmail: '', regDob: '', regJoin: '', regBlood: '',
    regAadhar: '', regPan: '', regCpf: '', regSi: '', regAddress: '',
    regItiName: '', regItiAddress: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [sigPreview, setSigPreview] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

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
    setMsg({ type: '', text: '' });
    
    if (!photoFile || !sigFile) {
      setMsg({ type: 'error', text: 'Photo and Signature are required.' });
      return;
    }
    
    setLoading(true);
    try {
      const empId = formData.regEmpId.trim();
      const photoUrl = await uploadPhoto(photoFile, empId);
      const sigUrl = await uploadSignature(sigFile, empId);
      
      const instructor = {
        id: empId,
        name: formData.regName.trim(),
        father_name: formData.regFather.trim(),
        trade: formData.regTrade,
        designation: formData.regDesig,
        phone: formData.regPhone.trim(),
        email: formData.regEmail.trim() || null,
        dob: formData.regDob || null,
        join_date: formData.regJoin || null,
        blood_group: formData.regBlood || null,
        aadhar_no: formData.regAadhar.trim() || null,
        pan_no: formData.regPan.trim() || null,
        cpf_gpf: formData.regCpf.trim() || null,
        si_no: formData.regSi.trim() || null,
        address: formData.regAddress.trim(),
        photo: photoUrl,
        signature: sigUrl,
        iti_name: formData.regItiName.trim(),
        iti_address: formData.regItiAddress.trim() || null
      };

      await addInstructor(instructor);
      
      setMsg({ type: 'success', text: `✅ Instructor registered successfully! Emp. ID: ${empId}` });
      setFormData({
        regEmpId: '', regName: '', regFather: '', regTrade: 'COPA', regDesig: 'Instructor',
        regPhone: '', regEmail: '', regDob: '', regJoin: '', regBlood: '',
        regAadhar: '', regPan: '', regCpf: '', regSi: '', regAddress: '',
        regItiName: '', regItiAddress: ''
      });
      setPhotoFile(null); setSigFile(null);
      setPhotoPreview(''); setSigPreview('');
      onSuccess();
      
    } catch (err) {
      setMsg({ type: 'error', text: 'Registration failed: ' + err.message });
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

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400 font-medium text-slate-800 bg-white shadow-sm";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Register New Instructor</h2>
        <p className="text-slate-600">Fill in all details carefully. Essential information will appear on the generated Employee ID Card.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputGroup label="Emp. ID" id="regEmpId" required>
              <input type="text" name="regEmpId" id="regEmpId" value={formData.regEmpId} onChange={handleChange} placeholder="e.g. ITI001" className={inputClass} required autoComplete="off" />
            </InputGroup>
            
            <InputGroup label="Full Name" id="regName" required>
              <input type="text" name="regName" id="regName" value={formData.regName} onChange={handleChange} placeholder="Enter full name" className={inputClass} required />
            </InputGroup>
            
            <InputGroup label="Father's Name" id="regFather">
              <input type="text" name="regFather" id="regFather" value={formData.regFather} onChange={handleChange} placeholder="Enter father's name" className={inputClass} />
            </InputGroup>

            <InputGroup label="Trade" id="regTrade" required>
              <select name="regTrade" id="regTrade" value={formData.regTrade} onChange={handleChange} className={inputClass} required>
                {trades.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputGroup>

            <InputGroup label="Designation" id="regDesig" required>
              <select name="regDesig" id="regDesig" value={formData.regDesig} onChange={handleChange} className={inputClass} required>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </InputGroup>

            <InputGroup label="Phone Number" id="regPhone" required>
               <input type="tel" name="regPhone" id="regPhone" value={formData.regPhone} onChange={handleChange} placeholder="10-digit mobile number" className={inputClass} required />
            </InputGroup>

            <InputGroup label="Email Address" id="regEmail">
               <input type="email" name="regEmail" id="regEmail" value={formData.regEmail} onChange={handleChange} placeholder="example@email.com" className={inputClass} />
            </InputGroup>

            <InputGroup label="Date of Birth" id="regDob" required>
               <input type="date" name="regDob" id="regDob" value={formData.regDob} onChange={handleChange} className={inputClass} required />
            </InputGroup>

            <InputGroup label="Joining Date" id="regJoin">
               <input type="date" name="regJoin" id="regJoin" value={formData.regJoin} onChange={handleChange} className={inputClass} />
            </InputGroup>

            <InputGroup label="Blood Group" id="regBlood">
              <select name="regBlood" id="regBlood" value={formData.regBlood} onChange={handleChange} className={inputClass}>
                <option value="">Select Group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </InputGroup>

            <InputGroup label="Aadhar No." id="regAadhar">
              <input type="text" name="regAadhar" id="regAadhar" value={formData.regAadhar} onChange={handleChange} placeholder="12-digit Aadhar" className={inputClass} />
            </InputGroup>

            <InputGroup label="PAN No." id="regPan">
              <input type="text" name="regPan" id="regPan" value={formData.regPan} onChange={handleChange} placeholder="Enter PAN" className={inputClass} />
            </InputGroup>

            <InputGroup label="CPF/GPF No." id="regCpf">
              <input type="text" name="regCpf" id="regCpf" value={formData.regCpf} onChange={handleChange} placeholder="Enter CPF/GPF No." className={inputClass} />
            </InputGroup>

            <InputGroup label="SI No." id="regSi">
              <input type="text" name="regSi" id="regSi" value={formData.regSi} onChange={handleChange} placeholder="Enter SI No." className={inputClass} />
            </InputGroup>
            
            <div className="md:col-span-2">
              <InputGroup label="Full Address" id="regAddress" required>
                <input type="text" name="regAddress" id="regAddress" value={formData.regAddress} onChange={handleChange} placeholder="Full residential address" className={inputClass} required />
              </InputGroup>
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <InputGroup label="ITI Name" id="regItiName" required>
                <input type="text" name="regItiName" id="regItiName" value={formData.regItiName} onChange={handleChange} placeholder="e.g. Government ITI, SAM" className={inputClass} required />
              </InputGroup>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <InputGroup label="ITI Address" id="regItiAddress">
                <input type="text" name="regItiAddress" id="regItiAddress" value={formData.regItiAddress} onChange={handleChange} placeholder="e.g. W-6, Residency Road" className={inputClass} />
              </InputGroup>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Media Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-700">Profile Photo <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setPhotoFile, setPhotoPreview)} required />
              </label>
              {photoPreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 mt-2 mx-auto shadow-sm">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-700">Instructor Signature <span className="text-red-500">*</span></label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-6 h-6 mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload signature</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setSigFile, setSigPreview)} required />
              </label>
              {sigPreview && (
                <div className="h-16 w-full rounded-lg bg-white border border-slate-200 mt-2 flex items-center justify-center shadow-sm p-2">
                  <img src={sigPreview} alt="Signature" className="max-h-full object-contain mix-blend-multiply" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button type="submit" className="w-full md:w-auto md:ml-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex justify-center items-center gap-2">
               Register Instructor
            </button>
            
            {msg.text && (
              <div className={`p-4 rounded-lg text-sm font-medium border ${msg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {msg.text}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
