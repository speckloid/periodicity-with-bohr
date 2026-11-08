import React, { useState } from 'react';
import { ChallengeSettings, ComparisonQuestion } from '../types';
import { DEFAULT_CHALLENGE_SETTINGS } from '../constants';
import { generateChallengeQuestion, getPropertyValue, formatPropertyValue } from '../services/chemistryService';
import { audioService } from '../services/audioService';
import BohrAtom from './BohrAtom';
import FeedbackOverlay from './FeedbackOverlay';
import HintModal from './HintModal';
import { 
  ArrowLeft, 
  RefreshCw, 
  Settings2, 
  HelpCircle, 
  AlertTriangle, 
  Zap, 
  Layers, 
  Check, 
  Sparkles, 
  BookOpen, 
  SlidersHorizontal,
  Flame,
  Info,
  Trophy
} from 'lucide-react';

interface ChallengeModeProps {
  onBack: () => void;
  initialInSetup?: boolean;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onBack, initialInSetup = true }) => {
  const [inSetup, setInSetup] = useState<boolean>(initialInSetup);
  const [settings, setSettings] = useState<ChallengeSettings>(DEFAULT_CHALLENGE_SETTINGS);

  // Active question state
  const [question, setQuestion] = useState<ComparisonQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  // Stats and Mastery Bars
  const [streak, setStreak] = useState(0);
  const [slMastery, setSlMastery] = useState(0); // 0 to 100
  const [hlMastery, setHlMastery] = useState(0); // 0 to 100

  // Are HL questions currently toggled on in settings?
  const isHLToggled = settings.ieAnomalies || settings.successiveIE || settings.secondEA;

  // Quick Preset Handlers
  const handleSelectAllSL = () => {
    setSettings({
      atomicRadius: true,
      ionicRadius: true,
      electronegativity: true,
      firstIE: true,
      firstEA: true,
      ieAnomalies: false,
      successiveIE: false,
      secondEA: false,
      allowMultipleVariables: false,
    });
  };

  const handleSelectAllHL = () => {
    setSettings({
      atomicRadius: true,
      ionicRadius: true,
      electronegativity: true,
      firstIE: true,
      firstEA: true,
      ieAnomalies: true,
      successiveIE: true,
      secondEA: true,
      allowMultipleVariables: false,
    });
  };

  const handleResetDefault = () => {
    setSettings(DEFAULT_CHALLENGE_SETTINGS);
  };

  const hasAtLeastOneSelected = 
    settings.atomicRadius || 
    settings.ionicRadius || 
    settings.electronegativity || 
    settings.firstIE || 
    settings.firstEA || 
    settings.ieAnomalies || 
    settings.successiveIE || 
    settings.secondEA;

  const startChallenge = () => {
    if (!hasAtLeastOneSelected) return;
    setInSetup(false);
    loadNextQuestion();
  };

  const loadNextQuestion = () => {
    const q = generateChallengeQuestion(settings);
    setQuestion(q);
    setFeedback(null);
    setRevealed(false);
    setIsHintOpen(false);
  };

  const handleChoice = (choiceIdx: 1 | 2) => {
    if (revealed || !question) return;

    const val1 = getPropertyValue(question.s1, question.prop1);
    const val2 = getPropertyValue(question.s2, question.prop2);

    if (val1 === null || val2 === null) return;

    const isEA = question.prop1.includes('EA');
    let isCorrect = false;

    if (isEA) {
      if (choiceIdx === 1) isCorrect = val1 < val2;
      else isCorrect = val2 < val1;
    } else {
      if (choiceIdx === 1) isCorrect = val1 > val2;
      else isCorrect = val2 > val1;
    }

    if (isCorrect) {
      audioService.playDing();
      setFeedback('correct');
      setStreak(prev => prev + 1);

      // Mastery bar logic: +20% on correct (cross-period & cross-group questions are excluded)
      if (!question.hasMultipleVariables) {
        if (!question.isHL) {
          setSlMastery(prev => Math.min(100, prev + 20));
        } else {
          setHlMastery(prev => Math.min(100, prev + 20));
        }
      }
    } else {
      audioService.playBoink();
      setFeedback('incorrect');
      setStreak(0);

      // Mastery bar logic: -40% on incorrect (min 0)
      if (!question.hasMultipleVariables) {
        if (!question.isHL) {
          setSlMastery(prev => Math.max(0, prev - 40));
        } else {
          setHlMastery(prev => Math.max(0, prev - 40));
        }
      }
    }

    setRevealed(true);
  };

  // --- SETUP MENU VIEW ---
  if (inSetup) {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-4 animate-fadeIn">
        {/* Navigation Bar */}
        <div className="w-full flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
          <button 
            onClick={onBack} 
            className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer"
          >
            <ArrowLeft className="mr-2 w-5 h-5" /> Back to Main Menu
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span>Challenge Configuration</span>
          </div>
        </div>

        {/* Setup Card */}
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>Customized Challenge Setup</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Select Periodic Properties
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Choose the periodic properties you want to practice. Filter by standard level (SL) or higher level (HL).
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Quick Presets:
            </span>
            <button
              onClick={handleSelectAllSL}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select All SL</span>
            </button>
            <button
              onClick={handleSelectAllHL}
              className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Select All HL (Includes SL)</span>
            </button>
            <button
              onClick={handleResetDefault}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              Reset to Default (Atomic Radius Only)
            </button>
          </div>

          {/* Atomic and Ionic Radii Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Atomic and Ionic Radii
                </h3>
              </div>
              <span className="text-xs text-slate-400">Values in picometers (pm)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Atomic Radius */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.atomicRadius 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.atomicRadius}
                  onChange={(e) => setSettings(prev => ({ ...prev, atomicRadius: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Atomic Radius</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      SL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Covalent radius of neutral atoms across periods and down groups (default).
                  </p>
                </div>
              </label>

              {/* Ionic Radius */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.ionicRadius 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.ionicRadius}
                  onChange={(e) => setSettings(prev => ({ ...prev, ionicRadius: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Ionic Radius</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      SL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Compare cations vs anions, isoelectronic series (N³⁻ to Al³⁺), and group trends.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Energetics & Bonds Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  Ionization Energies, Electron Affinity & Electronegativity
                </h3>
              </div>
              <span className="text-xs text-slate-400">kJ/mol & Pauling Scale</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Electronegativity (SL) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.electronegativity 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.electronegativity}
                  onChange={(e) => setSettings(prev => ({ ...prev, electronegativity: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Electronegativity</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      SL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Relative attraction for shared electron pairs across periods and groups (Pauling scale).
                  </p>
                </div>
              </label>

              {/* First IE (SL) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.firstIE 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.firstIE}
                  onChange={(e) => setSettings(prev => ({ ...prev, firstIE: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">1st Ionization Energy (Trends)</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      SL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Standard trends across periods and down groups without quantum anomalies.
                  </p>
                </div>
              </label>

              {/* 1st IE Anomalies (HL Only) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.ieAnomalies 
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.ieAnomalies}
                  onChange={(e) => setSettings(prev => ({ ...prev, ieAnomalies: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">1st IE Anomalies</span>
                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      HL Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Group 2 vs 13 (s-to-p subshell: Be/B, Mg/Al) & Group 15 vs 16 (spin-pairing repulsion: N/O, P/S).
                  </p>
                </div>
              </label>

              {/* Successive IEs (HL Only) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.successiveIE 
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.successiveIE}
                  onChange={(e) => setSettings(prev => ({ ...prev, successiveIE: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Successive IEs (2nd IE)</span>
                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      HL Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Second IE comparisons (X⁺ → X²⁺ + e⁻) and intra-element 1st vs 2nd IE.
                  </p>
                </div>
              </label>

              {/* First EA (SL) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.firstEA 
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.firstEA}
                  onChange={(e) => setSettings(prev => ({ ...prev, firstEA: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">1st Electron Affinity</span>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      SL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enthalpy change when adding 1st electron (negative = exothermic, energy released).
                  </p>
                </div>
              </label>

              {/* Second EA (HL Only) */}
              <label 
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.secondEA 
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={settings.secondEA}
                  onChange={(e) => setSettings(prev => ({ ...prev, secondEA: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">2nd Electron Affinity</span>
                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      HL Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Endothermic 2nd EA for oxygen and sulfur (adding e⁻ to already negative 1⁻ ion).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* "Any Comparison" Opt-In with Warning Box */}
          <div className="pt-2 border-t border-slate-100">
            <div className={`p-4 rounded-2xl border transition-all ${
              settings.allowMultipleVariables 
                ? 'bg-amber-50/80 border-amber-300' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings.allowMultipleVariables}
                  onChange={(e) => setSettings(prev => ({ ...prev, allowMultipleVariables: e.target.checked }))}
                  className="mt-1 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Opt-in: "Any comparison" (Cross-Period & Cross-Group)
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Multiple Variables
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-amber-900/90 leading-relaxed">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Warning:</strong> Comparisons where both the period and group change involve competing factors (increasing nuclear charge vs adding electron shells). While many can be deduced using general principles, close calls are tricky or impossible to predict without looking up experimental data.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {hasAtLeastOneSelected ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Ready! Toggles configured.
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Please select at least one property to start.
                </span>
              )}
            </div>

            <button
              onClick={startChallenge}
              disabled={!hasAtLeastOneSelected}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                hasAtLeastOneSelected 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Start Challenge Practice</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CHALLENGE QUESTION VIEW ---
  if (!question) {
    return <div className="text-center p-12 text-slate-500">Loading challenge...</div>;
  }

  const val1 = getPropertyValue(question.s1, question.prop1);
  const val2 = getPropertyValue(question.s2, question.prop2);
  const isEA = question.prop1.includes('EA');
  const isSecondIE = question.prop1 === 'secondIE' || question.prop2 === 'secondIE';

  const showPropLabel = question.prop1 !== question.prop2;

  const getPropBadgeLabel = (p: string) => {
    switch (p) {
      case 'firstIE': return "1st IE";
      case 'secondIE': return "2nd IE";
      case 'firstEA': return "1st EA";
      case 'secondEA': return "2nd EA";
      case 'atomicRadius': return "Atomic Radius";
      case 'ionicRadius': return "Ionic Radius";
      case 'electronegativity': return "Electronegativity";
      default: return p;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-2 animate-fadeIn space-y-4">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center border-b border-slate-200 pb-3">
        <button 
          onClick={() => setInSetup(true)} 
          className="flex items-center text-slate-600 hover:text-slate-900 font-medium text-sm transition cursor-pointer"
        >
          <Settings2 className="mr-1.5 w-4 h-4 text-indigo-600" /> Adjust Settings / Filters
        </button>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{streak} Streak!</span>
            </span>
          )}
          <button 
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
          >
            Main Menu
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full relative space-y-4">
        <div className="text-center space-y-3">
          {/* Tags & Badges */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            {question.notes.map((note, idx) => (
              <span 
                key={idx} 
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  note === 'HL' 
                    ? 'bg-purple-100 text-purple-800' 
                    : note === 'SL' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : note.includes('Alert') 
                    ? 'bg-amber-100 text-amber-800' 
                    : note.includes('multiple') 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {note.includes('Alert') && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                {note === 'HL' && <Zap className="w-3 h-3 text-purple-600" />}
                {note.includes('multiple') && <Layers className="w-3 h-3 text-orange-600" />}
                {note}
              </span>
            ))}
          </div>

          {/* Question Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {question.title}
          </h2>

          {/* Specific framing note for Second Ionization Energy prompts per user instruction */}
          {isSecondIE && (
            <div className="bg-purple-50/90 border border-purple-200 text-purple-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto shadow-2xs text-left sm:text-center">
              <span className="font-bold text-purple-800">Note!</span> You are being asked to determine which element has the higher 2nd IE, so to help you make the relevant comparison, the structures below are the 1+ ions. Which will require more energy to remove a valence electron?
            </div>
          )}

          {/* "Hint?" button immediately below question */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setIsHintOpen(true)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Hint?</span>
            </button>
          </div>
        </div>

        {/* Options Comparison Container */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 relative mt-4">
          <FeedbackOverlay status={feedback} />

          {/* Option 1 */}
          <button
            onClick={() => handleChoice(1)}
            disabled={revealed}
            className={`flex-1 flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 relative cursor-pointer ${
              revealed
                ? (isEA ? val1! < val2! : val1! > val2!)
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300'
                  : 'border-slate-200 opacity-40 grayscale'
                : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50/80 active:scale-[0.99]'
            }`}
          >
            {showPropLabel && (
              <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md mb-2">
                {getPropBadgeLabel(question.prop1)}
              </span>
            )}
            <BohrAtom species={question.s1} size={240} />
            {revealed && (
              <div className="mt-4 text-center animate-pop-in">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Booklet Value</span>
                <div className="text-xl font-mono font-extrabold text-slate-900">
                  {formatPropertyValue(val1 || 0, question.prop1)}
                </div>
              </div>
            )}
          </button>

          {/* Center VS Divider */}
          <div className="flex items-center justify-center">
            <div className="w-px h-full bg-slate-200 mx-2 hidden md:block"></div>
            <span className="text-slate-400 font-black italic md:hidden">VS</span>
          </div>

          {/* Option 2 */}
          <button
            onClick={() => handleChoice(2)}
            disabled={revealed}
            className={`flex-1 flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 relative cursor-pointer ${
              revealed
                ? (isEA ? val2! < val1! : val2! > val1!)
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300'
                  : 'border-slate-200 opacity-40 grayscale'
                : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50/80 active:scale-[0.99]'
            }`}
          >
            {showPropLabel && (
              <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md mb-2">
                {getPropBadgeLabel(question.prop2)}
              </span>
            )}
            <BohrAtom species={question.s2} size={240} />
            {revealed && (
              <div className="mt-4 text-center animate-pop-in">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Booklet Value</span>
                <div className="text-xl font-mono font-extrabold text-slate-900">
                  {formatPropertyValue(val2 || 0, question.prop2)}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Revealed Explanation Section */}
        {revealed && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fadeIn space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 mb-1">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Chemical Principle Explanation</span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={loadNextQuestion}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full text-base font-bold transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Next Comparison</span>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MASTERY BARS SECTION */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className={`grid grid-cols-1 ${isHLToggled ? 'md:grid-cols-2' : ''} gap-4`}>
          {/* SL Mastery Bar */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                SL Mastery
              </span>
              <div className="flex items-center gap-2">
                {slMastery === 100 && (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full animate-pulse">
                    100% Mastered!
                  </span>
                )}
                <span className="font-mono font-bold text-slate-700">{slMastery}%</span>
              </div>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${slMastery}%` }}
              />
            </div>
          </div>

          {/* HL Mastery Bar (if HL is toggled in settings) */}
          {isHLToggled && (
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  HL Mastery
                </span>
                <div className="flex items-center gap-2">
                  {hlMastery === 100 && (
                    <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full animate-pulse">
                      100% Mastered!
                    </span>
                  )}
                  <span className="font-mono font-bold text-slate-700">{hlMastery}%</span>
                </div>
              </div>
              {/* Progress Track */}
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${hlMastery}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint Modal */}
      <HintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hint={question.hint}
      />
    </div>
  );
};

export default ChallengeMode;
