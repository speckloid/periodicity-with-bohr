import React, { useState, useEffect } from 'react';
import { Species, ParticleType } from '../types';
import { 
  createRandomSpecies, 
  getZeff, 
  getOccupiedShells, 
  getCoreElectrons,
  getSpeciesDescriptor, 
  getPropertyHint 
} from '../services/chemistryService';
import { getIonFormattedSymbol, getIonChargeSuperscript } from './BohrAtom';
import { audioService } from '../services/audioService';
import { PARTICLE_OPTIONS } from '../constants';
import BohrAtom from './BohrAtom';
import FeedbackOverlay from './FeedbackOverlay';
import Dropdown from './Dropdown';
import { 
  ArrowLeft, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  Trophy,
  AlertCircle,
  Atom
} from 'lucide-react';

interface TutorialModeProps {
  onBack: () => void;
  onGoToChallenge: () => void;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({ onBack, onGoToChallenge }) => {
  // Stage: 'single' (Level 1 style) or 'all' (Level 2 style)
  const [stage, setStage] = useState<'single' | 'all'>('single');
  
  // Progress tracking
  const [tutorial1CorrectCount, setTutorial1CorrectCount] = useState(0);
  const [tutorial2CorrectCount, setTutorial2CorrectCount] = useState(0);

  // Current species and question state
  const [species, setSpecies] = useState<Species>(() => createRandomSpecies(false));
  const [targetProperty, setTargetProperty] = useState<ParticleType>('protons');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [roundOver, setRoundOver] = useState(false);
  const [incorrectProperties, setIncorrectProperties] = useState<ParticleType[]>([]);

  // Randomize target property for 'single' stage
  useEffect(() => {
    if (stage === 'single') {
      const props: ParticleType[] = ['protons', 'electrons', 'occupiedShells', 'zeff'];
      setTargetProperty(props[Math.floor(Math.random() * props.length)]);
    }
  }, [stage, species]);

  const getCorrectValues = () => {
    return {
      protons: species.element.atomicNumber,
      electrons: species.electrons,
      occupiedShells: getOccupiedShells(species),
      zeff: getZeff(species),
    };
  };

  const checkAnswers = () => {
    const correct = getCorrectValues();
    const wrongKeys: ParticleType[] = [];

    if (stage === 'single') {
      if (parseInt(answers[targetProperty] || '-1') !== correct[targetProperty]) {
        wrongKeys.push(targetProperty);
      }
    } else {
      if (parseInt(answers['protons'] || '-1') !== correct.protons) wrongKeys.push('protons');
      if (parseInt(answers['electrons'] || '-1') !== correct.electrons) wrongKeys.push('electrons');
      if (parseInt(answers['occupiedShells'] || '-1') !== correct.occupiedShells) wrongKeys.push('occupiedShells');
      if (parseInt(answers['zeff'] || '-1') !== correct.zeff) wrongKeys.push('zeff');
    }

    const isAllCorrect = wrongKeys.length === 0;
    setIncorrectProperties(wrongKeys);

    if (isAllCorrect) {
      audioService.playDing();
      setFeedback('correct');
      setRoundOver(true);

      if (stage === 'single') {
        setTutorial1CorrectCount(prev => prev + 1);
      } else {
        setTutorial2CorrectCount(prev => prev + 1);
      }
    } else {
      audioService.playBoink();
      setFeedback('incorrect');
      if (attemptCount >= 1) {
        setRoundOver(true); // Failed twice
      } else {
        setAttemptCount(prev => prev + 1);
        setTimeout(() => setFeedback(null), 1500); // Allow retry
      }
    }
  };

  const nextQuestion = () => {
    setSpecies(createRandomSpecies(false));
    setAnswers({});
    setAttemptCount(0);
    setFeedback(null);
    setRoundOver(false);
    setIncorrectProperties([]);
  };

  const handleSwitchToAll = () => {
    setStage('all');
    nextQuestion();
  };

  const getLabelFor = (prop: ParticleType) => {
    switch (prop) {
      case 'protons': return 'Protons (Z)';
      case 'electrons': return 'Total Electrons';
      case 'occupiedShells': return 'Occupied Shells';
      case 'zeff': return <>Eff. Nuclear Charge (Z<sub>eff</sub>)</>;
      case 'coreElectrons': return 'Core Electrons';
      default: return prop;
    }
  };

  // Build the clear, specific prompt question based on targetProperty and species
  const getClearPromptHeadline = (prop: ParticleType) => {
    const nameLower = species.element.name.toLowerCase();
    const ionSym = getIonFormattedSymbol(species.element.symbol, species.charge);
    const descriptor = getSpeciesDescriptor(species);

    if (species.charge === 0) {
      switch (prop) {
        case 'protons':
          return `How many protons in an atom of ${nameLower} (${species.element.symbol})?`;
        case 'electrons':
          return `How many total electrons in an atom of ${nameLower} (${species.element.symbol})?`;
        case 'occupiedShells':
          return `How many occupied electron shells in an atom of ${nameLower} (${species.element.symbol})?`;
        case 'zeff':
          return `What is the effective nuclear charge (Zeff) felt by the valence electrons in an atom of ${nameLower} (${species.element.symbol})?`;
        default:
          return `Determine the ${prop} of ${nameLower}`;
      }
    } else {
      switch (prop) {
        case 'protons':
          return `How many protons in ${descriptor} (${ionSym})?`;
        case 'electrons':
          return `How many total electrons in ${descriptor} (${ionSym})?`;
        case 'occupiedShells':
          return `How many occupied electron shells in ${descriptor} (${ionSym})?`;
        case 'zeff':
          return `What is the effective nuclear charge (Zeff) felt by the valence electrons in ${descriptor} (${ionSym})?`;
        default:
          return `Determine the ${prop} of ${descriptor}`;
      }
    }
  };

  const renderInput = (key: ParticleType, label: React.ReactNode, showHint: boolean = false) => {
    const correctVal = getCorrectValues()[key];
    const userVal = answers[key];
    const isRight = roundOver && parseInt(userVal || '-1') === correctVal;

    let highlight: 'correct' | 'incorrect' | null = null;
    if (roundOver) {
      highlight = isRight ? 'correct' : 'incorrect';
    }

    const hintText = getPropertyHint(key);

    return (
      <div key={key} className="flex flex-col gap-1 w-full">
        {showHint && hintText && (
          <div className="bg-amber-50/80 border-l-3 border-amber-500 px-3 py-2 rounded text-xs text-amber-900 leading-relaxed mb-1 flex items-start gap-1.5 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{hintText}</span>
          </div>
        )}
        <Dropdown
          label={label}
          value={answers[key] || ''}
          options={PARTICLE_OPTIONS}
          onChange={(val) => !roundOver && setAnswers(prev => ({ ...prev, [key]: val }))}
          disabled={roundOver}
          correctValue={correctVal}
          highlight={highlight}
        />
      </div>
    );
  };

  const speciesDescriptor = getSpeciesDescriptor(species);
  const ionFormattedSymbol = getIonFormattedSymbol(species.element.symbol, species.charge);
  const elementNameLower = species.element.name.toLowerCase();

  // Dynamic feedback nudge in Stage 2 (Assign all properties at once)
  const renderDynamicFeedbackNudge = () => {
    const correct = getCorrectValues();
    const core = getCoreElectrons(species);

    if (incorrectProperties.length > 0) {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-950 space-y-2 animate-fadeIn">
          <div className="font-bold flex items-center gap-1.5 text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Targeted Feedback for Your Answer:</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc">
            {incorrectProperties.map((key) => {
              if (key === 'electrons') {
                if (species.charge === 0) {
                  return (
                    <li key={key}>
                      <strong>Total electrons:</strong> In a neutral atom of {elementNameLower}, electrons equal the atomic number (Z = {correct.protons}).
                    </li>
                  );
                } else {
                  const lostGained = species.charge > 0 ? `lost ${species.charge}` : `gained ${Math.abs(species.charge)}`;
                  return (
                    <li key={key}>
                      <strong>Total electrons:</strong> In {speciesDescriptor}, the atom has {lostGained} electron(s) compared to its {correct.protons} protons ({correct.protons} - ({species.charge}) = {correct.electrons} e⁻).
                    </li>
                  );
                }
              }
              if (key === 'protons') {
                return (
                  <li key={key}>
                    <strong>Protons (Z):</strong> The atomic number of {elementNameLower} is {correct.protons}. The number of protons in the nucleus never changes when forming an ion!
                  </li>
                );
              }
              if (key === 'occupiedShells') {
                return (
                  <li key={key}>
                    <strong>Occupied shells:</strong> Count the concentric rings in the Bohr diagram that contain electrons ({correct.occupiedShells} shell{correct.occupiedShells > 1 ? 's' : ''}).
                  </li>
                );
              }
              if (key === 'zeff') {
                return (
                  <li key={key}>
                    <strong>Z<sub>eff</sub>:</strong> Effective nuclear charge = atomic number (protons) minus shielding core electrons (inner shells). Here: {correct.protons} protons - {core} core electrons = {correct.zeff}.
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      );
    }

    // Default reference reminder when no active mistake
    return (
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
        <span className="font-semibold text-amber-950">Structural Reference:</span> Z<sub>eff</sub> = Protons (Z) - Core Electrons (shielding). For a neutral atom, electrons = protons.
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-2">
      {/* Top Navigation & Mode Switcher */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <button 
          onClick={onBack} 
          className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="mr-2 w-5 h-5" /> Back to Main Menu
        </button>

        {/* Stage Selector Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setStage('single'); nextQuestion(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              stage === 'single' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Step 1: Single Property {tutorial1CorrectCount > 0 && `(${tutorial1CorrectCount} ✓)`}
          </button>
          <button
            onClick={() => { setStage('all'); nextQuestion(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              stage === 'all' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Step 2: Assign All Properties {tutorial2CorrectCount > 0 && `(${tutorial2CorrectCount}/3 ✓)`}
          </button>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        {/* Bohr Diagram Visual */}
        <div className="relative flex flex-col items-center">
          <BohrAtom species={species} size={300} />
          <FeedbackOverlay status={feedback} />
        </div>

        {/* Controls and Inputs */}
        <div className="flex flex-col flex-1 w-full max-w-md gap-5">
          {/* Clear, direct prompt headline per user request */}
          <div className="border-b border-slate-100 pb-3">
            {stage === 'single' ? (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Question
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {getClearPromptHeadline(targetProperty)}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5 capitalize">
                  <Atom className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{speciesDescriptor}</span>
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  Full Analysis
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {species.charge === 0 
                    ? `Assign all structural properties for an atom of ${elementNameLower} (${species.element.symbol})`
                    : `Assign all structural properties for ${speciesDescriptor} (${ionFormattedSymbol})`
                  }
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5 capitalize">
                  <Atom className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{speciesDescriptor}</span>
                </p>
              </div>
            )}
          </div>

          {/* Input Controls */}
          <div className="space-y-4">
            {stage === 'single' ? (
              // Step 1: Single input with explicit hint directly above it
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {renderInput(targetProperty, getLabelFor(targetProperty), true)}
              </div>
            ) : (
              // Step 2: All 4 inputs with dynamic feedback nudge
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {renderInput('protons', 'Protons (Z)')}
                  {renderInput('electrons', 'Total Electrons')}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {renderInput('occupiedShells', 'Occupied Shells')}
                  {renderInput('zeff', <>Z<sub>eff</sub></>)}
                </div>
                
                {/* Dynamic feedback nudge that actively targets mistakes */}
                {renderDynamicFeedbackNudge()}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            {!roundOver ? (
              <button
                onClick={checkAnswers}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl font-semibold transition active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Answer</span>
                {attemptCount > 0 && <span className="text-xs text-amber-300 font-bold">(Last Try!)</span>}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <span>Next Question</span>
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {roundOver && feedback === 'incorrect' && (
              <div className="text-xs text-red-700 font-medium text-center bg-red-50 border border-red-200 p-2.5 rounded-lg">
                Review the correct values shown above in green, then try the next species.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progression Banner 1: From Tutorial 1 to Tutorial 2 */}
      {stage === 'single' && tutorial1CorrectCount >= 1 && (
        <div className="w-full mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-950">
                Got the idea? Skip to assign all the properties at once
              </h4>
              <p className="text-xs text-blue-800">
                You've mastered single properties! Test your skills with the full atomic profile.
              </p>
            </div>
          </div>
          <button
            onClick={handleSwitchToAll}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Assign all properties at once</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progression Banner 2: From Tutorial 2 to Challenge Mode */}
      {stage === 'all' && tutorial2CorrectCount >= 3 && (
        <div className="w-full mt-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  Achievement Unlocked!
                </span>
                <span className="text-xs text-emerald-700 font-semibold">{tutorial2CorrectCount} completed</span>
              </div>
              <h4 className="font-bold text-base text-emerald-950 mt-1">
                Looks like you're getting the hang of it — want to try a challenge?
              </h4>
              <p className="text-xs text-emerald-800">
                Ready to compare periodic trends (radii, ionization energies, electronegativity)?
              </p>
            </div>
          </div>
          <button
            onClick={onGoToChallenge}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Launch Challenge Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialMode;
