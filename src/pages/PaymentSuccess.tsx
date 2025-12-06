import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refresh user data to get updated plan
    refreshUser?.();

    // Countdown and redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          🎉 התשלום הצליח!
        </h1>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-6">
          ברוכים הבאים ל-<span className="text-purple-400 font-semibold">Smart Studio Premium</span>!
          <br />
          עכשיו יש לך גישה מלאה לכל התכונות ויצירות ללא הגבלה.
        </p>

        {/* Features */}
        <div className="bg-[#12121a] border border-purple-500/30 rounded-xl p-6 mb-6 text-right">
          <h3 className="text-white font-semibold mb-4 text-center">מה כלול במנוי שלך:</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>יצירות ללא הגבלה</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>איכות תמונה גבוהה (4K)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>ייצוא ל-PDF מקצועי</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>עדיפות בתור העיבוד</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>תמיכה מועדפת</span>
            </li>
          </ul>
        </div>

        {/* Redirect Notice */}
        <p className="text-gray-500 mb-4">
          מעביר אותך לסטודיו בעוד {countdown} שניות...
        </p>

        {/* Manual Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
        >
          התחל ליצור עכשיו ✨
        </button>
      </div>
    </div>
  );
}
