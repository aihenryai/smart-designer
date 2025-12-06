import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        {/* Cancel Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          התשלום בוטל
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-8">
          לא בוצע חיוב. אתה עדיין יכול להמשיך להשתמש בגרסה החינמית
          או לנסות שוב מאוחר יותר.
        </p>

        {/* Options */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            נסה שוב
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#12121a] border border-gray-700 hover:border-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            המשך עם הגרסה החינמית
          </button>
        </div>

        {/* Help */}
        <p className="text-gray-500 text-sm mt-8">
          נתקלת בבעיה? 
          <a 
            href="mailto:henrystauber22@gmail.com" 
            className="text-purple-400 hover:text-purple-300 mr-1"
          >
            צור קשר
          </a>
        </p>
      </div>
    </div>
  );
}
