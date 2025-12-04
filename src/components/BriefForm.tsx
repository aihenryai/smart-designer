import React, { useState, ChangeEvent } from 'react';
import { DesignBrief, ReferenceAttachment } from '../../types';
import { generateAutoFillSuggestion } from '../services/gemini';
import { fileToBase64 } from '../../utils';

interface BriefFormProps {
  onSubmit: (brief: DesignBrief) => void;
  isSubmitting: boolean;
}

const BriefForm: React.FC<BriefFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<DesignBrief>({
    subject: '',
    instructions: '',
    essentialInfo: '',
    targetAudience: '',
    goal: '',
    differentiation: '',
    platforms: [],
    coreMessage: '',
    callToAction: '',
    attachments: []
  });

  const [loadingField, setLoadingField] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: [platform]
    }));
  };

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
        } catch (err) {
          console.error("File read failed", err);
        }
      }
      setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== id) }));
  };

  const updateAttachmentInstruction = (id: string, instruction: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.map(a => a.id === id ? { ...a, userInstruction: instruction } : a)
    }));
  };

  const handleAutoFill = async (field: keyof DesignBrief) => {
    if (!formData.subject || !formData.instructions) return;
    setLoadingField(field);
    const suggestion = await generateAutoFillSuggestion(field, {
      subject: formData.subject,
      instructions: formData.instructions,
      essentialInfo: formData.essentialInfo
    });
    if (suggestion) setFormData(prev => ({ ...prev, [field]: suggestion }));
    setLoadingField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const platformOptions = [
    { label: "פוסט סושיאל (1:1)", value: "Post 1:1" },
    { label: "סטורי/טיקטוק (9:16)", value: "Story 9:16" },
    { label: "פרינט/פוסטר (3:4)", value: "Poster 3:4" },
    { label: "מסך רחב/מצגת (16:9)", value: "Screen 16:9" }
  ];

  const canUseAutoFill = !!(formData.subject && formData.instructions);

  const fieldLabels: Record<string, string> = {
    targetAudience: 'קהל יעד',
    goal: 'מטרה עסקית',
    differentiation: 'ייחוד מותגי',
    callToAction: 'הנעה לפעולה',
    coreMessage: 'מסר מרכזי'
  };

  const MagicWandButton = ({ field, label }: { field: keyof DesignBrief, label: string }) => {
    const isLoading = loadingField === field;
    
    return (
      <button
        type="button"
        onClick={() => handleAutoFill(field)}
        disabled={!canUseAutoFill || isLoading}
        className={`text-xs font-bold flex items-center gap-2 px-4 py-1.5 rounded-full transition-all mb-2 shadow-lg border border-transparent ${
          canUseAutoFill 
            ? 'text-white bg-slate-800 hover:bg-slate-700 hover:border-fuchsia-500/50 hover:shadow-fuchsia-500/20' 
            : 'text-slate-500 bg-white/5 cursor-not-allowed'
        } ${isLoading ? 'bg-slate-800 cursor-wait pl-3' : ''}`}
        title={canUseAutoFill ? `קבל הצעת AI עבור ${label}` : "יש למלא נושא והוראות תחילה"}
      >
        {isLoading ? (
          <>
             <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span className="text-fuchsia-300">מחולל הצעה...</span>
          </>
        ) : (
          <>
            <span className="text-sm bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">✨</span>
            <span>הצעת AI ל{label}</span>
          </>
        )}
      </button>
    );
  };

  const inputClasses = "w-full p-4 bg-slate-900/40 border border-white/10 text-slate-100 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent focus:bg-slate-900/60 focus:outline-none transition-all placeholder-slate-500 hover:border-white/20 hover:bg-slate-900/50";
  const labelClasses = "block text-xs font-bold text-slate-400 mb-2 tracking-wide uppercase";
  const sectionHeaderClasses = "text-2xl font-bold text-white tracking-tight";
  
  const StepIndicator = ({ num }: { num: string }) => (
    <div className="w-10 h-10 rounded-full relative flex items-center justify-center bg-slate-900 text-white font-bold text-lg shadow-xl">
      <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-orange-500" style={{mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor'}}></div>
      {num}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto relative">
      
      <div className="relative z-10 glass-panel rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"></div>

        <div className="text-center mb-16 relative">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-sm">
            יצירת עיצוב חדש
          </h1>
          <p className="text-slate-400 font-light text-lg">
            הזן את פרטי הבריף ו-<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 font-medium">Smart Studio</span> ייצר עבורך סקיצות מרהיבות.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="01" />
               <h2 className={sectionHeaderClasses}>הגדרת הפרויקט</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>נושא העיצוב <span className="text-fuchsia-500">*</span></label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  className={inputClasses} 
                  placeholder="לדוגמה: פוסט לאינסטגרם למותג אופנה, לוגו לחברת הייטק..." 
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>תיאור והנחיות עיצוב <span className="text-fuchsia-500">*</span></label>
                <textarea 
                  name="instructions" 
                  required 
                  value={formData.instructions} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-32`} 
                  placeholder="לדוגמה: סגנון נקי ויוקרתי, שימוש בצבעי שחור וזהב, מראה מינימליסטי..." 
                />
              </div>
            </div>
          </section>

          <section>
             <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="02" />
               <h2 className={sectionHeaderClasses}>השראה (רשות)</h2>
            </div>
            
            <div className="bg-slate-900/30 p-6 rounded-2xl border border-dashed border-white/10 hover:border-fuchsia-500/30 transition-all group">
               {formData.attachments.length > 0 && (
                   <div className="grid grid-cols-1 gap-3 mb-6">
                      {formData.attachments.map((file) => (
                        <div key={file.id} className="bg-slate-800/80 p-3 rounded-xl border border-white/5 flex gap-4 items-center">
                           <div className="w-12 h-12 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden border border-white/5">
                              {file.mimeType.startsWith('image/') ? (
                                 <img src={file.fileBase64} alt={file.fileName} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px] font-bold">FILE</div>
                              )}
                           </div>
                           <div className="flex-grow">
                              <div className="flex justify-between items-center mb-1">
                                 <span className="text-sm text-slate-200 truncate max-w-[200px]">{file.fileName}</span>
                                 <button type="button" onClick={() => removeAttachment(file.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                 </button>
                              </div>
                              <input 
                                 type="text"
                                 placeholder="מה לקחת מכאן?"
                                 className="w-full bg-transparent border-none p-0 text-xs text-slate-400 placeholder-slate-600 focus:ring-0"
                                 value={file.userInstruction}
                                 onChange={(e) => updateAttachmentInstruction(file.id, e.target.value)}
                              />
                           </div>
                        </div>
                      ))}
                   </div>
               )}
               
               <div className="text-center py-4">
                  <input type="file" multiple id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*,text/plain" />
                  <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all text-sm font-bold group-hover:text-white group-hover:border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-fuchsia-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l7.5-7.5 7.5 7.5M12 3v18" />
                    </svg>
                    העלאת קבצים
                  </label>
               </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="03" />
               <h2 className={sectionHeaderClasses}>אפיון ודיוק</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>טקסטים ופרטים טכניים (רשות)</label>
                <textarea 
                  name="essentialInfo" 
                  value={formData.essentialInfo} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-28`} 
                  placeholder="רשמו כאן את הטקסט שיופיע על גבי העיצוב" 
                />
              </div>
              {['targetAudience', 'goal', 'differentiation', 'callToAction'].map((field) => (
                 <div key={field} className={field === 'differentiation' || field === 'coreMessage' ? 'col-span-1 md:col-span-2' : ''}>
                   <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <label className={labelClasses}>
                         {fieldLabels[field] || field}
                      </label>
                      <MagicWandButton field={field as any} label={fieldLabels[field] || field} />
                   </div>
                   <input 
                      type="text" 
                      name={field} 
                      value={(formData as any)[field]} 
                      onChange={handleInputChange} 
                      className={inputClasses} 
                      placeholder={
                        field === 'targetAudience' ? 'לדוגמה: בני 20-35' :
                        field === 'goal' ? 'קידום מכירות' : ''
                      }
                    />
                 </div>
              ))}
              <div className="col-span-1 md:col-span-2">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className={labelClasses}>מסר מרכזי</label>
                  <MagicWandButton field="coreMessage" label="מסר מרכזי" />
                </div>
                <textarea 
                  name="coreMessage" 
                  value={formData.coreMessage} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-24`} 
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="04" />
               <h2 className={sectionHeaderClasses}>פורמט רוחב גובה</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platformOptions.map(platform => (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.value)}
                  className={`px-6 py-5 rounded-xl text-sm transition-all border text-right flex items-center justify-between group ${
                    formData.platforms.includes(platform.value)
                      ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/10'
                      : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-bold group-hover:text-white transition-colors text-base">{platform.label}</span>
                  {formData.platforms.includes(platform.value) && (
                     <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-glow"></div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-xl text-xl font-black text-white transition-all transform mt-12 border border-white/10 tracking-wide ${
              isSubmitting 
                ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:shadow-2xl hover:shadow-fuchsia-600/30 hover:-translate-y-1'
            }`}
          >
            {isSubmitting ? 'מעבד...' : 'צור סקיצות'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BriefForm;
