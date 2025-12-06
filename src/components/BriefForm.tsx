import React, { useState, ChangeEvent } from 'react';
import { DesignBrief, ReferenceAttachment } from '../../types';
import { generateAutoFillSuggestion } from '../services/api';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Quick select options for different fields
  const styleOptions = [
    'מינימליסטי',
    'צבעוני ושמח',
    'יוקרתי ואלגנטי',
    'מודרני וטכנולוגי',
    'חם וידידותי',
    'מקצועי ועסקי'
  ];

  const audienceOptions = [
    'צעירים (18-25)',
    'מבוגרים (25-45)',
    'משפחות',
    'אנשי עסקים',
    'כולם'
  ];

  const goalOptions = [
    'למכור משהו',
    'להכריז על מבצע',
    'להציג מוצר חדש',
    'לבנות מודעות למותג',
    'לגייס לקוחות'
  ];

  const ctaOptions = [
    'התקשרו עכשיו',
    'קנו עכשיו',
    'הזמינו מקום',
    'בקרו באתר',
    'הירשמו עכשיו',
    'שלחו הודעה'
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickSelect = (field: keyof DesignBrief, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: prev[field] ? `${prev[field]}, ${value}` : value 
    }));
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
    { label: "פוסט", shape: "ריבוע • 1:1", sublabel: "אינסטגרם, פייסבוק", value: "Post 1:1", icon: "📱" },
    { label: "סטורי", shape: "מלבן עומד • 9:16", sublabel: "טיקטוק, רילס", value: "Story 9:16", icon: "📲" },
    { label: "פוסטר", shape: "מלבן • 3:4", sublabel: "להדפסה, פלייר", value: "Poster 3:4", icon: "🖼️" },
    { label: "מסך מחשב", shape: "מלבן רחב • 16:9", sublabel: "מצגות, מסך רחב", value: "Screen 16:9", icon: "🖥️" }
  ];

  const canUseAutoFill = !!(formData.subject && formData.instructions);

  const fieldLabels: Record<string, { label: string; emoji: string }> = {
    targetAudience: { label: 'למי זה מיועד', emoji: '👥' },
    goal: { label: 'מה המטרה של הפוסט', emoji: '🎯' },
    differentiation: { label: 'מה מייחד את העסק', emoji: '⭐' },
    callToAction: { label: 'קריאה לפעולה', emoji: '👆' },
    coreMessage: { label: 'המסר המרכזי', emoji: '💬' }
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

  const QuickSelectButtons = ({ options, field }: { options: string[], field: keyof DesignBrief }) => (
    <div className="flex flex-wrap gap-2 mt-2 mb-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleQuickSelect(field, option)}
          className="px-3 py-1.5 text-xs bg-slate-800/50 hover:bg-slate-700/70 text-slate-300 hover:text-white border border-white/10 hover:border-fuchsia-500/50 rounded-lg transition-all"
        >
          {option}
        </button>
      ))}
    </div>
  );

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
          {/* Step 1: Project Definition */}
          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="01" />
               <h2 className={sectionHeaderClasses}>הגדרת הפרויקט</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              {/* Subject Field - Gender-inclusive */}
              <div>
                <label className={labelClasses}>
                  מה תרצה ליצור? ✨ <span className="text-fuchsia-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="subject" 
                  required 
                  value={formData.subject} 
                  onChange={handleInputChange} 
                  className={inputClasses} 
                  placeholder="פוסט לאינסטגרם | סטורי לטיקטוק | כרטיס ביקור | פלייר..." 
                />
                <p className="text-xs text-slate-500 mt-2">💡 טיפ: תיאור קצר - למשל ״פוסט לסייל חורף בחנות בגדים״</p>
              </div>

              {/* Instructions Field - Gender-inclusive */}
              <div>
                <label className={labelClasses}>
                  איך זה ייראה? 🎨 <span className="text-fuchsia-500">*</span>
                </label>
                <textarea 
                  name="instructions" 
                  required 
                  value={formData.instructions} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-32`} 
                  placeholder="תיאור הסגנון, הצבעים והאווירה הרצויים..." 
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-2">סגנונות מוכנים:</p>
                  <QuickSelectButtons options={styleOptions} field="instructions" />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Files & References - IMPROVED SECTION */}
          <section>
             <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="02" />
               <h2 className={sectionHeaderClasses}>קבצים ורפרנסים</h2>
            </div>
            
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-8 rounded-2xl border border-white/10 hover:border-fuchsia-500/30 transition-all group">
               <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                    <span className="text-2xl">📎</span>
                    העלה קבצים רלוונטיים
                  </h3>
                  <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    ה-AI ישתמש בקבצים שלך ליצירת עיצוב מותאם אישית
                  </p>
               </div>

               {/* File Type Examples with Icons */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5 hover:border-fuchsia-500/30 transition-all">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-xs font-bold text-white mb-1">לוגו</div>
                    <div className="text-[10px] text-slate-400">הלוגו שלך</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5 hover:border-fuchsia-500/30 transition-all">
                    <div className="text-3xl mb-2">🖼️</div>
                    <div className="text-xs font-bold text-white mb-1">תמונות השראה</div>
                    <div className="text-[10px] text-slate-400">עיצובים שאהבת</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5 hover:border-fuchsia-500/30 transition-all">
                    <div className="text-3xl mb-2">📸</div>
                    <div className="text-xs font-bold text-white mb-1">תמונות מוצר</div>
                    <div className="text-[10px] text-slate-400">תמונות שלך</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-white/5 hover:border-fuchsia-500/30 transition-all">
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="text-xs font-bold text-white mb-1">עיצובים קיימים</div>
                    <div className="text-[10px] text-slate-400">לשיפור/עדכון</div>
                  </div>
               </div>
               
               {formData.attachments.length > 0 && (
                   <div className="grid grid-cols-1 gap-3 mb-6">
                      {formData.attachments.map((file) => (
                        <div key={file.id} className="bg-slate-800/80 p-4 rounded-xl border border-white/5 flex gap-4 items-center hover:border-fuchsia-500/30 transition-all">
                           <div className="w-20 h-20 bg-black/40 rounded-lg flex-shrink-0 overflow-hidden border border-white/10">
                              {file.mimeType.startsWith('image/') ? (
                                 <img src={file.fileBase64} alt={file.fileName} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">📄</div>
                              )}
                           </div>
                           <div className="flex-grow">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{file.fileName}</span>
                                 <button type="button" onClick={() => removeAttachment(file.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                 </button>
                              </div>
                              <input 
                                 type="text"
                                 placeholder="מה ה-AI צריך לדעת על הקובץ הזה? (רשות)"
                                 className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2 text-xs text-slate-300 placeholder-slate-600 focus:ring-1 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 focus:outline-none"
                                 value={file.userInstruction}
                                 onChange={(e) => updateAttachmentInstruction(file.id, e.target.value)}
                              />
                              <p className="text-[10px] text-slate-500 mt-1">לדוגמה: ״השתמש בצבעים מהלוגו״, ״שמור על הסגנון הזה״</p>
                           </div>
                        </div>
                      ))}
                   </div>
               )}
               
               <div className="text-center py-6 border-2 border-dashed border-white/10 rounded-xl hover:border-fuchsia-500/50 transition-all">
                  <input 
                    type="file" 
                    multiple 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                    accept="image/*,application/pdf,.pdf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer inline-flex flex-col items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl transition-all text-sm font-bold group-hover:text-white group-hover:border-white/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-fuchsia-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <div>
                      <div className="text-base mb-1">בחר קבצים להעלאה</div>
                      <div className="text-xs text-slate-500">תמונות, PDF או כל קובץ רלוונטי</div>
                    </div>
                  </label>
               </div>
               
               <p className="text-center text-xs text-slate-500 mt-4">
                 💡 <strong>טיפ:</strong> אפשר להעלות מספר קבצים בבת אחת
               </p>
            </div>
          </section>

          {/* Step 3: Refinement */}
          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="03" />
               <h2 className={sectionHeaderClasses}>אפיון ודיוק</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Essential Info Field - Gender-inclusive */}
               <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>מה לכתוב על העיצוב? 📝 (רשות)</label>
                <textarea 
                  name="essentialInfo" 
                  value={formData.essentialInfo} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-28`} 
                  placeholder="הכותרת, המחיר, פרטי יצירת קשר, או כל טקסט נוסף" 
                />
              </div>

              {/* Target Audience - Gender-inclusive */}
              <div>
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className={labelClasses}>
                    {fieldLabels.targetAudience.emoji} {fieldLabels.targetAudience.label}
                  </label>
                  <MagicWandButton field="targetAudience" label={fieldLabels.targetAudience.label} />
                </div>
                <input 
                  type="text" 
                  name="targetAudience" 
                  value={formData.targetAudience} 
                  onChange={handleInputChange} 
                  className={inputClasses} 
                  placeholder="קהל היעד - נשים, גברים, גיל מסוים?"
                />
                <QuickSelectButtons options={audienceOptions} field="targetAudience" />
              </div>

              {/* Goal - Gender-inclusive */}
              <div>
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className={labelClasses}>
                    {fieldLabels.goal.emoji} {fieldLabels.goal.label}
                  </label>
                  <MagicWandButton field="goal" label={fieldLabels.goal.label} />
                </div>
                <input 
                  type="text" 
                  name="goal" 
                  value={formData.goal} 
                  onChange={handleInputChange} 
                  className={inputClasses}
                  placeholder="המטרה העסקית של העיצוב"
                />
                <QuickSelectButtons options={goalOptions} field="goal" />
              </div>

              {/* Call to Action - UPDATED */}
              <div>
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className={labelClasses}>
                    {fieldLabels.callToAction.emoji} {fieldLabels.callToAction.label}
                  </label>
                  <MagicWandButton field="callToAction" label={fieldLabels.callToAction.label} />
                </div>
                <input 
                  type="text" 
                  name="callToAction" 
                  value={formData.callToAction} 
                  onChange={handleInputChange} 
                  className={inputClasses}
                  placeholder="התקשרו, קנו, בקרו..."
                />
                <QuickSelectButtons options={ctaOptions} field="callToAction" />
              </div>

              {/* Core Message - Gender-inclusive */}
              <div>
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <label className={labelClasses}>
                    {fieldLabels.coreMessage.emoji} {fieldLabels.coreMessage.label}
                  </label>
                  <MagicWandButton field="coreMessage" label={fieldLabels.coreMessage.label} />
                </div>
                <textarea 
                  name="coreMessage" 
                  value={formData.coreMessage} 
                  onChange={handleInputChange} 
                  className={`${inputClasses} h-24`}
                  placeholder="המשפט או הרעיון המרכזי של העיצוב"
                />
              </div>

              {/* Advanced Settings Toggle - ENHANCED */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm font-bold text-slate-300 hover:text-fuchsia-400 transition-all flex items-center gap-3 bg-slate-800/30 hover:bg-slate-800/50 px-4 py-3 rounded-lg border border-white/10 hover:border-fuchsia-500/30"
                >
                  <span className="text-lg">{showAdvanced ? '▼' : '◀'}</span>
                  <span>הגדרות מתקדמות</span>
                  <span className="text-xs text-slate-500 font-normal">(למשתמשים מנוסים)</span>
                </button>
              </div>

              {/* Differentiation - Hidden by default, Gender-inclusive */}
              {showAdvanced && (
                <div className="col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <label className={labelClasses}>
                      {fieldLabels.differentiation.emoji} {fieldLabels.differentiation.label}
                    </label>
                    <MagicWandButton field="differentiation" label={fieldLabels.differentiation.label} />
                  </div>
                  <input 
                    type="text" 
                    name="differentiation" 
                    value={formData.differentiation} 
                    onChange={handleInputChange} 
                    className={inputClasses}
                    placeholder="מה מייחד את העסק/מוצר מהמתחרים?"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Step 4: Format Selection - ENHANCED WITH SHAPES */}
          <section>
            <div className="flex items-center gap-5 mb-8">
               <StepIndicator num="04" />
               <h2 className={sectionHeaderClasses}>איפה זה יפורסם? 📱</h2>
            </div>
            <p className="text-slate-400 text-sm mb-6">בחירת הגודל המתאים לפלטפורמה:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {platformOptions.map(platform => (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.value)}
                  className={`p-6 rounded-xl text-sm transition-all border text-center group ${
                    formData.platforms.includes(platform.value)
                      ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/10'
                      : 'bg-slate-900/40 text-slate-400 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-4xl mb-2">{platform.icon}</div>
                  <div className="font-bold text-lg mb-1 group-hover:text-white transition-colors">{platform.label}</div>
                  <div className="text-xs text-fuchsia-300 font-semibold mb-1">{platform.shape}</div>
                  <div className="text-xs text-slate-500">{platform.sublabel}</div>
                  {formData.platforms.includes(platform.value) && (
                     <div className="mt-3 w-3 h-3 mx-auto rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-glow"></div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-5 rounded-xl text-xl font-black text-white transition-all transform mt-12 border border-white/10 tracking-wide ${
              isSubmitting 
                ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:shadow-2xl hover:shadow-fuchsia-600/30 hover:-translate-y-1'
            }`}
          >
            {isSubmitting ? 'מעבד...' : '🚀 צור עיצובים!'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BriefForm;