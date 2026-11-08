import { ElementData, ChallengeSettings } from './types';

// IBDP Data Booklet periodic properties (Atomic and ionic radii, First IE, EA, Electronegativity)
// Radii in 10^-12 m (pm) - Covalent atomic radius
// Ionization energies and Electron affinities in kJ/mol (EA is enthalpy change: negative = exothermic)
// Electronegativity on Pauling scale
export const ELEMENTS: ElementData[] = [
  // Period 1
  { 
    atomicNumber: 1, 
    symbol: 'H', 
    name: 'Hydrogen', 
    group: 1, 
    period: 1, 
    mass: 1, 
    atomicRadius: 32,
    ionicRadius: { [-1]: 154 },
    firstIE: 1312, 
    firstEA: -73,
    electronegativity: 2.2
  },
  { 
    atomicNumber: 2, 
    symbol: 'He', 
    name: 'Helium', 
    group: 18, 
    period: 1, 
    mass: 4, 
    atomicRadius: 31,
    firstIE: 2372, 
    secondIE: 5251, 
    firstEA: 48 
  },

  // Period 2
  { 
    atomicNumber: 3, 
    symbol: 'Li', 
    name: 'Lithium', 
    group: 1, 
    period: 2, 
    mass: 7, 
    atomicRadius: 130,
    ionicRadius: { [1]: 76 },
    firstIE: 520, 
    secondIE: 7298, 
    firstEA: -60,
    electronegativity: 1.0 
  },
  { 
    atomicNumber: 4, 
    symbol: 'Be', 
    name: 'Beryllium', 
    group: 2, 
    period: 2, 
    mass: 9, 
    atomicRadius: 99,
    ionicRadius: { [2]: 45 },
    firstIE: 900, 
    secondIE: 1757, 
    firstEA: 66,
    electronegativity: 1.6 
  },
  { 
    atomicNumber: 5, 
    symbol: 'B', 
    name: 'Boron', 
    group: 13, 
    period: 2, 
    mass: 11, 
    atomicRadius: 84,
    ionicRadius: { [3]: 27 },
    firstIE: 801, 
    secondIE: 2427, 
    firstEA: -27,
    electronegativity: 2.0 
  },
  { 
    atomicNumber: 6, 
    symbol: 'C', 
    name: 'Carbon', 
    group: 14, 
    period: 2, 
    mass: 12, 
    atomicRadius: 75,
    firstIE: 1086, 
    secondIE: 2353, 
    firstEA: -122,
    electronegativity: 2.6 
  },
  { 
    atomicNumber: 7, 
    symbol: 'N', 
    name: 'Nitrogen', 
    group: 15, 
    period: 2, 
    mass: 14, 
    atomicRadius: 71,
    ionicRadius: { [-3]: 146 },
    firstIE: 1402, 
    secondIE: 2856, 
    firstEA: 7,
    electronegativity: 3.0 
  },
  { 
    atomicNumber: 8, 
    symbol: 'O', 
    name: 'Oxygen', 
    group: 16, 
    period: 2, 
    mass: 16, 
    atomicRadius: 64,
    ionicRadius: { [-2]: 140 },
    firstIE: 1314, 
    secondIE: 3388, 
    firstEA: -141, 
    secondEA: 753,
    electronegativity: 3.4 
  },
  { 
    atomicNumber: 9, 
    symbol: 'F', 
    name: 'Fluorine', 
    group: 17, 
    period: 2, 
    mass: 19, 
    atomicRadius: 60,
    ionicRadius: { [-1]: 133 },
    firstIE: 1681, 
    secondIE: 3374, 
    firstEA: -328,
    electronegativity: 4.0 
  },
  { 
    atomicNumber: 10, 
    symbol: 'Ne', 
    name: 'Neon', 
    group: 18, 
    period: 2, 
    mass: 20, 
    atomicRadius: 62,
    firstIE: 2081, 
    secondIE: 3952, 
    firstEA: 116 
  },

  // Period 3
  { 
    atomicNumber: 11, 
    symbol: 'Na', 
    name: 'Sodium', 
    group: 1, 
    period: 3, 
    mass: 23, 
    atomicRadius: 160,
    ionicRadius: { [1]: 102 },
    firstIE: 496, 
    secondIE: 4562, 
    firstEA: -53,
    electronegativity: 0.9 
  },
  { 
    atomicNumber: 12, 
    symbol: 'Mg', 
    name: 'Magnesium', 
    group: 2, 
    period: 3, 
    mass: 24, 
    atomicRadius: 140,
    ionicRadius: { [2]: 72 },
    firstIE: 738, 
    secondIE: 1451, 
    firstEA: 230,
    electronegativity: 1.3 
  },
  { 
    atomicNumber: 13, 
    symbol: 'Al', 
    name: 'Aluminium', 
    group: 13, 
    period: 3, 
    mass: 27, 
    atomicRadius: 124,
    ionicRadius: { [3]: 54 },
    firstIE: 578, 
    secondIE: 1817, 
    firstEA: -43,
    electronegativity: 1.6 
  },
  { 
    atomicNumber: 14, 
    symbol: 'Si', 
    name: 'Silicon', 
    group: 14, 
    period: 3, 
    mass: 28, 
    atomicRadius: 114,
    ionicRadius: { [4]: 40 },
    firstIE: 787, 
    secondIE: 1577, 
    firstEA: -134,
    electronegativity: 1.9 
  },
  { 
    atomicNumber: 15, 
    symbol: 'P', 
    name: 'Phosphorus', 
    group: 15, 
    period: 3, 
    mass: 31, 
    atomicRadius: 109,
    ionicRadius: { [-3]: 212 },
    firstIE: 1012, 
    secondIE: 1907, 
    firstEA: -72,
    electronegativity: 2.2 
  },
  { 
    atomicNumber: 16, 
    symbol: 'S', 
    name: 'Sulfur', 
    group: 16, 
    period: 3, 
    mass: 32, 
    atomicRadius: 104,
    ionicRadius: { [-2]: 184 },
    firstIE: 1000, 
    secondIE: 2252, 
    firstEA: -200, 
    secondEA: 545,
    electronegativity: 2.6 
  },
  { 
    atomicNumber: 17, 
    symbol: 'Cl', 
    name: 'Chlorine', 
    group: 17, 
    period: 3, 
    mass: 35, 
    atomicRadius: 100,
    ionicRadius: { [-1]: 181 },
    firstIE: 1251, 
    secondIE: 2298, 
    firstEA: -349,
    electronegativity: 3.2 
  },
  { 
    atomicNumber: 18, 
    symbol: 'Ar', 
    name: 'Argon', 
    group: 18, 
    period: 3, 
    mass: 40, 
    atomicRadius: 101,
    firstIE: 1521, 
    secondIE: 2666, 
    firstEA: 96 
  },

  // Period 4
  { 
    atomicNumber: 19, 
    symbol: 'K', 
    name: 'Potassium', 
    group: 1, 
    period: 4, 
    mass: 39, 
    atomicRadius: 200,
    ionicRadius: { [1]: 138 },
    firstIE: 419, 
    secondIE: 3052, 
    firstEA: -48,
    electronegativity: 0.8 
  },
  { 
    atomicNumber: 20, 
    symbol: 'Ca', 
    name: 'Calcium', 
    group: 2, 
    period: 4, 
    mass: 40, 
    atomicRadius: 174,
    ionicRadius: { [2]: 100 },
    firstIE: 590, 
    secondIE: 1145, 
    firstEA: 156,
    electronegativity: 1.0 
  },
];

export const VALID_CHARGES = {
  metals: [0, 1, 2, 3],
  nonMetals: [0, -1, -2, -3],
  noble: [0]
};

// Map atomic number to allowed charges for this app's scope
export const ALLOWED_CHARGES: Record<number, number[]> = {
  // H
  1: [0, 1, -1],
  // Noble Gases
  2: [0], 10: [0], 18: [0],
  // Alkali Metals (Group 1)
  3: [0, 1], 11: [0, 1], 19: [0, 1],
  // Alkaline Earth Metals (Group 2)
  4: [0, 2], 12: [0, 2], 20: [0, 2],
  // Group 13
  5: [0, 3], 13: [0, 3],
  // Group 14
  6: [0], 14: [0], 
  // Group 15
  7: [0, -3], 15: [0, -3],
  // Group 16
  8: [0, -2], 16: [0, -2],
  // Group 17
  9: [0, -1], 17: [0, -1],
};

export const PARTICLE_OPTIONS = Array.from({ length: 21 }, (_, i) => i); // 0-20
export const SHELL_OPTIONS = [0, 1, 2, 3, 4, 5];
export const ZEFF_OPTIONS = Array.from({ length: 21 }, (_, i) => i); // 0-20

// Default Challenge settings per user request:
// Default selection is atomic radius with the others not selected.
export const DEFAULT_CHALLENGE_SETTINGS: ChallengeSettings = {
  atomicRadius: true,
  ionicRadius: false,
  electronegativity: false,
  firstIE: false,
  firstEA: false,
  ieAnomalies: false,
  successiveIE: false,
  secondEA: false,
  allowMultipleVariables: false,
};