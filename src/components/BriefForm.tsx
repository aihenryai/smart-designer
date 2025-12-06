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
      setFormData(prev => ({ ...prev, attachments: [...newAttachments, ...prev.attachments] }));
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

  // IMPROVED: Animation persists throughout entire AI generation + smooth transition
  const handleAutoFill = async (field: keyof DesignBrief) => {
    if (!formData.subject || !formData.instructions) return;
    
    // Start loading animation - this will persist until we're completely done
    setLoadingField(field);
    
    try {
      // Wait for AI to generate suggestion (this is where the real time is spent)
      const suggestion = await generateAutoFillSuggestion(field, {
        subject: formData.subject,
        instructions: formData.instructions,
        essentialInfo: formData.essentialInfo
      });
      
      if (suggestion) {
        // Update the field with the suggestion
        setFormData(prev => ({ ...prev, [field]: suggestion }));
        
        // Keep animation for a brief moment to ensure smooth visual transition
        // This prevents the jarring effect of animation stopping immediately when text appears
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      // Show error state for 2 seconds before clearing
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      // Clear loading state only after everything is complete
      setLoadingField(null);
    }
  };