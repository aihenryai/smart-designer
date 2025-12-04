import React from 'react';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  remainingCredits?: number;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ isOpen, onClose, remainingCredits = 0 }) => {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // TODO: Integrate with Stripe payment
    console.log('Upgrade to premium clicked');
    alert('מערכת התשלום תשולב בקרוב! 🚀');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {remainingCredits === 0 ? 'נגמרו הקרדיטים שלך!' : 'שדרג לפרימיום'}
          </h2>
          <p className="text-gray-600">
            {remainingCredits === 0 
              ? 'השתמשת בכל 3 היצירות החינמיות. שדרג עכשיו וקבל גישה בלתי מוגבלת!'
              : `נותרו לך עוד ${remainingCredits} יצירות חינמיות. קבל גישה בלתי מוגבלת עכשיו!`
            }
          </p>
        </div>

        {/* Pricing card */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-4xl font-bold text-gray-900">₪39</span>
              <span className="text-gray-600 mr-2">/חודש</span>
            </div>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              מומלץ ביותר
            </span>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              'יצירות בלתי מוגבלות',
              'עריכה מלאה של כל קונספט',
              'עדכוני תמונות בלתי מוגבלים',
              'הורדה ברזולוציה גבוהה',
              'גישה מוקדמת לפיצ׳רים חדשים',
              'תמיכה טכנית מועדפת'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            שדרג עכשיו לפרימיום 🚀
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {remainingCredits > 0 ? 'אמשיך עם התוכנית החינמית' : 'אולי מאוחר יותר'}
          </button>
        </div>

        {/* Trust badge */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>✓ ביטול בכל עת ✓ תשלום מאובטח ✓ החזר כספי תוך 14 יום</p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
