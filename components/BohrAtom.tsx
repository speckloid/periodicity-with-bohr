import React from 'react';
import { Species } from '../types';

interface BohrAtomProps {
  species: Species;
  size?: number;
  showSymbol?: boolean;
}

export function getIonChargeSuperscript(c: number): string {
  if (c === 0) return '';
  const abs = Math.abs(c);
  const sign = c > 0 ? '⁺' : '⁻';
  const supMap: Record<number, string> = { 1: '', 2: '²', 3: '³', 4: '⁴' };
  return `${supMap[abs] !== undefined ? supMap[abs] : abs}${sign}`;
}

export function getIonFormattedSymbol(symbol: string, charge: number): string {
  if (charge === 0) return symbol;
  return `${symbol}${getIonChargeSuperscript(charge)}`;
}

const BohrAtom: React.FC<BohrAtomProps> = ({ species, size = 300, showSymbol = true }) => {
  const { element, config, charge, electrons } = species;
  
  const center = size / 2;
  const maxShells = 4; // Max period 4
  const shellSpacing = (size * 0.38) / maxShells;
  const nucleusRadius = Math.max(16, shellSpacing * 0.65);
  
  // Calculate shell radii
  const shells = config.map((_, i) => nucleusRadius + (i + 1) * shellSpacing);

  const formattedIonSymbol = getIonFormattedSymbol(element.symbol, charge);

  // Helper to get electron positions based on "clock" rules
  const getElectronPositions = (count: number, radius: number) => {
    const TOP = -Math.PI / 2;
    const BOTTOM = Math.PI / 2;
    const RIGHT = 0;
    const LEFT = Math.PI;

    const positions: { x: number, y: number }[] = [];
    const slotAngles = [TOP, BOTTOM, RIGHT, LEFT];
    const pairOrderIndices = [0, 2, 1, 3]; // Top, Right, Bottom, Left

    const slotCounts = [0, 0, 0, 0];
    
    for (let i = 0; i < count; i++) {
      if (i < 4) {
        slotCounts[i]++;
      } else {
        slotCounts[pairOrderIndices[i - 4]]++;
      }
    }

    const pairOffset = 0.18; // Radians offset for pairs
    
    slotCounts.forEach((n, idx) => {
      const baseAngle = slotAngles[idx];
      if (n === 1) {
        positions.push({
          x: center + radius * Math.cos(baseAngle),
          y: center + radius * Math.sin(baseAngle)
        });
      } else if (n === 2) {
        positions.push({
          x: center + radius * Math.cos(baseAngle - pairOffset),
          y: center + radius * Math.sin(baseAngle - pairOffset)
        });
        positions.push({
          x: center + radius * Math.cos(baseAngle + pairOffset),
          y: center + radius * Math.sin(baseAngle + pairOffset)
        });
      }
    });

    return positions;
  };

  // Capitalize element name as label header
  const elementLabel = element.name.charAt(0).toUpperCase() + element.name.slice(1).toLowerCase();

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Soft background glow for ion/atom */}
        <circle 
          cx={center} 
          cy={center} 
          r={shells.length > 0 ? shells[shells.length - 1] + 8 : nucleusRadius + 8} 
          fill={charge !== 0 ? (charge > 0 ? 'rgba(59, 130, 246, 0.03)' : 'rgba(168, 85, 247, 0.03)') : 'rgba(0,0,0,0.01)'}
        />

        {/* Nucleus */}
        <circle 
          cx={center} 
          cy={center} 
          r={nucleusRadius} 
          fill="#F3F4F6" 
          stroke="#1F2937" 
          strokeWidth="1.5"
        />
        
        {/* Symbol */}
        {showSymbol && (
          <text 
            x={center} 
            y={center} 
            dy="0.35em" 
            textAnchor="middle" 
            className="font-bold fill-slate-900 pointer-events-none"
            style={{ fontSize: `${Math.min(nucleusRadius * 0.9, 18)}px` }}
          >
            {element.symbol}
            {charge !== 0 && (
              <tspan dy="-0.4em" dx="0.05em" fontSize="0.8em" className="fill-blue-700 font-extrabold">
                {getIonChargeSuperscript(charge)}
              </tspan>
            )}
          </text>
        )}

        {/* Shells */}
        {shells.map((r, i) => (
          <circle 
            key={`shell-${i}`}
            cx={center} 
            cy={center} 
            r={r} 
            fill="none" 
            stroke="#9CA3AF" 
            strokeWidth="1.2"
          />
        ))}

        {/* Electrons */}
        {shells.map((r, shellIndex) => {
          const numElectrons = config[shellIndex] || 0;
          const positions = getElectronPositions(numElectrons, r);

          return positions.map((pos, elecIndex) => (
            <g key={`e-${shellIndex}-${elecIndex}`}>
              <circle 
                cx={pos.x} 
                cy={pos.y} 
                r={4.5} 
                fill="#1E293B" 
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            </g>
          ));
        })}
      </svg>
      <div className="mt-2 text-center">
        <p className="font-bold text-base text-slate-800">
          {elementLabel} {charge !== 0 && <span className="font-mono text-blue-600 font-bold">({formattedIonSymbol})</span>}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span>Z = {element.atomicNumber}</span>
          <span>•</span>
          <span>{electrons} e⁻</span>
          <span>•</span>
          <span className="font-mono text-slate-600">[{config.join(', ')}]</span>
        </div>
      </div>
    </div>
  );
};

export default BohrAtom;