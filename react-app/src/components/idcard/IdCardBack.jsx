import './IdCard.css';

export default function IdCardBack({ instructor, id }) {
  if (!instructor) return null;

  return (
    <div id={id} className="id-card">
      <svg className="absolute top-0 left-0 w-full h-full z-0" viewBox="0 0 350 490" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}_cardBgB`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="100%" stopColor="#e8f4fd"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="350" height="490" fill={`url(#${id}_cardBgB)`}/>
        <rect x="0" y="0" width="350" height="6" fill="#1a73a7"/>
        <rect x="0" y="484" width="350" height="6" fill="#1a73a7"/>
      </svg>
      <div className="idc-content">
        <div className="idc-back-header">
           <div className="idc-lanyard-slot"></div>
           <div className="idc-back-logo">
               <div className="idc-back-logo-img">
                   <img src="/assets/iti_logo.png" alt="ITI" crossOrigin="anonymous" />
               </div>
               <div className="idc-back-logo-txt">INDUSTRIAL TRAINING INSTITUTE</div>
           </div>
        </div>

        <div className="idc-back-details">
            <div className="idc-b-row"><span className="idc-b-lbl">Blood Group</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.blood_group || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">Phone</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.phone || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">Email</span><span className="idc-b-col">:</span><span className="idc-b-val" style={{lineBreak: 'anywhere'}}>{instructor.email || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">Address</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.address || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">Aadhar No.</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.aadhar_no || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">PAN No.</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.pan_no || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">CPF/GPF No.</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.cpf_gpf || '—'}</span></div>
            <div className="idc-b-row"><span className="idc-b-lbl">SI No.</span><span className="idc-b-col">:</span><span className="idc-b-val">{instructor.si_no || '—'}</span></div>
        </div>

        <div className="idc-back-footer">
            <div className="idc-bf-title">ISSUING AUTHORITY</div>
            <div className="idc-bf-val">PRINCIPAL / SUPERINTENDENT</div>
        </div>
      </div>
    </div>
  );
}
