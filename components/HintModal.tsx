import React from 'react';
import { X, Lightbulb, BookOpen, CheckCircle2 } from 'lucide-react';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint: {
    title: string;
    definition: string;
    keyFactors: string[];
    clue: string;
  };
}

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, hint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-200 animate-pulse" />
            <h3 className="font-bold text-lg tracking-tight">Concept Hint: {hint.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close Hint"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-700 text-sm">
          {/* Definition */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>IB DP Syllabus Definition</span>
            </div>
            <p className="text-slate-800 leading-relaxed italic">
              "{hint.definition}"
            </p>
          </div>

          {/* Key Factors */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-2">
              Core Principles to Consider
            </h4>
            <ul className="space-y-2">
              {hint.keyFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clue for this question */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>💡 Thinking Strategy</span>
            </h4>
            <p className="text-blue-950 font-medium leading-relaxed">
              {hint.clue}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition active:scale-95"
          >
            Got it, let me answer!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintModal;
