import React from 'react';
import { AIConcept, DesignBrief } from '../../types';

interface ResultsViewProps {
  concepts: AIConcept[];
  originalBrief: DesignBrief;
  onReset: () => void;
  onSelectConcept: (concept: AIConcept) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ concepts, originalBrief, onReset, onSelectConcept }) => {
  
  const getContainerAspectRatio = () => {
    const platform = originalBrief.platforms[0] || "";
    if (platform.includes("16:9")) return "aspect-video"; 
    if (platform.includes("9:16")) return "aspect-[9/16]"; 
    if (platform.includes("1:1")) return "aspect-square"; 
    return "aspect-[3/4]"; 
  };

  const containerRatioClass = getContainerAspectRatio();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">תוצאות</h1>
          <p className="text-slate-400 text-base max-w-xl font-light">
            הנה 4 כיוונים יצירתיים שנבנו ב-<span className="text-fuchsia-400 font-medium">Smart Studio</span> עבור <span className="text-white font-medium border-b border-fuchsia-500/30">{originalBrief.subject}</span>
          </p>
        </div>
        <button 
          onClick={onReset}
          className="text-sm font-bold bg-white/5 border border-white/10 hover:border-fuchsia-500/50 text-white px-6 py-3 rounded-full hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-fuchsia-500/10"
        >
          עיצוב חדש +
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {concepts.map((concept, index) => (
          <div key={index} className="group flex flex-col h-full bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-fuchsia-500/30 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/20 backdrop-blur-sm">
            
            <div className="px-6 py-5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
               <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">כיוון {index + 1}</span>
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                 {index + 1}
               </div>
            </div>
            
            <div className={`relative w-full bg-black/60 overflow-hidden ${containerRatioClass}`}>
              {concept.imageUrl ? (
                <>
                    <img 
                        src={concept.imageUrl} 
                        alt={concept.title} 
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm z-10">
                        <button 
                            onClick={() => onSelectConcept(concept)}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-10 py-4 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-fuchsia-600/30"
                        >
                            עריכה בסטודיו
                        </button>
                        <a 
                            href={concept.imageUrl} 
                            download={`design-${index+1}.png`}
                            className="text-slate-300 text-xs hover:text-white transition-colors flex items-center gap-1 bg-black/50 px-4 py-2 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3" />
                            </svg>
                            הורדה מהירה
                        </a>
                    </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 flex-col gap-2">
                   <div className="w-12 h-12 border border-slate-700 rounded-full flex items-center justify-center bg-slate-800/50">?</div>
                   <span className="text-sm font-medium">שגיאה ביצירת תמונה</span>
                </div>
              )}
            </div>

            <div className="p-8 flex-grow flex flex-col gap-4 relative">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <h3 className="text-2xl font-bold text-white group-hover:text-fuchsia-200 transition-colors">{concept.title}</h3>
              <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-3">{concept.visualDescription}</p>
              
              <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
                 <div className="flex gap-3 items-start bg-black/20 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] uppercase text-fuchsia-400 font-bold mt-1 min-w-[60px]">כותרת</span>
                    <p className="text-sm text-slate-200 font-medium italic">"{concept.headline}"</p>
                 </div>
                 <div className="flex gap-3 items-center">
                    <span className="text-[10px] uppercase text-violet-400 font-bold min-w-[60px]">אווירה</span>
                    <p className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/5">{concept.colorPaletteSuggestion}</p>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsView;