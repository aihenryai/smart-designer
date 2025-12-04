import React, { useState } from 'react';
import BriefForm from './components/BriefForm';
import ResultsView from './components/ResultsView';
import EditorView from './components/EditorView';
import UserMenu from './components/UserMenu';
import UpgradePrompt from './components/UpgradePrompt';
import { DesignBrief, AIConcept, AppState } from './types';
import { generateConcepts } from './services/api';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.FORM);
  const [briefData, setBriefData] = useState<DesignBrief | null>(null);
  const [concepts, setConcepts] = useState<AIConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<AIConcept | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  
  const { userCredits, refreshCredits } = useAuth();

  const handleBriefSubmit = async (brief: DesignBrief) => {
    setBriefData(brief);
    setAppState(AppState.LOADING);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const result = await generateConcepts(brief);
      
      if (!result.concepts || result.concepts.length === 0) {
        throw new Error("לא נוצרו קונספטים. אנא נסה שנית.");
      }

      setConcepts(result.concepts);
      setAppState(AppState.RESULTS);
      
      // Refresh credits after successful generation
      await refreshCredits();
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error("Submission error:", err);
      
      // Check if it's a credits error
      if (err.message.includes('קרדיטים') || err.message.includes('אין מספיק')) {
        setShowUpgradePrompt(true);
        setError("נגמרו הקרדיטים החינמיים שלך. שדרג לפרימיום כדי להמשיך ליצור!");
      } else if (err.message.includes('התחברות')) {
        setError("נדרשת התחברות למערכת. אנא התחבר ונסה שוב.");
      } else {
        setError(err.message || "אירעה שגיאה בתהליך היצירה. אנא נסה שנית.");
      }
      
      setAppState(AppState.FORM);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setBriefData(null);
    setConcepts([]);
    setSelectedConcept(null);
    setAppState(AppState.FORM);
    setError(null);
  };

  const handleSelectConcept = (concept: AIConcept) => {
    setSelectedConcept(concept);
    setAppState(AppState.EDITOR);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateConcept = (updatedConcept: AIConcept) => {
    setConcepts(prev => prev.map(c => c.title === updatedConcept.title ? updatedConcept : c));
    setSelectedConcept(updatedConcept);
  };

  const handleBackToResults = () => {
    setSelectedConcept(null);
    setAppState(AppState.RESULTS);
  };

  const getRemainingCredits = () => {
    if (!userCredits) return 0;
    if (userCredits.plan === 'premium') return -1;
    return Math.max(0, userCredits.credits.limit - userCredits.credits.used);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans pb-12 overflow-x-hidden relative">
      
      {/* Colorful Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10s]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen opacity-70 animate-pulse duration-[7s]"></div>
          <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-orange-500/10 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-fuchsia-500/20 group-hover:shadow-fuchsia-500/40 transition-all transform group-hover:scale-105">
               S
            </div>
            <h1 className="text-xl font-medium text-slate-200 tracking-wide group-hover:text-white transition-colors">
              Smart<span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Studio</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {appState !== AppState.FORM && appState !== AppState.LOADING && (
              <button onClick={handleReset} className="text-sm font-bold bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-full border border-white/10 hover:border-fuchsia-500/50 transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-fuchsia-500/10">
                <span className="text-fuchsia-400 text-lg">+</span> עיצוב חדש
              </button>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pt-28 relative z-10">
        
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md flex items-center gap-4 animate-fadeIn">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {appState === AppState.FORM && (
          <BriefForm onSubmit={handleBriefSubmit} isSubmitting={false} />
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center relative">
             <div className="relative mb-12">
                <div className="w-28 h-28 rounded-full border border-white/5 flex items-center justify-center relative bg-slate-900/50 backdrop-blur-sm">
                   <div className="absolute inset-0 border-t-2 border-r-2 border-fuchsia-500 rounded-full animate-spin"></div>
                   <div className="absolute inset-2 border-b-2 border-l-2 border-violet-500 rounded-full animate-spin reverse duration-[1.5s]"></div>
                   <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur-2xl animate-pulse opacity-50"></div>
                </div>
             </div>
            <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              מעבד נתונים
            </h2>
            <p className="text-fuchsia-300/80 text-sm tracking-[0.2em] uppercase font-bold">
              Smart Studio בונה קונספטים...
            </p>
          </div>
        )}

        {appState === AppState.RESULTS && briefData && (
          <ResultsView 
            concepts={concepts} 
            originalBrief={briefData}
            onReset={handleReset}
            onSelectConcept={handleSelectConcept}
          />
        )}

        {appState === AppState.EDITOR && selectedConcept && briefData && (
          <EditorView
            concept={selectedConcept}
            initialEssentialInfo={briefData.essentialInfo}
            onBack={handleBackToResults}
            onUpdate={handleUpdateConcept}
          />
        )}
      </main>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        remainingCredits={getRemainingCredits()}
      />
    </div>
  );
};

export default App;
