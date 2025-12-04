import React from 'react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  remainingCredits: number;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, remainingCredits }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // TODO: Integrate payment system (Stripe, PayPal, etc.)
    alert('מערכת התשלום תשולב בקרוב! נא ליצור קשר עם התמיכה.');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-8 pointer-events-auto animate-scaleIn relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
            aria-label="סגור"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="text-center mt-4">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              שדרג לפרימיום
            </h2>

            {/* Message */}
            <p className="text-slate-300 mb-2 text-sm">
              {remainingCredits === 0 
                ? 'נגמרו הקרדיטים החינמיים שלך' 
                : `נותרו לך ${remainingCredits} קרדיטים בלבד`
              }
            </p>
            <p className="text-slate-400 text-sm mb-8">
              שדרג עכשיו וקבל גישה בלתי מוגבלת ליצירת עיצובים!
            </p>

            {/* Features */}
            <div className="bg-white/5 rounded-xl p-6 mb-8 text-right">
              <h3 className="text-white font-semibold mb-4 text-center">מה תקבל בפרימיום?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm">יצירות <strong className="text-white">בלתי מוגבלות</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm">גישה לכל התבניות והסגנונות</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm">תמיכה טכנית מהירה ומקצועית</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300 text-sm">הורדה באיכות גבוהה</span>
                </li>
              </ul>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl p-6 mb-6 border border-violet-500/30">
              <div className="text-center">
                <p className="text-slate-300 text-sm mb-2">החל מ-</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-white">₪49</span>
                  <span className="text-slate-400 text-sm">לחודש</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-fuchsia-500/30 transform hover:scale-105"
              >
                שדרג עכשיו
              </button>
              <button
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all border border-white/10"
              >
                אולי מאוחר יותר
              </button>
            </div>

            {/* Contact info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-xs text-center">
                יש שאלות? צור קשר: 
                <a 
                  href="https://wa.me/972585005171" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-fuchsia-400 hover:text-fuchsia-300 mr-1 transition-colors"
                >
                  0585005171
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default UpgradePrompt;
