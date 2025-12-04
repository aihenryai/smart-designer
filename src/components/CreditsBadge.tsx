import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const CreditsBadge: React.FC = () => {
  const { userCredits } = useAuth();

  if (!userCredits) {
    return null;
  }

  const isPremium = userCredits.plan === 'premium';
  const remaining = isPremium ? -1 : (userCredits.credits.limit - userCredits.credits.used);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
      {isPremium ? (
        <>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-purple-800">Premium</span>
          </div>
          <div className="h-4 w-px bg-purple-300" />
          <span className="text-sm text-purple-700">ללא הגבלה</span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-blue-800">תוכנית חינמית</span>
          </div>
          <div className="h-4 w-px bg-blue-300" />
          <span className={`text-sm font-medium ${remaining === 0 ? 'text-red-600' : 'text-blue-700'}`}>
            {remaining === 0 ? 'נגמרו הקרדיטים' : `${remaining} מתוך ${userCredits.credits.limit} נותרו`}
          </span>
        </>
      )}
    </div>
  );
};

export default CreditsBadge;
