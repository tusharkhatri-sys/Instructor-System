import './IdCard.css';

export default function IdCardFront({ instructor, id }) {
  if (!instructor) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div id={id} className="id-card">
      <svg className="absolute top-0 left-0 w-full h-full z-0" viewBox="0 0 350 490" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`${id}_cardBg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4eaf7"/>
            <stop offset="30%" stopColor="#e8f4fd"/>
            <stop offset="100%" stopColor="#ffffff"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="350" height="490" fill={`url(#${id}_cardBg)`}/>
        <rect x="0" y="0" width="350" height="6" fill="#1a73a7"/>
        <rect x="0" y="484" width="350" height="6" fill="#1a73a7"/>
      </svg>
      <div className="idc-content">
        <div className="idc-front-logos">
          <div className="idc-fl-left">
            <img src="/assets/iti_logo.png" alt="ITI" crossOrigin="anonymous" />
          </div>
          <div className="idc-fl-center">
            <img src="/assets/ashok_emblem.png" alt="Emblem" crossOrigin="anonymous" />
          </div>
          <div className="idc-fl-right">
            <img src="/assets/skill_india_logo.png" alt="Skill India" crossOrigin="anonymous" />
          </div>
        </div>
        <div className="idc-front-dept">
          <div className="idc-fd-1">SKILL, EMPLOYMENT & ENTREPRENEURSHIP DEPARTMENT</div>
          <div className="idc-fd-2">DIRECTORATE OF TECHNICAL EDUCATION (TRAINING)</div>
          <div className="idc-fd-3">{instructor.iti_address || 'W-6, RESIDENCY ROAD, GAURAV PATH, JODHPUR'}</div>
        </div>
        <div className="idc-front-title">EMPLOYEE IDENTITY CARD</div>
        <div className="idc-front-photo">
          <img src={instructor.photo || "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2QxZDVkYiIgZD0iTTEyIDJDMiAyIDIgNCAyIDRzMTAgMiAxMCAyczEwLTIgMTAtMmMwIDAgMC0yLTEwLTJ6bTAgNDg9PSIvPjwvc3ZnPg=="} crossOrigin="anonymous" />
        </div>
        <div className="idc-front-name">{instructor.name}</div>
        <div className="idc-front-desig">{instructor.designation} {instructor.iti_name ? instructor.iti_name : ''}</div>
        <div className="idc-front-info">
          <div className="idc-fi-row"><span className="idc-fi-lbl">Emp. ID</span><span className="idc-fi-sep">:</span><span className="idc-fi-val">{instructor.id}</span></div>
          <div className="idc-fi-row"><span className="idc-fi-lbl">Date of Birth</span><span className="idc-fi-sep">:</span><span className="idc-fi-val">{formatDate(instructor.dob)}</span></div>
          <div className="idc-fi-row"><span className="idc-fi-lbl">Father Name</span><span className="idc-fi-sep">:</span><span className="idc-fi-val">{instructor.father_name || '—'}</span></div>
        </div>
        <div className="idc-front-sigs">
          <div className="idc-fs-item">
            {instructor.signature ? 
              <img src={instructor.signature} className="idc-sig-img" crossOrigin="anonymous" /> 
              : <svg className="idc-fs-svg" viewBox="0 0 100 30"><path d="M10 20 C20 8,30 25,40 12 S60 25,70 15 S85 22,95 10" fill="none" stroke="#333" strokeWidth="1.2"/></svg>
            }
            <div className="idc-fs-label">Emp. Sign.</div>
          </div>
          <div className="idc-fs-item">
            <img 
               src="https://wqjtvgndhcktvcgjmryc.supabase.co/storage/v1/object/public/photos/admin_signature.png" 
               className="idc-sig-img" 
               crossOrigin="anonymous" 
               onError={(e) => {
                 e.target.style.display='none'; 
                 e.target.nextElementSibling.style.display='block';
               }}
            />
            <svg className="idc-fs-svg hidden" viewBox="0 0 100 30" style={{display: 'none'}}><path d="M10 15 Q25 5,40 20 T65 12 T90 18" fill="none" stroke="#333" strokeWidth="1.2"/></svg>
            <div className="idc-fs-label">Director Training</div>
          </div>
        </div>
      </div>
    </div>
  );
}
