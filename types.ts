export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  group: number;
  period: number;
  mass: number;
  atomicRadius: number; // pm (covalent radius from data booklet)
  ionicRadius?: Record<number, number>; // charge -> radius in pm from data booklet
  firstIE: number; // kJ/mol from data booklet
  secondIE?: number; // kJ/mol from data booklet
  firstEA: number; // kJ/mol (enthalpy change from data booklet)
  secondEA?: number; // kJ/mol from data booklet
  electronegativity?: number; // Pauling scale from data booklet
}

export interface Species {
  element: ElementData;
  charge: number;
  electrons: number;
  config: number[]; // e.g., [2, 8, 1]
}

export type ParticleType = 'protons' | 'neutrons' | 'electrons' | 'occupiedShells' | 'coreElectrons' | 'zeff';

export type ComparisonProperty = 
  | 'atomicRadius' 
  | 'ionicRadius' 
  | 'firstIE' 
  | 'secondIE' 
  | 'firstEA' 
  | 'secondEA' 
  | 'electronegativity';

export interface ChallengeSettings {
  atomicRadius: boolean;
  ionicRadius: boolean;
  electronegativity: boolean;
  firstIE: boolean;
  firstEA: boolean;
  ieAnomalies: boolean; // HL
  successiveIE: boolean; // HL
  secondEA: boolean; // HL
  allowMultipleVariables: boolean; // Opt-in
}

export interface ComparisonQuestion {
  s1: Species;
  s2: Species;
  prop1: ComparisonProperty;
  prop2: ComparisonProperty;
  title: string;
  unit: string;
  isHL: boolean;
  isAnomaly: boolean;
  hasMultipleVariables: boolean;
  notes: string[];
  hint: {
    title: string;
    definition: string;
    keyFactors: string[];
    clue: string;
  };
  explanation: string;
}

export type GameLevel = 'menu' | 'tutorial' | 'challenge' | 'challenge-setup';

export interface UserAnswers {
  [key: string]: number | string;
}