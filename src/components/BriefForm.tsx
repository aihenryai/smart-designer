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

  // FIXED: Animation persists until response is received AND field is updated
  const handleAutoFill = async (field: keyof DesignBrief) => {
    if (!formData.subject || !formData.instructions) return;
    
    setLoadingField(field);
    
    try {
      const suggestion = await generateAutoFillSuggestion(field, {
        subject: formData.subject,
        instructions: formData.instructions,
        essentialInfo: formData.essentialInfo
      });
      
      if (suggestion) {
        // Update the field with the suggestion
        setFormData(prev => ({ ...prev, [field]: suggestion }));
        
        // Small delay to ensure the user sees the text populate
        // This creates a smooth transition from loading to content
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      // Only remove loading state after we got the response AND updated the field
      setLoadingField(null);
    }
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

  const fieldLabels: Record<string, { label: string; emoji: string; buttonText: string }> = {
    targetAudience: { label: 'למי זה מיועד', emoji: '👥', buttonText: 'קהל יעד' },
    goal: { label: 'מה המטרה של הפוסט', emoji: '🎯', buttonText: 'מטרת הפוסט' },
    differentiation: { label: 'מה מייחד את העסק', emoji: '⭐', buttonText: 'ייחוד העסק' },
    callToAction: { label: 'קריאה לפעולה', emoji: '👆', buttonText: 'קריאה לפעולה' },
    coreMessage: { label: 'המסר המרכזי', emoji: '💬', buttonText: 'מסר מרכזי' }
  };

  const MagicWandButton = ({ field, label, buttonText }: { field: keyof DesignBrief, label: string, buttonText: string }) => {
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
            <span>הצעת AI ל{buttonText}</span>
          </>
        )}
      </button>
    );
  };