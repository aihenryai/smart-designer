import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPremium = userData?.plan === 'premium';
  const creditsRemaining = userData?.credits?.limit === -1 
    ? '∞' 
    : Math.max(0, (userData?.credits?.limit || 3) - (userData?.credits?.used || 0));

  const handleUpgrade = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }

    if (isPremium) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: 'premium'
        })
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to SUMIT payment page
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || 'שגיאה ביצירת התשלום');
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError('שגיאה בתהליך השדרוג. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
          >
            <span>→</span>
            <span>חזרה לסטודיו</span>
          </button>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            בחר את התוכנית שלך
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            התחל בחינם עם 3 יצירות, או שדרג לפרימיום ליצירות ללא הגבלה
          </p>
        </div>

        {/* Current Status */}
        {currentUser && (
          <div className="bg-[#12121a] border border-gray-800 rounded-xl p-4 mb-8 text-center">
            <span className="text-gray-400">התוכנית הנוכחית שלך: </span>
            <span className={`font-semibold ${isPremium ? 'text-purple-400' : 'text-gray-300'}`}>
              {isPremium ? 'Premium ⭐' : 'חינם'}
            </span>
            {!isPremium && (
              <span className="text-gray-500 mr-3">
                | נותרו {creditsRemaining} יצירות
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-8 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl p-8 relative">
            <h3 className="text-2xl font-bold text-white mb-2">חינם</h3>
            <div className="text-4xl font-bold text-white mb-6">
              ₪0
              <span className="text-lg text-gray-500 font-normal">/לתמיד</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400 text-lg">✓</span>
                <span>3 יצירות חינם</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400 text-lg">✓</span>
                <span>4 קונספטים לכל בקשה</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400 text-lg">✓</span>
                <span>עורך מובנה</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <span className="text-green-400 text-lg">✓</span>
                <span>ייצוא ל-PNG/JPG</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <span className="text-gray-600 text-lg">✗</span>
                <span>איכות 4K</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500">
                <span className="text-gray-600 text-lg">✗</span>
                <span>ייצוא ל-PDF</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full bg-gray-800 text-gray-400 font-medium py-3 px-6 rounded-lg cursor-not-allowed"
            >
              התוכנית הנוכחית
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-900/50 to-[#12121a] border-2 border-purple-500 rounded-2xl p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                הכי פופולרי ⭐
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <div className="text-4xl font-bold text-white mb-6">
              ₪49
              <span className="text-lg text-gray-400 font-normal">/חודש</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span className="font-medium">יצירות ללא הגבלה</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span>4 קונספטים לכל בקשה</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span>עורך מובנה מתקדם</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span>ייצוא ל-PNG/JPG</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span className="font-medium">איכות 4K</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span className="font-medium">ייצוא ל-PDF מקצועי</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span>עדיפות בתור העיבוד</span>
              </li>
              <li className="flex items-center gap-3 text-gray-200">
                <span className="text-purple-400 text-lg">✓</span>
                <span>תמיכה מועדפת</span>
              </li>
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading || isPremium}
              className={`w-full font-medium py-3 px-6 rounded-lg transition-all duration-200 ${
                isPremium
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : loading
                  ? 'bg-purple-700 text-purple-300 cursor-wait'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white'
              }`}
            >
              {isPremium ? '✓ יש לך Premium' : loading ? 'מעבד...' : 'שדרג עכשיו'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">שאלות נפוצות</h2>
          
          <div className="space-y-4">
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
              <h4 className="text-white font-medium mb-2">איך עובד התשלום?</h4>
              <p className="text-gray-400">
                התשלום מתבצע באמצעות כרטיס אשראי דרך מערכת SUMIT המאובטחת.
                המנוי מתחדש אוטומטית כל חודש.
              </p>
            </div>
            
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
              <h4 className="text-white font-medium mb-2">אפשר לבטל?</h4>
              <p className="text-gray-400">
                כמובן! אפשר לבטל את המנוי בכל עת. תוכל להמשיך להשתמש עד סוף תקופת החיוב הנוכחית.
              </p>
            </div>
            
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
              <h4 className="text-white font-medium mb-2">מה קורה אחרי 3 היצירות החינמיות?</h4>
              <p className="text-gray-400">
                אחרי שתסיים את היצירות החינמיות, תוכל לשדרג לפרימיום כדי להמשיך ליצור ללא הגבלה.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            יש שאלות? 
            <a 
              href="mailto:henrystauber22@gmail.com" 
              className="text-purple-400 hover:text-purple-300 mr-1"
            >
              צור קשר
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
