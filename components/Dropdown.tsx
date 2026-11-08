import React from 'react';

interface DropdownProps {
  label: React.ReactNode;
  value: string | number;
  options: (string | number)[];
  onChange: (val: string) => void;
  disabled?: boolean;
  correctValue?: string | number; // For highlighting correct answer
  highlight?: 'correct' | 'incorrect' | null;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  value, 
  options, 
  onChange, 
  disabled = false,
  correctValue,
  highlight 
}) => {
  
  let borderColor = "border-gray-300";
  let bgColor = "bg-white";
  
  if (highlight === 'correct') {
    borderColor = "border-green-500";
    bgColor = "bg-green-50";
  } else if (highlight === 'incorrect') {
    borderColor = "border-red-500";
    bgColor = "bg-red-50";
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full p-2 border-2 ${borderColor} ${bgColor} rounded-md font-mono text-center appearance-none focus:outline-none focus:ring-2 focus:ring-black transition-colors`}
        >
          <option value="">?</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {highlight === 'incorrect' && correctValue !== undefined && (
          <div className="absolute top-full left-0 w-full text-center text-xs text-green-700 font-bold mt-1">
             Ans: {correctValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;