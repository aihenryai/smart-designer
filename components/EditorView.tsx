import React, { useState, ChangeEvent } from 'react';
import { AIConcept, ReferenceAttachment } from '../types';
import { updateConceptImage } from '../services/gemini';
import { fileToBase64 } from '../utils';
import { jsPDF } from "jspdf";

interface EditorViewProps {
  concept: AIConcept;
  initialEssentialInfo: string;
  onBack: () => void;
  onUpdate: (updatedConcept: AIConcept) => void;
}

const EditorView: React.FC<EditorViewProps> = ({ concept, initialEssentialInfo, onBack, onUpdate }) => {
  const [headline, setHeadline] = useState(concept.headline);
  const [essentialInfo, setEssentialInfo] = useState(initialEssentialInfo);
  const [customRequest, setCustomRequest] = useState("");
  const [attachments, setAttachments] = useState<ReferenceAttachment[]>([]);
  
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [exportQuality, setExportQuality] = useState<"1K" | "2K" | "4K">("1K");
  const [exportFormat, setExportFormat] = useState<"png" | "jpg" | "pdf">("png");
  
  const [currentImageUrl, setCurrentImageUrl] = useState(concept.imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLabel, setProcessLabel] = useState("");
  const [currentResolution, setCurrentResolution] = useState<"1K" | "2K" | "4K">("1K");

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: ReferenceAttachment[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        try {
          const base64 = await fileToBase64(file);
          newAttachments.push({
            id: Math.random().toString(36).substring(7),
            fileName: file.name,
            mimeType: file.type,
            fileBase64: base64,
            userInstruction: ""
          });
        } catch (e) { console.error(e); }
      }
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const runGeneration = async (targetSize: "1K" | "2K" | "4K") => {
    try {
      const newImageUrl = await updateConceptImage(concept, {
        newHeadline: headline,
        newEssentialInfo: essentialInfo,
        userInstructions: customRequest,
        aspectRatio: aspectRatio,
        imageSize: targetSize
      }, attachments);
      
      setCurrentImageUrl(newImageUrl);
      setCurrentResolution(targetSize);
      return newImageUrl;
    } catch (error) {
      console.error(error);
      alert("שגיאה ביצירת התמונה");
      throw error;
    }
  };

  const handleUpdateDraft = async () => {
    setIsProcessing(true);
    setProcessLabel("מעבד שינויים...");
    try {
      const url = await runGeneration("1K");
      onUpdate({ ...concept, headline, imageUrl: url });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalDownload = async () => {
    setIsProcessing(true);
    setProcessLabel(exportQuality === "4K" ? "Upscaling..." : "מכין להורדה...");
    try {
        let downloadUrl = currentImageUrl;
        if (exportQuality !== currentResolution) {
            downloadUrl = await runGeneration(exportQuality);
        }

        if (exportFormat === 'pdf') {
            const doc = new jsPDF({
                orientation: aspectRatio === "16:9" ? "landscape" : "portrait",
                unit: "mm",
                format: "a4"
            });
            const w = doc.internal.pageSize.getWidth();
            const h = doc.internal.pageSize.getHeight();
            doc.addImage(downloadUrl!, 'PNG', 0, 0, w, h);
            doc.save(`design.pdf`);
        } else {
            const link = document.createElement('a');
            link.href = downloadUrl!;
            link.download = `design.${exportFormat}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (e) {
        console.error(e);
        alert("שגיאה בהורדה");
    } finally {
        setIsProcessing(false);
    }
  };

  const inputStyle = "w-full p-3 border border-white/5 rounded-xl bg-slate-900/50 text-slate-100 text-sm focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 focus:outline-none transition-all placeholder-slate-500";
  const labelStyle = "block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest";

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 flex flex-col gap-6 h-[calc(100vh-100px)]">
      
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 font-bold transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-white/20">
             <span className="text-lg leading-none">‹</span> חזרה לתוצאות
        </button>
        <div className="text-xs font-mono text-fuchsia-300 bg-fuchsia-500/10 px-3 py-1 rounded border border-fuchsia-500/20">
             {currentResolution} • {aspectRatio}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        <div className="flex-grow bg-slate-950/50 rounded-3xl flex items-center justify-center p-8 relative overflow-hidden border border-white/5 shadow-inner">
           <div className="absolute inset-0 opacity-[0.05]" style={{ 
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
           }}></div>
           
           {currentImageUrl && (
             <img 
               src={currentImageUrl} 
               className={`shadow-2xl transition-all duration-500 relative z-10 ${isProcessing ? 'blur-sm opacity-50 scale-[0.98]' : 'scale-100'} ring-1 ring-white/10`}
               style={{
                 aspectRatio: aspectRatio.replace(':', '/'),
                 maxHeight: '90%',
                 maxWidth: '90%',
                 objectFit: 'contain'
               }}
             />
           )}
           {isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="bg-slate-900/90 backdrop-blur-md px-10 py-6 rounded-2xl border border-fuchsia-500/30 flex flex-col items-center gap-4 shadow-2xl">
                  <div className="relative w-12 h-12">
                     <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-t-fuchsia-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">{processLabel}</span>
               </div>
             </div>
           )}
        </div>

        <div className="w-full lg:w-[380px] flex flex-col gap-4 bg-slate-900/40 border border-white/5 rounded-3xl p-6 overflow-y-auto backdrop-blur-md shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-2">עריכה ודיוק</h3>
            
            <div className="space-y-6 flex-grow">
                <div>
                    <label className={labelStyle}>Headline (Copy)</label>
                    <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className={inputStyle} />
                </div>
                
                <div>
                    <label className={labelStyle}>Content</label>
                    <textarea value={essentialInfo} onChange={(e) => setEssentialInfo(e.target.value)} className={`${inputStyle} h-24 resize-none`} />
                </div>

                <div>
                    <label className={labelStyle}>Visual Changes</label>
                    <textarea value={customRequest} onChange={(e) => setCustomRequest(e.target.value)} placeholder="תאר מה תרצה לשנות בעיצוב..." className={`${inputStyle} h-32 resize-none border-dashed border-white/20 focus:border-solid`} />
                </div>
                
                <div className="pt-2 border-t border-white/10">
                   <label className={labelStyle}>References</label>
                   <div className="flex flex-col gap-2 mb-3">
                       {attachments.map(att => (
                           <div key={att.id} className="flex justify-between items-center text-xs bg-slate-800/50 p-3 rounded-lg border border-white/5">
                               <span className="truncate max-w-[150px] text-slate-300 font-medium">{att.fileName}</span>
                               <button onClick={() => removeAttachment(att.id)} className="text-slate-500 hover:text-red-400 transition-colors">✕</button>
                           </div>
                       ))}
                   </div>
                   <label className="cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/5 hover:border-white/20">
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                        <span className="text-lg leading-none">+</span> העלאת קובץ רפרנס
                   </label>
                </div>
            </div>

            <div className="mt-4 pt-6 border-t border-white/10 space-y-4">
                <button onClick={handleUpdateDraft} disabled={isProcessing} className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-base transition-all disabled:opacity-50 shadow-lg shadow-fuchsia-900/30 transform active:scale-95">
                    עדכון סקיצה
                </button>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex gap-2">
                        <select 
                        value={exportQuality} 
                        onChange={(e) => setExportQuality(e.target.value as any)}
                        className="flex-1 bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-white/20"
                        >
                            <option value="1K">1K (מהיר)</option>
                            <option value="4K">4K (איכותי)</option>
                        </select>
                        <select 
                        value={exportFormat} 
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="flex-1 bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-white/20"
                        >
                            <option value="png">PNG</option>
                            <option value="jpg">JPG</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <button onClick={handleFinalDownload} disabled={isProcessing} className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg">
                        הורדה למחשב
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditorView;