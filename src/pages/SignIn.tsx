// src/pages/SignIn.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignIn: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle, signInWithFacebook, signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (provider: 'google' | 'facebook' | 'microsoft') => {
    setLoading(provider);
    setError(null);

    try {
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'microsoft':
          await signInWithMicrosoft();
          break;
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden" dir="rtl">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen opacity-70 animate-pulse duration-[7s]"></div>
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 space-y-8">
          
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-fuchsia-500/30">
              S
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Studio</span>
              </h1>
              <p className="text-slate-400 text-lg">
                מחולל עיצובים חכם מבוסס AI
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Sign In Buttons */}
          <div className="space-y-3">
            <h2 className="text-center text-slate-300 font-semibold text-lg mb-6">
              התחבר לחשבונך
            </h2>

            {/* Google */}
            <button
              onClick={() => handleSignIn('google')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{loading === 'google' ? 'מתחבר...' : 'המשך עם Google'}</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleSignIn('facebook')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2] hover:bg-[#1864D9] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20"
            >
              <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{loading === 'facebook' ? 'מתחבר...' : 'המשך עם Facebook'}</span>
            </button>

            {/* Microsoft */}
            <button
              onClick={() => handleSignIn('microsoft')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-gray-500/20"
            >
              <svg className="w-6 h-6" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>{loading === 'microsoft' ? 'מתחבר...' : 'המשך עם Microsoft'}</span>
            </button>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-slate-500 mt-6">
            בהתחברות אתה מסכים לתנאי השימוש ומדיניות הפרטיות
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
