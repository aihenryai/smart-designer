import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'משתמש';
  const photoURL = user.photoURL;
  const email = user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full pl-4 pr-1.5 py-1.5 border border-white/10 hover:border-fuchsia-500/30 transition-all group"
      >
        <span className="text-sm font-medium text-slate-200 group-hover:text-white hidden sm:block">
          {displayName}
        </span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center overflow-hidden ring-2 ring-white/10 group-hover:ring-fuchsia-500/30 transition-all">
          {photoURL ? (
            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center overflow-hidden ring-2 ring-white/10">
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{displayName}</div>
                <div className="text-xs text-slate-400 truncate">{email}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full text-right px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-end gap-2 group"
            >
              <span>התנתק</span>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-fuchsia-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
