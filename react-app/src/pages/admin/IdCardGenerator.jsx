import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import IdCardFront from '../../components/idcard/IdCardFront';
import IdCardBack from '../../components/idcard/IdCardBack';

export default function IdCardGenerator({ instructors, setLoading }) {
  const [selectedInstId, setSelectedInstId] = useState('');

  const selectedInst = instructors.find(i => i.id === selectedInstId);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const downloadCard = async () => {
    if (!selectedInst) return;
    setLoading(true);
    
    try {
      // Small timeout to ensure images are loaded
      await new Promise(r => setTimeout(r, 500));
      
      const frontEl = frontRef.current.querySelector('.id-card');
      const backEl = backRef.current.querySelector('.id-card');
      
      const config = { scale: 3, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' };
      
      const canvasFront = await html2canvas(frontEl, config);
      const canvasBack = await html2canvas(backEl, config);

      const finalCanvas = document.createElement('canvas');
      const margin = 30; 
      finalCanvas.width = canvasFront.width + canvasBack.width + (margin * 3);
      finalCanvas.height = Math.max(canvasFront.height, canvasBack.height) + (margin * 2);

      const ctx = finalCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      ctx.drawImage(canvasFront, margin, margin);
      ctx.drawImage(canvasBack, canvasFront.width + (margin * 2), margin);

      const link = document.createElement('a');
      link.download = `ID_Card_${selectedInst.id}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      alert('Error generating ID card: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ID Card Generator</h2>
        <p className="text-slate-600">Select an instructor to preview and download their official Employee ID Card.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-white">
        <div className="mb-8">
           <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="instructorSelect">Select Instructor</label>
           <select 
              id="instructorSelect" 
              className="w-full max-w-md px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-white shadow-sm"
              value={selectedInstId}
              onChange={e => setSelectedInstId(e.target.value)}
           >
              <option value="">-- Choose an Instructor --</option>
              {instructors.map(inst => (
                 <option key={inst.id} value={inst.id}>{inst.name} ({inst.id})</option>
              ))}
           </select>
        </div>

        {selectedInst && (
          <div className="flex justify-center flex-col items-center">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div ref={frontRef} className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200" style={{width: 350, height: 490}}>
                 <IdCardFront instructor={selectedInst} id="preview_front" />
              </div>
              <div ref={backRef} className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200" style={{width: 350, height: 490}}>
                 <IdCardBack instructor={selectedInst} id="preview_back" />
              </div>
            </div>

            <button 
               onClick={downloadCard}
               className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all flex items-center gap-3 text-lg"
            >
              <Download size={20} />
              Download High-Res ID Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
