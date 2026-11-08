import React, { useState } from 'react';
import { GameLevel } from './types';
import TutorialMode from './components/TutorialMode';
import ChallengeMode from './components/ChallengeMode';
import { 
  GraduationCap, 
  Swords, 
  Sparkles, 
  BookOpen, 
  Atom, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const MainMenu: React.FC<{ onSelectMode: (mode: GameLevel) => void }> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[82vh] w-full max-w-4xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1 rounded-full text-xs font-semibold text-slate-700">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>IB DP Chemistry (2025 Syllabus)</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
          Bohr & Trends Explorer
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Master atomic structure, electron configurations, and periodic trends from the IB Chemistry Data Booklet.
        </p>
      </div>

      {/* Two Modes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Tutorial Mode */}
        <div 
          onClick={() => onSelectMode('tutorial')}
          className="group relative flex flex-col justify-between p-8 bg-white border-2 border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-[11px] uppercase font-bold tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                Guided Learning
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Tutorial Mode
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Step-by-step interactive practice identifying protons, total electrons, occupied shells, and effective nuclear charge (Z<sub>eff</sub>) with instant guidance and hints.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <Atom className="w-4 h-4 text-blue-500" />
                <span>Starts with single property determination</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Unlocks full atomic profile analysis with progress</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between font-bold text-sm text-blue-600 group-hover:text-blue-700">
            <span>Start Tutorial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

        {/* Challenge Mode */}
        <div 
          onClick={() => onSelectMode('challenge')}
          className="group relative flex flex-col justify-between p-8 bg-white border-2 border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-purple-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <Swords className="w-8 h-8" />
              </div>
              <span className="text-[11px] uppercase font-bold tracking-wider bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                Periodic Trends
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Challenge Mode
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Compare periodic trends (atomic & ionic radii, 1st & 2nd IEs, electronegativity, electron affinity) with custom SL/HL setup filters and concept hints.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Setup menu prevents struggling on impossible questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span>Toggle SL vs HL content, quantum anomalies & hints</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between font-bold text-sm text-purple-600 group-hover:text-purple-700">
            <span>Configure & Challenge</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-14 text-center text-xs text-slate-400">
        Based on the International Baccalaureate (IB) Diploma Programme Chemistry Data Booklet (2025)
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<GameLevel>('menu');

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased selection:bg-blue-100">
      <main className="py-6 sm:py-8">
        {mode === 'menu' && (
          <MainMenu onSelectMode={setMode} />
        )}
        {mode === 'tutorial' && (
          <TutorialMode 
            onBack={() => setMode('menu')} 
            onGoToChallenge={() => setMode('challenge')}
          />
        )}
        {mode === 'challenge' && (
          <ChallengeMode 
            onBack={() => setMode('menu')} 
            initialInSetup={true}
          />
        )}
      </main>
    </div>
  );
};

export default App;