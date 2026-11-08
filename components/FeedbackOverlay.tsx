import React from 'react';
import { Smile, Frown } from 'lucide-react';

interface FeedbackOverlayProps {
  status: 'correct' | 'incorrect' | null;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="animate-pop-in drop-shadow-2xl">
        {status === 'correct' ? (
          <Smile className="w-48 h-48 text-yellow-400 fill-yellow-100 stroke-[1.5]" />
        ) : (
          <Frown className="w-48 h-48 text-gray-800 fill-gray-200 stroke-[1.5]" />
        )}
      </div>
    </div>
  );
};

export default FeedbackOverlay;