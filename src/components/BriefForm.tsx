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

  /**
   * Enhanced auto-fill with improved loading animation timing
   * Animation persists throughout the entire API call duration
   */
  const handleAutoFill = async (field: keyof DesignBrief) => {
    if (!formData.subject || !formData.instructions) return;
    
    // Start loading animation - this will persist until API call completes
    setLoadingField(field);
    
    try {
      // Wait for AI to generate suggestion (real API call time)
      const suggestion = await generateAutoFillSuggestion(field, {
        subject: formData.subject,
        instructions: formData.instructions,
        essentialInfo: formData.essentialInfo
      });
      
      if (suggestion) {
        // Update the field with the suggestion
        setFormData(prev => ({ ...prev, [field]: suggestion }));
      }
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      // Clear loading state only after API call is complete
      // The field will fade-in smoothly thanks to CSS transition
      setLoadingField(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">Smart Studio ✨</h1>
        <p className="text-gray-600">תאר מה אתה רוצה ליצור, וה-AI יעשה את השאר</p>
      </div>

      {/* Step 1: Project Definition */}
      <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-purple-500">
        <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center">
          <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center ml-3">01</span>
          הגדרת הפרויקט
        </h2>

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              מה אתה רוצה ליצור? ✨ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              placeholder="פוסט לאינסטגרם | סטורי לטיקטוק | כרטיס ביקור | פלייר..."
            />
            <p className="text-xs text-gray-500 mt-1">💡 טיפ: תאר בקצרה - למשל ״פוסט לסייל חורף בחנות בגדים״</p>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              איך תרצה שזה ייראה? 🎨 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="instructions"
              required
              value={formData.instructions}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              placeholder="תאר את הסגנון, הצבעים, והאווירה שאתה מדמיין..."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-gray-600 font-semibold">סגנונות מוכנים:</span>
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleQuickSelect('instructions', style)}
                  className="px-3 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full transition-colors"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Inspiration (Optional) */}
      <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-indigo-500">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4 flex items-center">
          <span className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center ml-3">02</span>
          השראה (אופציונלי)
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              יש לך דוגמה שאהבת? העלה אותה וה-AI יתייחס אליה ✨
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 transition-all"
            />
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-3">
                {formData.attachments.map((att) => (
                  <div key={att.id} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-800">{att.fileName}</p>
                      <input
                        type="text"
                        value={att.userInstruction}
                        onChange={(e) => updateAttachmentInstruction(att.id, e.target.value)}
                        placeholder="מה אהבת בתמונה הזו?"
                        className="w-full mt-2 px-3 py-2 text-sm border border-indigo-300 rounded focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          {showAdvanced ? '▼' : '▶'} אפשרויות מתקדמות (אופציונלי)
        </button>
      </div>

      {/* Step 3: Advanced Details (Collapsible) */}
      {showAdvanced && (
        <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-pink-500">
          <h2 className="text-2xl font-bold text-pink-900 mb-4 flex items-center">
            <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center ml-3">03</span>
            פרטים נוספים
          </h2>

          <div className="space-y-4">
            {/* Essential Info with AI button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>מה לכתוב על העיצוב? 📝</span>
                {formData.subject && formData.instructions && (
                  <button
                    type="button"
                    onClick={() => handleAutoFill('essentialInfo')}
                    disabled={loadingField === 'essentialInfo'}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      loadingField === 'essentialInfo'
                        ? 'bg-purple-200 text-purple-600 cursor-wait animate-pulse'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loadingField === 'essentialInfo' ? '✨ יוצר הצעה...' : '✨ הצע AI'}
                  </button>
                )}
              </label>
              <textarea
                name="essentialInfo"
                value={formData.essentialInfo}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all ${
                  loadingField === 'essentialInfo' ? 'opacity-50' : 'opacity-100'
                }`}
                placeholder="הכותרת, המחיר, פרטי יצירת קשר, או כל טקסט שתרצה שיופיע"
              />
            </div>

            {/* Target Audience with AI button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>למי זה מיועד? 👥</span>
                {formData.subject && formData.instructions && (
                  <button
                    type="button"
                    onClick={() => handleAutoFill('targetAudience')}
                    disabled={loadingField === 'targetAudience'}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      loadingField === 'targetAudience'
                        ? 'bg-purple-200 text-purple-600 cursor-wait animate-pulse'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loadingField === 'targetAudience' ? '✨ יוצר הצעה...' : '✨ הצע AI'}
                  </button>
                )}
              </label>
              <input
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 transition-all ${
                  loadingField === 'targetAudience' ? 'opacity-50' : 'opacity-100'
                }`}
                placeholder="למי אתה רוצה למכור? נשים, גברים, גיל מסויים?"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {audienceOptions.map((audience) => (
                  <button
                    key={audience}
                    type="button"
                    onClick={() => handleQuickSelect('targetAudience', audience)}
                    className="px-3 py-1 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors"
                  >
                    {audience}
                  </button>
                ))}
              </div>
            </div>

            {/* Goal with AI button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>מה המטרה של הפוסט? 🎯</span>
                {formData.subject && formData.instructions && (
                  <button
                    type="button"
                    onClick={() => handleAutoFill('goal')}
                    disabled={loadingField === 'goal'}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      loadingField === 'goal'
                        ? 'bg-purple-200 text-purple-600 cursor-wait animate-pulse'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loadingField === 'goal' ? '✨ יוצר הצעה...' : '✨ הצע AI'}
                  </button>
                )}
              </label>
              <input
                type="text"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 transition-all ${
                  loadingField === 'goal' ? 'opacity-50' : 'opacity-100'
                }`}
                placeholder="למשל: למכור, להכריז על מבצע, להציג מוצר חדש..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleQuickSelect('goal', goal)}
                    className="px-3 py-1 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Call to Action with AI button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>מה אתה רוצה שיעשו? 👆</span>
                {formData.subject && formData.instructions && (
                  <button
                    type="button"
                    onClick={() => handleAutoFill('callToAction')}
                    disabled={loadingField === 'callToAction'}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      loadingField === 'callToAction'
                        ? 'bg-purple-200 text-purple-600 cursor-wait animate-pulse'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loadingField === 'callToAction' ? '✨ יוצר הצעה...' : '✨ הצע AI'}
                  </button>
                )}
              </label>
              <input
                type="text"
                name="callToAction"
                value={formData.callToAction}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 transition-all ${
                  loadingField === 'callToAction' ? 'opacity-50' : 'opacity-100'
                }`}
                placeholder="למשל: התקשרו עכשיו, קנו עכשיו, בקרו באתר..."
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {ctaOptions.map((cta) => (
                  <button
                    key={cta}
                    type="button"
                    onClick={() => handleQuickSelect('callToAction', cta)}
                    className="px-3 py-1 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors"
                  >
                    {cta}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Message with AI button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                <span>מה הדבר הכי חשוב שתרצה להעביר? 💬</span>
                {formData.subject && formData.instructions && (
                  <button
                    type="button"
                    onClick={() => handleAutoFill('coreMessage')}
                    disabled={loadingField === 'coreMessage'}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      loadingField === 'coreMessage'
                        ? 'bg-purple-200 text-purple-600 cursor-wait animate-pulse'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loadingField === 'coreMessage' ? '✨ יוצר הצעה...' : '✨ הצע AI'}
                  </button>
                )}
              </label>
              <textarea
                name="coreMessage"
                value={formData.coreMessage}
                onChange={handleInputChange}
                rows={2}
                className={`w-full px-4 py-3 border-2 border-pink-300 rounded-lg focus:border-pink-500 transition-all ${
                  loadingField === 'coreMessage' ? 'opacity-50' : 'opacity-100'
                }`}
                placeholder="המשפט או הרעיון המרכזי של הפוסט"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Format Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md border-r-4 border-green-500">
        <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center">
          <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center ml-3">04</span>
          איפה זה יפורסם?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '1:1', emoji: '📱', label: 'פוסט', sub: 'אינסטגרם, פייסבוק' },
            { value: '9:16', emoji: '📲', label: 'סטורי', sub: 'טיקטוק, רילס' },
            { value: '3:4', emoji: '🖼️', label: 'פוסטר', sub: 'להדפסה, פלייר' },
            { value: '16:9', emoji: '🖥️', label: 'מצגת', sub: 'מסך רחב' }
          ].map(({ value, emoji, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePlatformToggle(value)}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                formData.platforms.includes(value)
                  ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                  : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className="font-bold text-gray-800">{label}</div>
              <div className="text-xs text-gray-500">{sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting || !formData.subject || !formData.instructions || formData.platforms.length === 0}
          className={`px-8 py-4 rounded-full text-xl font-bold transition-all shadow-lg ${
            isSubmitting || !formData.subject || !formData.instructions || formData.platforms.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:scale-105'
          }`}
        >
          {isSubmitting ? '✨ יוצר עבורך קסם...' : '🚀 צור עכשיו!'}
        </button>
      </div>
    </form>
  );
};

export default BriefForm;