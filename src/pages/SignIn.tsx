import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const signInSectionRef = useRef<HTMLDivElement>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSignIn = () => {
    signInSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Sample design examples (placeholder URLs - replace with real ones later)
  const exampleDesigns = [
    { type: 'פוסט אינסטגרם', image: 'https://via.placeholder.com/400x400/8B5CF6/FFFFFF?text=Instagram+Post' },
    { type: 'סטורי', image: 'https://via.placeholder.com/300x533/EC4899/FFFFFF?text=Story' },
    { type: 'כרטיס ביקור', image: 'https://via.placeholder.com/500x300/6366F1/FFFFFF?text=Business+Card' },
    { type: 'פוסטר', image: 'https://via.placeholder.com/400x600/A855F7/FFFFFF?text=Poster' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen opacity-70 animate-pulse" style={{animationDuration: '7s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl w-full text-center">
          
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-fuchsia-500/30">
              S
            </div>
            <h1 className="text-5xl font-medium text-slate-200 tracking-wide">
              Smart<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Studio</span>
            </h1>
          </div>

          {/* Hero Headline */}
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-400">
              עיצוב מקצועי
            </span>
            <br />
            <span className="text-slate-100">
              בלי להיות מעצב
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            תספר לנו מה אתה רוצה - ובינה מלאכותית תיצור לך 4 קונספטים מקצועיים תוך שניות. 
            <br />
            <span className="text-fuchsia-400 font-semibold">ללא ידע מקדים, ללא מורכבות.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={scrollToSignIn}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-fuchsia-500/50 transition-all transform hover:scale-105"
            >
              התחל בחינם ✨
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-semibold text-lg rounded-xl transition-all"
            >
              איך זה עובד?
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                4
              </div>
              <div className="text-slate-400 text-sm">קונספטים לבחירה</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                30s
              </div>
              <div className="text-slate-400 text-sm">זמן יצירה ממוצע</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 mb-2">
                100%
              </div>
              <div className="text-slate-400 text-sm">עברית תקינה</div>
            </div>
          </div>
        </div>
      </div>

      {/* Examples Gallery */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">
            דוגמאות לעיצובים שנוצרו ב-Smart Studio
          </h3>
          <p className="text-slate-400 text-center mb-12 text-lg">
            כל אחד מהעיצובים האלה נוצר תוך פחות מדקה
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleDesigns.map((design, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-fuchsia-500/50 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-500/20"
              >
                <img 
                  src={design.image} 
                  alt={design.type}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 right-0 left-0 p-4">
                    <p className="text-white font-semibold text-lg">{design.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-400 text-sm">
              💡 <strong className="text-fuchsia-400">טיפ:</strong> עם Smart Studio אתה יכול ליצור כל אחד מהעיצובים האלה תוך פחות מ-3 דקות
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="relative z-10 py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">
            איך זה עובד?
          </h3>
          <p className="text-slate-400 text-center mb-16 text-lg">
            4 שלבים פשוטים מהרעיון לעיצוב מוכן
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'תספר לנו מה אתה רוצה', desc: 'פוסט לאינסטגרם? לוגו? סטורי? תכתוב בקצרה והבינה המלאכותית תבין', icon: '💬' },
              { num: '02', title: 'בחר סגנון', desc: 'מינימליסטי, צבעוני, יוקרתי, מודרני - או שתן ל-AI להציע', icon: '🎨' },
              { num: '03', title: 'קבל 4 קונספטים', desc: 'תוך 30 שניות תקבל 4 גרסאות שונות עם תמונות ועיצוב מלא', icon: '⚡' },
              { num: '04', title: 'ערוך והורד', desc: 'תוכל לשנות טקסטים, צבעים ועיצוב - ולהוריד בפורמט PDF', icon: '✅' }
            ].map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/10 flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
                <div className="absolute top-0 right-0 text-6xl font-black text-white/5">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold mb-2 text-slate-100">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16">
            למה Smart Studio?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🇮🇱', title: 'עברית תקינה 100%', desc: 'לא עוד טקסט משובש או באנגלית. הבינה המלאכותית שלנו מבינה עברית בצורה מושלמת' },
              { icon: '⚡', title: 'מהיר כברק', desc: 'תוך 30 שניות תקבל 4 קונספטים מקצועיים. לא צריך לחכות שעות למעצב' },
              { icon: '🎯', title: 'פשוט לשימוש', desc: 'ממש כמו לשוחח עם חבר. תכתוב מה אתה רוצה והבינה המלאכותית תעשה את השאר' },
              { icon: '💰', title: '3 עיצובים חינם', desc: 'נסה לגמרי בחינם! 3 יצירות ראשונות על חשבוננו, בלי כרטיס אשראי' },
              { icon: '✏️', title: 'גמישות מלאה', desc: 'לא אהבת משהו? תשנה טקסטים, צבעים ועיצוב עד שתהיה מרוצה' },
              { icon: '📥', title: 'הורדה מיידית', desc: 'PDF איכותי מוכן להדפסה או לפרסום ישירות מהמערכת' }
            ].map((benefit, index) => (
              <div key={index} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/30 transition-all">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h4 className="text-xl font-bold mb-2 text-slate-100">{benefit.title}</h4>
                <p className="text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="relative z-10 py-20 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-4">
            מחירים שקופים
          </h3>
          <p className="text-slate-400 mb-12 text-lg">
            התחל בחינם, שדרג רק כשתרצה יותר
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="text-3xl font-bold mb-2">חינם</div>
              <div className="text-slate-400 mb-6">לנסות ולהתנסות</div>
              <div className="text-5xl font-black mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">₪0</span>
              </div>
              <ul className="text-right space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">3 עיצובים חינם</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">4 קונספטים לכל עיצוב</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">עריכה בסיסית</span>
                </li>
              </ul>
              <button
                onClick={scrollToSignIn}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all"
              >
                התחל חינם
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 backdrop-blur-xl border border-fuchsia-500/30 rounded-2xl p-8 relative">
              <div className="absolute top-4 left-4 bg-fuchsia-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                מומלץ
              </div>
              <div className="text-3xl font-bold mb-2">Premium</div>
              <div className="text-slate-300 mb-6">ליוצרים רציניים</div>
              <div className="text-5xl font-black mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">₪49</span>
              </div>
              <div className="text-slate-400 text-sm mb-6">לחודש</div>
              <ul className="text-right space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300"><strong>עיצובים ללא הגבלה</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">עריכה מתקדמת</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">איכות תמונות מקסימלית</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">שמירת היסטוריה</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-fuchsia-400 mt-1">✓</span>
                  <span className="text-slate-300">תמיכה מהירה</span>
                </li>
              </ul>
              <button
                onClick={scrollToSignIn}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-lg hover:shadow-fuchsia-500/50 transition-all"
              >
                שדרג עכשיו
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Section */}
      <div ref={signInSectionRef} className="relative z-10 py-20 px-4">
        <div className="max-w-md mx-auto">
          
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">מוכן להתחיל?</h3>
            <p className="text-slate-400">
              {isSignUp ? 'צור חשבון חדש תוך 30 שניות' : 'התחבר והמשך ליצור'}
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{isSignUp ? 'הרשמה עם Google' : 'התחבר עם Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-400">או</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  אימייל
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all"
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  סיסמה
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/50 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                />
                {isSignUp && (
                  <p className="text-xs text-slate-400 mt-1">לפחות 6 תווים</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-fuchsia-500/30"
              >
                {loading ? 'מעבד...' : isSignUp ? 'הרשמה' : 'התחבר'}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm text-slate-400 hover:text-fuchsia-400 transition-colors"
              >
                {isSignUp ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 Smart Studio. כל הזכויות שמורות.</p>
          <p className="mt-2">נבנה עם ❤️ בישראל | מופעל על ידי Google Gemini AI</p>
        </div>
      </div>

    </div>
  );
};

export default SignIn;