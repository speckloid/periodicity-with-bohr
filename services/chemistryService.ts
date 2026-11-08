import { ELEMENTS, ALLOWED_CHARGES } from '../constants';
import { Species, ElementData, ChallengeSettings, ComparisonQuestion, ComparisonProperty, ParticleType } from '../types';
import { getIonChargeSuperscript, getIonFormattedSymbol } from '../components/BohrAtom';

export function getElectronConfiguration(protons: number, electrons: number): number[] {
  // Simplified Bohr model config for Z <= 20: 2, 8, 8, 2
  const config: number[] = [];
  let remaining = electrons;
  
  const capacities = [2, 8, 8, 2]; // For up to Ca (20)

  for (const cap of capacities) {
    if (remaining <= 0) break;
    const filling = Math.min(remaining, cap);
    config.push(filling);
    remaining -= filling;
  }
  
  return config;
}

export function createRandomSpecies(restrictToAtom: boolean = false): Species {
  const elementIdx = Math.floor(Math.random() * ELEMENTS.length);
  const element = ELEMENTS[elementIdx];
  
  let charge = 0;
  if (!restrictToAtom) {
    const possibleCharges = ALLOWED_CHARGES[element.atomicNumber] || [0];
    const chargeIdx = Math.floor(Math.random() * possibleCharges.length);
    charge = possibleCharges[chargeIdx];
  }

  const electrons = element.atomicNumber - charge;
  const config = getElectronConfiguration(element.atomicNumber, electrons);

  return {
    element,
    charge,
    electrons,
    config
  };
}

export function makeSpecies(element: ElementData, charge: number = 0): Species {
  const electrons = element.atomicNumber - charge;
  return {
    element,
    charge,
    electrons,
    config: getElectronConfiguration(element.atomicNumber, electrons)
  };
}

// Determines 'a' vs 'an' based on phonetics/initial letter
export function getIndefiniteArticle(word: string): 'a' | 'an' {
  const firstLetter = word.trim().charAt(0).toLowerCase();
  return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
}

export function getSpeciesDescriptor(species: Species): string {
  const nameLower = species.element.name.toLowerCase();
  const article = getIndefiniteArticle(nameLower);

  if (species.charge === 0) {
    return `${article} neutral ${nameLower} atom`;
  }
  
  const abs = Math.abs(species.charge);
  const sign = species.charge > 0 ? '+' : '-';
  const chargeText = `${abs}${sign}`; // e.g. "2+", "1+", "2-"
  
  return `${article} ${nameLower} ${chargeText} ion`;
}

export function getPropertyHint(prop: ParticleType): string {
  switch (prop) {
    case 'zeff':
      return "What charge do the valence (outer-shell) electrons feel? - Count up the shielding electrons (all those that are in principal energy levels closer to the nucleus) and then take this number away from the atomic (proton) number..";
    case 'protons':
      return "The atomic (proton) number defines the element's identity - how many positive protons reside in the nucleus?";
    case 'electrons':
      return "For a neutral atom, electrons equal protons. Adjust for ion charge: positive ions lose electrons, negative ions gain electrons.";
    case 'occupiedShells':
      return "Count the number of electron energy levels (shells) currently holding electrons in this Bohr diagram.";
    default:
      return "";
  }
}

export function getCoreElectrons(species: Species): number {
  if (species.config.length <= 1) return 0;
  let core = 0;
  for (let i = 0; i < species.config.length - 1; i++) {
    core += species.config[i];
  }
  return core;
}

export function getOccupiedShells(species: Species): number {
  return species.config.length;
}

export function getZeff(species: Species): number {
  const core = getCoreElectrons(species);
  return species.element.atomicNumber - core;
}

export function getPropertyValue(species: Species, prop: ComparisonProperty): number | null {
  const { element, charge } = species;
  switch (prop) {
    case 'atomicRadius':
      return element.atomicRadius;
    case 'ionicRadius':
      if (element.ionicRadius && element.ionicRadius[charge] !== undefined) {
        return element.ionicRadius[charge];
      }
      return element.atomicRadius;
    case 'electronegativity':
      return element.electronegativity ?? null;
    case 'firstIE':
      return element.firstIE;
    case 'secondIE':
      return element.secondIE ?? null;
    case 'firstEA':
      return element.firstEA;
    case 'secondEA':
      return element.secondEA ?? null;
    default:
      return null;
  }
}

export function formatPropertyValue(val: number, prop: ComparisonProperty): string {
  switch (prop) {
    case 'atomicRadius':
    case 'ionicRadius':
      return `${val} pm`;
    case 'electronegativity':
      return val.toFixed(1);
    case 'firstIE':
    case 'secondIE':
      return val > 0 ? `+${val} kJ/mol` : `${val} kJ/mol`;
    case 'firstEA':
    case 'secondEA':
      return val > 0 ? `+${val} kJ/mol` : `${val} kJ/mol`;
    default:
      return `${val}`;
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate Challenge Question based on toggles
export function generateChallengeQuestion(settings: ChallengeSettings): ComparisonQuestion {
  const enabledCategories: string[] = [];

  if (settings.atomicRadius) enabledCategories.push('atomicRadius');
  if (settings.ionicRadius) enabledCategories.push('ionicRadius');
  if (settings.electronegativity) enabledCategories.push('electronegativity');
  if (settings.firstIE) enabledCategories.push('firstIE');
  if (settings.ieAnomalies) enabledCategories.push('ieAnomalies');
  if (settings.successiveIE) enabledCategories.push('successiveIE');
  if (settings.firstEA) enabledCategories.push('firstEA');
  if (settings.secondEA) enabledCategories.push('secondEA');

  const category = enabledCategories.length > 0 ? pickRandom(enabledCategories) : 'atomicRadius';

  // --- 1. ATOMIC RADIUS ---
  if (category === 'atomicRadius') {
    let e1: ElementData, e2: ElementData;
    let hasMultipleVariables = false;

    if (!settings.allowMultipleVariables) {
      const samePeriod = Math.random() < 0.5;
      if (samePeriod) {
        const periodNum = Math.random() < 0.5 ? 2 : 3;
        const periodElements = ELEMENTS.filter(e => e.period === periodNum);
        e1 = pickRandom(periodElements);
        const others = periodElements.filter(e => e.symbol !== e1.symbol);
        e2 = pickRandom(others);
      } else {
        const candidateGroups = [1, 2, 17, 18];
        const g = pickRandom(candidateGroups);
        const groupElements = ELEMENTS.filter(e => e.group === g);
        e1 = groupElements[0];
        e2 = groupElements[Math.min(groupElements.length - 1, 1 + Math.floor(Math.random() * (groupElements.length - 1)))];
      }
    } else {
      e1 = pickRandom(ELEMENTS);
      const others = ELEMENTS.filter(e => e.symbol !== e1.symbol);
      e2 = pickRandom(others);
      if (e1.group !== e2.group && e1.period !== e2.period) {
        hasMultipleVariables = true;
      }
    }

    const s1 = makeSpecies(e1, 0);
    const s2 = makeSpecies(e2, 0);
    const notes: string[] = ["SL", "Atomic Radius"];
    if (hasMultipleVariables) notes.push("Note: multiple variables changing - explanation might be tricky!");

    const winner = e1.atomicRadius > e2.atomicRadius ? e1 : e2;
    const loser = winner.symbol === e1.symbol ? e2 : e1;
    const winName = winner.name.toLowerCase();
    const loseName = loser.name.toLowerCase();

    let explanation = "";
    if (e1.period === e2.period) {
      explanation = `Across period ${e1.period}, elements have the same number of occupied shells (${e1.period}), but nuclear charge increases from left to right. An atom of ${loseName} (Z = ${loser.atomicNumber}) pulls its valence electrons closer than ${winName} (Z = ${winner.atomicNumber}), so ${winName} has the larger atomic radius (${winner.atomicRadius} pm vs ${loser.atomicRadius} pm).`;
    } else if (e1.group === e2.group) {
      explanation = `Down group ${e1.group}, each successive period adds an entire principal energy level (shell). An atom of ${winName} (period ${winner.period}) has more electron shells than ${loseName} (period ${loser.period}), making its valence electrons significantly farther from the nucleus (${winner.atomicRadius} pm vs ${loser.atomicRadius} pm).`;
    } else {
      explanation = `An atom of ${winName} has a covalent radius of ${winner.atomicRadius} pm, compared to ${loseName}'s ${loser.atomicRadius} pm. Across periods and groups, atomic radius decreases across a period (higher Zeff) and increases down a group (more shells).`;
    }

    return {
      s1,
      s2,
      prop1: 'atomicRadius',
      prop2: 'atomicRadius',
      title: "Which has the larger atomic radius?",
      unit: "pm",
      isHL: false,
      isAnomaly: false,
      hasMultipleVariables,
      notes,
      hint: {
        title: "Atomic Radius",
        definition: "Atomic radius is measured as the covalent radius — half the distance between the nuclei of two bonded atoms of the same element.",
        keyFactors: [
          "Principal Energy Levels (Shells): More shells = larger atomic radius (dominates down a group).",
          "Effective Nuclear Charge (Zeff): With equal shells, more protons pull outer electrons closer (decreases across a period).",
          "Shielding: Inner-shell electrons shield valence electrons from the full nuclear charge."
        ],
        clue: "First compare their periods (number of shells). If they are in the same period, look for the element with fewer protons (lower nuclear pull)."
      },
      explanation
    };
  }

  // --- 2. IONIC RADIUS ---
  if (category === 'ionicRadius') {
    const subType = Math.random();
    let s1: Species, s2: Species;
    let title = "Which has the larger ionic radius?";
    let explanation = "";
    let isHL = false;
    let hasMultipleVariables = false;

    // A: Isoelectronic Series (N3-, O2-, F-, Na+, Mg2+, Al3+)
    if (subType < 0.45) {
      const isoelectronicList: { sym: string; charge: number }[] = [
        { sym: 'N', charge: -3 },
        { sym: 'O', charge: -2 },
        { sym: 'F', charge: -1 },
        { sym: 'Na', charge: 1 },
        { sym: 'Mg', charge: 2 },
        { sym: 'Al', charge: 3 },
      ];
      const p1 = pickRandom(isoelectronicList);
      const remain = isoelectronicList.filter(item => item.sym !== p1.sym);
      const p2 = pickRandom(remain);

      const el1 = ELEMENTS.find(e => e.symbol === p1.sym)!;
      const el2 = ELEMENTS.find(e => e.symbol === p2.sym)!;
      s1 = makeSpecies(el1, p1.charge);
      s2 = makeSpecies(el2, p2.charge);

      const r1 = el1.ionicRadius![p1.charge];
      const r2 = el2.ionicRadius![p2.charge];
      const winSpecies = r1 > r2 ? s1 : s2;
      const loseSpecies = winSpecies === s1 ? s2 : s1;
      const winR = Math.max(r1, r2);
      const loseR = Math.min(r1, r2);

      const winIonSymbol = getIonFormattedSymbol(winSpecies.element.symbol, winSpecies.charge);
      const loseIonSymbol = getIonFormattedSymbol(loseSpecies.element.symbol, loseSpecies.charge);
      const winName = winSpecies.element.name.toLowerCase();
      const loseName = loseSpecies.element.name.toLowerCase();

      explanation = `Both ${winIonSymbol} (${winName}) and ${loseIonSymbol} (${loseName}) are isoelectronic, sharing identical electron configurations (10 electrons: 2, 8). Because ${loseName} has more protons (${loseSpecies.element.atomicNumber}) than ${winName} (${winSpecies.element.atomicNumber}), its nucleus exerts a stronger electrostatic pull on the 10 electrons, shrinking its radius (${loseR} pm vs ${winR} pm).`;
    } else if (subType < 0.75) {
      // B: Same group ions (e.g. Li+ vs Na+, Na+ vs K+, F- vs Cl-)
      const pairs = [
        { e1: 'Li', c1: 1, e2: 'Na', c2: 1 },
        { e1: 'Na', c1: 1, e2: 'K', c2: 1 },
        { e1: 'Mg', c1: 2, e2: 'Ca', c2: 2 },
        { e1: 'F', c1: -1, e2: 'Cl', c2: -1 },
        { e1: 'O', c1: -2, e2: 'S', c2: -2 },
      ];
      const chosen = pickRandom(pairs);
      const el1 = ELEMENTS.find(e => e.symbol === chosen.e1)!;
      const el2 = ELEMENTS.find(e => e.symbol === chosen.e2)!;
      s1 = makeSpecies(el1, chosen.c1);
      s2 = makeSpecies(el2, chosen.c2);

      const r1 = el1.ionicRadius![chosen.c1];
      const r2 = el2.ionicRadius![chosen.c2];
      const winSpecies = r1 > r2 ? s1 : s2;
      const loseSpecies = winSpecies === s1 ? s2 : s1;

      const winName = winSpecies.element.name.toLowerCase();
      const loseName = loseSpecies.element.name.toLowerCase();
      const winIonSymbol = getIonFormattedSymbol(winSpecies.element.symbol, winSpecies.charge);
      const loseIonSymbol = getIonFormattedSymbol(loseSpecies.element.symbol, loseSpecies.charge);

      explanation = `Down group ${el1.group}, each ion has an additional principal energy level. The ${winIonSymbol} ion (${winName}) has more occupied electron shells than the ${loseIonSymbol} ion (${loseName}), increasing shielding and distance from the nucleus (${Math.max(r1, r2)} pm vs ${Math.min(r1, r2)} pm).`;
    } else {
      // C: Atom vs Parent Ion (Cation is smaller, Anion is larger)
      const isCation = Math.random() < 0.5;
      if (isCation) {
        const catList = [
          { sym: 'Na', charge: 1 },
          { sym: 'Mg', charge: 2 },
          { sym: 'Al', charge: 3 },
          { sym: 'K', charge: 1 },
          { sym: 'Ca', charge: 2 },
        ];
        const chosen = pickRandom(catList);
        const el = ELEMENTS.find(e => e.symbol === chosen.sym)!;
        s1 = makeSpecies(el, 0); // Neutral atom
        s2 = makeSpecies(el, chosen.charge); // Cation
        const ionSym = getIonFormattedSymbol(el.symbol, chosen.charge);
        const elName = el.name.toLowerCase();
        title = `Which has the larger radius: an atom of ${elName} or its ${ionSym} cation?`;
        explanation = `Cations are always smaller than their parent neutral atoms. Forming ${ionSym} removes valence electrons (and an entire outer shell), reducing electron-electron repulsion and allowing the nucleus to pull remaining electrons tighter (${el.atomicRadius} pm vs ${el.ionicRadius![chosen.charge]} pm).`;
      } else {
        const aniList = [
          { sym: 'Cl', charge: -1 },
          { sym: 'F', charge: -1 },
          { sym: 'O', charge: -2 },
          { sym: 'S', charge: -2 },
        ];
        const chosen = pickRandom(aniList);
        const el = ELEMENTS.find(e => e.symbol === chosen.sym)!;
        s1 = makeSpecies(el, 0); // Neutral atom
        s2 = makeSpecies(el, chosen.charge); // Anion
        const ionSym = getIonFormattedSymbol(el.symbol, chosen.charge);
        const elName = el.name.toLowerCase();
        title = `Which has the larger radius: an atom of ${elName} or its ${ionSym} anion?`;
        explanation = `Anions are always larger than their parent neutral atoms. Adding electrons to form ${ionSym} increases electron-electron repulsion in the valence shell with no change in nuclear charge, causing the electron cloud to expand (${el.ionicRadius![chosen.charge]} pm vs ${el.atomicRadius} pm).`;
      }
    }

    const notes = ["SL", "Ionic Radius"];
    return {
      s1,
      s2,
      prop1: 'ionicRadius',
      prop2: 'ionicRadius',
      title,
      unit: "pm",
      isHL,
      isAnomaly: false,
      hasMultipleVariables,
      notes,
      hint: {
        title: "Ionic Radius",
        definition: "Ionic radius is the radius of a monatomic ion in an ionic crystal lattice.",
        keyFactors: [
          "Cations are SMALLER than parent atoms (lost valence shell, less electron repulsion).",
          "Anions are LARGER than parent atoms (added electrons increase electron-electron repulsion).",
          "Isoelectronic Series (same number of electrons): Higher proton number (Z) = stronger nuclear pull = smaller ion.",
          "Down a Group: Ionic radius increases as principal energy levels (shells) increase."
        ],
        // Updated wording per user request: series instead of group!
        clue: "Compare total electrons vs total protons. In an isoelectronic series, more protons mean a tighter, smaller ion!"
      },
      explanation
    };
  }

  // --- 3. ELECTRONEGATIVITY ---
  if (category === 'electronegativity') {
    const valid = ELEMENTS.filter(e => e.electronegativity !== undefined);
    let e1: ElementData, e2: ElementData;
    let hasMultipleVariables = false;

    if (!settings.allowMultipleVariables) {
      const samePeriod = Math.random() < 0.5;
      if (samePeriod) {
        const periodNum = Math.random() < 0.5 ? 2 : 3;
        const periodElements = valid.filter(e => e.period === periodNum);
        e1 = pickRandom(periodElements);
        const others = periodElements.filter(e => e.symbol !== e1.symbol);
        e2 = pickRandom(others);
      } else {
        const candidateGroups = [1, 2, 14, 15, 16, 17];
        const g = pickRandom(candidateGroups);
        const groupElements = valid.filter(e => e.group === g);
        e1 = groupElements[0];
        e2 = groupElements[Math.min(groupElements.length - 1, 1 + Math.floor(Math.random() * (groupElements.length - 1)))];
      }
    } else {
      e1 = pickRandom(valid);
      const others = valid.filter(e => e.symbol !== e1.symbol);
      e2 = pickRandom(others);
      if (e1.group !== e2.group && e1.period !== e2.period) hasMultipleVariables = true;
    }

    const s1 = makeSpecies(e1, 0);
    const s2 = makeSpecies(e2, 0);
    const notes = ["SL", "Electronegativity"];
    if (hasMultipleVariables) notes.push("Note: multiple variables changing - explanation might be tricky!");

    const winner = e1.electronegativity! > e2.electronegativity! ? e1 : e2;
    const loser = winner.symbol === e1.symbol ? e2 : e1;
    const winName = winner.name.toLowerCase();
    const loseName = loser.name.toLowerCase();

    let explanation = "";
    if (e1.period === e2.period) {
      explanation = `Across period ${e1.period}, nuclear charge increases and atomic radius decreases while shielding is constant. An atom of ${winName} (Z = ${winner.atomicNumber}) exerts a stronger electrostatic pull on shared electron pairs in a bond than an atom of ${loseName} (${winner.electronegativity} vs ${loser.electronegativity}).`;
    } else if (e1.group === e2.group) {
      explanation = `Down group ${e1.group}, atomic radius increases and inner-shell shielding increases, weakening the nucleus's attraction for shared electrons in a bond. Hence ${winName} (period ${winner.period}) has higher electronegativity than ${loseName} (period ${loser.period}) (${winner.electronegativity} vs ${loser.electronegativity}).`;
    } else {
      explanation = `An atom of ${winName} has a higher electronegativity (${winner.electronegativity}) than an atom of ${loseName} (${loser.electronegativity}). Fluorine (4.0) is the most electronegative element, and values generally increase toward the top-right of the periodic table.`;
    }

    return {
      s1,
      s2,
      prop1: 'electronegativity',
      prop2: 'electronegativity',
      title: "Which has the higher electronegativity?",
      unit: "Pauling",
      isHL: false,
      isAnomaly: false,
      hasMultipleVariables,
      notes,
      hint: {
        title: "Electronegativity",
        definition: "The relative attraction an atom has for the shared pair of electrons in a covalent bond (Pauling scale).",
        keyFactors: [
          "Increases across a period: Nuclear charge increases, atomic radius decreases, so shared bonding electrons are held more tightly.",
          "Decreases down a group: Additional electron shells increase distance and shielding between the nucleus and bonding electrons.",
          "Fluorine (4.0) has the highest electronegativity; noble gases are not assigned Pauling values because they don't form standard covalent bonds."
        ],
        clue: "Look toward the top-right of the periodic table (closest to fluorine) for the higher electronegativity."
      },
      explanation
    };
  }

  // --- 4. FIRST IE (SL Trends) ---
  if (category === 'firstIE') {
    let e1: ElementData, e2: ElementData;
    let hasMultipleVariables = false;

    const isAnomalyPair = (a: ElementData, b: ElementData) => {
      if (a.period !== b.period) return false;
      const sorted = [a.group, b.group].sort((x, y) => x - y);
      return (sorted[0] === 2 && sorted[1] === 13) || (sorted[0] === 15 && sorted[1] === 16);
    };

    if (!settings.allowMultipleVariables) {
      const samePeriod = Math.random() < 0.5;
      if (samePeriod) {
        const periodNum = Math.random() < 0.5 ? 2 : 3;
        const pool = ELEMENTS.filter(e => e.period === periodNum);
        let validPair = false;
        do {
          e1 = pickRandom(pool);
          e2 = pickRandom(pool.filter(e => e.symbol !== e1.symbol));
          validPair = !isAnomalyPair(e1, e2);
        } while (!validPair);
      } else {
        const candidateGroups = [1, 2, 17, 18];
        const g = pickRandom(candidateGroups);
        const groupElements = ELEMENTS.filter(e => e.group === g);
        e1 = groupElements[0];
        e2 = groupElements[1];
      }
    } else {
      do {
        e1 = pickRandom(ELEMENTS);
        e2 = pickRandom(ELEMENTS.filter(e => e.symbol !== e1.symbol));
      } while (isAnomalyPair(e1, e2));
      if (e1.group !== e2.group && e1.period !== e2.period) hasMultipleVariables = true;
    }

    const s1 = makeSpecies(e1, 0);
    const s2 = makeSpecies(e2, 0);
    const notes = ["SL", "1st IE"];
    if (hasMultipleVariables) notes.push("Note: multiple variables changing - explanation might be tricky!");

    const winner = e1.firstIE > e2.firstIE ? e1 : e2;
    const loser = winner.symbol === e1.symbol ? e2 : e1;
    const winName = winner.name.toLowerCase();
    const loseName = loser.name.toLowerCase();

    let explanation = "";
    if (e1.period === e2.period) {
      explanation = `Across period ${e1.period}, nuclear charge increases and atomic radius decreases while shielding is relatively constant. Outer electrons in an atom of ${winName} (Z = ${winner.atomicNumber}) experience a greater electrostatic pull, requiring more energy to remove (+${winner.firstIE} kJ/mol vs +${loser.firstIE} kJ/mol).`;
    } else if (e1.group === e2.group) {
      explanation = `Down group ${e1.group}, each element adds a principal energy level. Valence electrons in an atom of ${loseName} (period ${loser.period}) are farther from the nucleus and shielded by inner electron shells, making them easier to remove than in ${winName} (period ${winner.period}) (+${winner.firstIE} kJ/mol vs +${loser.firstIE} kJ/mol).`;
    } else {
      explanation = `An atom of ${winName} has a higher first ionization energy (+${winner.firstIE} kJ/mol) than an atom of ${loseName} (+${loser.firstIE} kJ/mol), dictated by effective nuclear charge and distance from the nucleus.`;
    }

    return {
      s1,
      s2,
      prop1: 'firstIE',
      prop2: 'firstIE',
      title: "Which has the higher first ionization energy?",
      unit: "kJ/mol",
      isHL: false,
      isAnomaly: false,
      hasMultipleVariables,
      notes,
      hint: {
        title: "First Ionization Energy",
        definition: "The minimum energy required to remove one mole of electrons from one mole of gaseous atoms in their ground state: X(g) → X⁺(g) + e⁻.",
        keyFactors: [
          "Increases across a period: Nuclear charge (Z) increases while shielding remains roughly constant; valence electrons are held more strongly.",
          "Decreases down a group: Extra shells increase distance from the nucleus and inner-shell shielding, lowering the energy needed to remove an electron.",
          "Check nuclear charge and occupied shells first!"
        ],
        clue: "Atoms that are smaller with higher nuclear charge hold their electrons tighter, leading to a higher ionization energy."
      },
      explanation
    };
  }

  // --- 5. FIRST IE ANOMALIES (HL Only) ---
  if (category === 'ieAnomalies') {
    const anomalyPairs = [
      { sym1: 'Be', sym2: 'B', type: 's-to-p', period: 2 },
      { sym1: 'Mg', sym2: 'Al', type: 's-to-p', period: 3 },
      { sym1: 'N', sym2: 'O', type: 'spin-pair', period: 2 },
      { sym1: 'P', sym2: 'S', type: 'spin-pair', period: 3 },
    ];
    const chosen = pickRandom(anomalyPairs);
    const el1 = ELEMENTS.find(e => e.symbol === chosen.sym1)!;
    const el2 = ELEMENTS.find(e => e.symbol === chosen.sym2)!;
    const s1 = makeSpecies(el1, 0);
    const s2 = makeSpecies(el2, 0);

    const winner = el1.firstIE > el2.firstIE ? el1 : el2;
    const loser = winner.symbol === el1.symbol ? el2 : el1;
    const winName = winner.name.toLowerCase();
    const loseName = loser.name.toLowerCase();

    let explanation = "";
    if (chosen.type === 's-to-p') {
      explanation = `Sub-shell anomaly (HL): Although an atom of ${loseName} (Z = ${loser.atomicNumber}) has more protons than an atom of ${winName} (Z = ${winner.atomicNumber}), ${loseName}'s outermost electron is in a p subshell (${chosen.period}p¹). The p subshell is higher in energy and partially shielded by the full ${chosen.period}s² subshell, making it easier to remove (+${winner.firstIE} kJ/mol for ${winName} vs +${loser.firstIE} kJ/mol for ${loseName}).`;
    } else {
      explanation = `Spin-pairing repulsion anomaly (HL): Both an atom of ${winName} and an atom of ${loseName} have electrons in the ${chosen.period}p subshell. The ${winName} atom has three unpaired p electrons (${chosen.period}p³), whereas ${loseName} has four (${chosen.period}p⁴) with one doubly occupied orbital. Mutual electrostatic repulsion between the two paired electrons in ${loseName} lowers the energy required to remove one (+${winner.firstIE} kJ/mol for ${winName} vs +${loser.firstIE} kJ/mol for ${loseName}).`;
    }

    return {
      s1,
      s2,
      prop1: 'firstIE',
      prop2: 'firstIE',
      title: "Which has the higher first ionization energy?",
      unit: "kJ/mol",
      isHL: true,
      isAnomaly: true,
      hasMultipleVariables: false,
      notes: ["HL", "1st IE Anomaly", "Alert! Potential sub-shell anomaly!"],
      hint: {
        title: "Sub-Shell & Spin-Pairing Anomalies (HL)",
        definition: "Ionization energy generally increases across a period, but two key quantum exceptions occur in the IB syllabus:",
        keyFactors: [
          "Group 2 to Group 13 (s-to-p anomaly): Removing an electron from a p subshell (e.g., B 2p¹, Al 3p¹) requires LESS energy than from a full s subshell (Be 2s², Mg 3s²) because the p orbital is at a higher energy level and shielded by the s electrons.",
          "Group 15 to Group 16 (spin-pairing anomaly): Group 16 elements (O, S) have four p electrons (p⁴), meaning two electrons share an orbital. Electron-electron spin repulsion in that doubly occupied orbital makes removing one electron easier than from Group 15's stable half-filled p³ configuration."
        ],
        clue: "Watch out! This pair is a periodic anomaly. Does an electron come from a higher-energy p subshell, or does it experience spin-pair repulsion?"
      },
      explanation
    };
  }

  // --- 6. SUCCESSIVE IE (HL Only) ---
  if (category === 'successiveIE') {
    const isIntra = Math.random() < 0.45;
    const elementsWith2ndIE = ELEMENTS.filter(e => e.secondIE !== undefined);

    if (isIntra) {
      const el = pickRandom(elementsWith2ndIE);
      const s1 = makeSpecies(el, 0);
      const s2 = makeSpecies(el, 0);
      const elName = el.name.toLowerCase();
      const title = `Which ionization energy is higher for an atom of ${elName}?`;
      const explanation = `Successive ionization energies for any element always INCREASE (2nd IE > 1st IE). Removing the second electron from a positive 1+ ion involves pulling against a greater effective nuclear charge with reduced electron-electron repulsion. For an atom of ${elName}, 2nd IE is +${el.secondIE} kJ/mol compared to 1st IE of +${el.firstIE} kJ/mol.`;

      return {
        s1,
        s2,
        prop1: 'firstIE',
        prop2: 'secondIE',
        title,
        unit: "kJ/mol",
        isHL: true,
        isAnomaly: false,
        hasMultipleVariables: false,
        notes: ["HL", "Successive IEs"],
        hint: {
          title: "Successive Ionization Energies (HL)",
          definition: "1st IE removes an electron from a neutral atom (X → X⁺ + e⁻). 2nd IE removes an electron from a 1+ gaseous ion (X⁺ → X²⁺ + e⁻).",
          keyFactors: [
            "2nd IE is ALWAYS higher than 1st IE for the same element.",
            "In a 1+ ion, there are fewer electrons for the same nuclear charge (Z), so the remaining electrons feel a stronger effective nuclear pull and less electron-electron shielding.",
            "If the 2nd electron must be removed from an inner noble gas shell (e.g. in group 1 metals), the energy jump is enormous!"
          ],
          clue: "Is it harder to remove an electron from a neutral atom or from an already positive ion?"
        },
        explanation
      };
    } else {
      let el1: ElementData, el2: ElementData;
      let hasMultipleVariables = false;

      if (!settings.allowMultipleVariables) {
        const samePeriod = Math.random() < 0.5;
        if (samePeriod) {
          const periods = [2, 3];
          const p = pickRandom(periods);
          const pool = elementsWith2ndIE.filter(e => e.period === p);
          el1 = pickRandom(pool);
          el2 = pickRandom(pool.filter(e => e.symbol !== el1.symbol));
        } else {
          const candidateGroups = [1, 2, 17, 18];
          const g = pickRandom(candidateGroups);
          const pool = elementsWith2ndIE.filter(e => e.group === g);
          el1 = pool[0];
          el2 = pool[1];
        }
      } else {
        el1 = pickRandom(elementsWith2ndIE);
        const others = elementsWith2ndIE.filter(e => e.symbol !== el1.symbol);
        el2 = pickRandom(others);
        if (el1.period !== el2.period && el1.group !== el2.group) {
          hasMultipleVariables = true;
        }
      }

      const s1 = makeSpecies(el1, 1); // 1+ ion
      const s2 = makeSpecies(el2, 1);
      const title = "Which has the higher second ionization energy?";

      const winner = el1.secondIE! > el2.secondIE! ? el1 : el2;
      const loser = winner.symbol === el1.symbol ? el2 : el1;
      const winIonSym = getIonFormattedSymbol(winner.symbol, 1);
      const loseIonSym = getIonFormattedSymbol(loser.symbol, 1);
      const winName = winner.name.toLowerCase();
      const loseName = loser.name.toLowerCase();

      const notes = ["HL", "Second IE"];
      if (hasMultipleVariables) notes.push("Note: multiple variables changing - explanation might be tricky!");

      const explanation = `Second ionization energy involves removing an electron from the 1+ gaseous ion (X⁺ → X²⁺ + e⁻). For ${winName}, its 1+ ion (${winIonSym}) has a 2nd IE of +${winner.secondIE} kJ/mol vs ${loseName}'s (${loseIonSym}) +${loser.secondIE} kJ/mol. If an element is in group 1 (like lithium, sodium, potassium), removing the 2nd electron breaks into an inner, complete noble-gas shell closer to the nucleus, causing an immense energy spike!`;

      return {
        s1,
        s2,
        prop1: 'secondIE',
        prop2: 'secondIE',
        title,
        unit: "kJ/mol",
        isHL: true,
        isAnomaly: false,
        hasMultipleVariables,
        notes,
        hint: {
          title: "Second Ionization Energy (HL)",
          definition: "The minimum energy required for one mole of electrons to be removed from a mole of gaseous 1+ ions in the ground state: X⁺(g) → X²⁺(g) + e⁻.",
          keyFactors: [
            "Consider the electron configuration of the 1+ ion!",
            "Look for which species has its outermost electron in a shell closer to the nucleus.",
            "Group 1 elements (lithium, sodium, potassium) lose their single valence electron in the 1st IE; their 2nd electron must come from an inner, tightly bound noble-gas core, leading to an extremely high 2nd IE!"
          ],
          clue: "Think about what the 1+ ion looks like: does removing the second electron require breaking into a full inner shell?"
        },
        explanation
      };
    }
  }

  // --- 7. FIRST EA (SL) ---
  if (category === 'firstEA') {
    let e1: ElementData, e2: ElementData;
    let hasMultipleVariables = false;

    if (!settings.allowMultipleVariables) {
      const samePeriod = Math.random() < 0.5;
      if (samePeriod) {
        const periodNum = Math.random() < 0.5 ? 2 : 3;
        const pool = ELEMENTS.filter(e => e.period === periodNum);
        e1 = pickRandom(pool);
        e2 = pickRandom(pool.filter(e => e.symbol !== e1.symbol));
      } else {
        const candidateGroups = [1, 2, 16, 17];
        const g = pickRandom(candidateGroups);
        const groupElements = ELEMENTS.filter(e => e.group === g);
        e1 = groupElements[0];
        e2 = groupElements[1];
      }
    } else {
      e1 = pickRandom(ELEMENTS);
      const others = ELEMENTS.filter(e => e.symbol !== e1.symbol);
      e2 = pickRandom(others);
      if (e1.period !== e2.period && e1.group !== e2.group) {
        hasMultipleVariables = true;
      }
    }

    const s1 = makeSpecies(e1, 0);
    const s2 = makeSpecies(e2, 0);

    const title = "Which has the more negative (more exothermic) first electron affinity?";
    const winner = e1.firstEA < e2.firstEA ? e1 : e2;
    const loser = winner.symbol === e1.symbol ? e2 : e1;
    const winName = winner.name.toLowerCase();
    const loseName = loser.name.toLowerCase();

    let explanation = "";
    if (e1.period === e2.period) {
      explanation = `Across period ${e1.period}, nuclear charge increases and atomic radius decreases while shielding is relatively constant. An atom of ${winName} attracts an incoming electron into its valence shell more strongly than an atom of ${loseName}, giving it a more exothermic (more negative) 1st EA (${winner.firstEA} kJ/mol vs ${loser.firstEA > 0 ? '+' : ''}${loser.firstEA} kJ/mol).`;
    } else if (e1.group === e2.group) {
      explanation = `Down group ${e1.group}, atomic radius increases and outer electrons are farther from the nucleus with greater shielding. An atom of ${winName} (period ${winner.period}) has a more exothermic 1st EA than an atom of ${loseName} (period ${loser.period}) (${winner.firstEA} kJ/mol vs ${loser.firstEA > 0 ? '+' : ''}${loser.firstEA} kJ/mol).`;
    } else {
      explanation = `First electron affinity is the enthalpy change when one mole of electrons is added to one mole of gaseous atoms: X(g) + e⁻ → X⁻(g). Negative values mean energy is released (exothermic). An atom of ${winName} has a more exothermic 1st EA (${winner.firstEA} kJ/mol vs ${loseName}'s ${loser.firstEA > 0 ? '+' : ''}${loser.firstEA} kJ/mol) because incoming electrons experience a stronger net attraction to its nucleus, especially for halogens that complete a full octet.`;
    }

    const notes = ["SL", "1st EA"];
    if (hasMultipleVariables) notes.push("Note: multiple variables changing - explanation might be tricky!");

    return {
      s1,
      s2,
      prop1: 'firstEA',
      prop2: 'firstEA',
      title,
      unit: "kJ/mol",
      isHL: false,
      isAnomaly: false,
      hasMultipleVariables,
      notes,
      hint: {
        title: "First Electron Affinity",
        definition: "The enthalpy change when one mole of electrons is added to one mole of gaseous atoms in their ground state: X(g) + e⁻ → X⁻(g).",
        keyFactors: [
          "Exothermic vs Endothermic: A negative value (ΔH < 0) means energy is released (attraction between nucleus and added electron).",
          "Halogens have the most exothermic (most negative) 1st EAs because adding an electron creates a stable noble gas configuration (ns² np⁶).",
          "Noble gases and group 2 elements have positive (endothermic) EAs because the added electron must enter an empty, higher energy subshell."
        ],
        clue: "More negative = more exothermic (more energy released). Look for non-metals close to a full octet!"
      },
      explanation
    };
  }

  // --- 8. SECOND EA (HL Only) ---
  const subRoll = Math.random();
  const o = ELEMENTS.find(e => e.symbol === 'O')!;
  const s = ELEMENTS.find(e => e.symbol === 'S')!;

  if (subRoll < 0.4) {
    const s1 = makeSpecies(o, 0);
    const s2 = makeSpecies(o, -1);
    return {
      s1,
      s2,
      prop1: 'firstEA',
      prop2: 'secondEA',
      title: "Which electron affinity is more negative (more exothermic) for oxygen?",
      unit: "kJ/mol",
      isHL: true,
      isAnomaly: false,
      hasMultipleVariables: false,
      notes: ["HL", "Second EA"],
      hint: {
        title: "First vs Second Electron Affinity (HL)",
        definition: "1st EA: O(g) + e⁻ → O⁻(g). 2nd EA: O⁻(g) + e⁻ → O²⁻(g).",
        keyFactors: [
          "1st EA is exothermic (-141 kJ/mol) because the neutral atom's nucleus attracts the incoming electron.",
          "2nd EA is ALWAYS ENDOTHERMIC (+753 kJ/mol) because an incoming electron is being forced onto an already negatively charged ion (O⁻). Electrostatic repulsion must be overcome!"
        ],
        clue: "Is it energetically favorable to add an electron to a negative ion?"
      },
      explanation: `Oxygen's 1st EA is exothermic (-141 kJ/mol) because the neutral atom attracts the incoming electron into its 2p subshell. However, oxygen's 2nd EA is strongly ENDOTHERMIC (+753 kJ/mol) because energy must be supplied to overcome the electrostatic repulsion between the negative O⁻ ion and the incoming negative electron.`
    };
  } else if (subRoll < 0.7) {
    const s1 = makeSpecies(s, 0);
    const s2 = makeSpecies(s, -1);
    return {
      s1,
      s2,
      prop1: 'firstEA',
      prop2: 'secondEA',
      title: "Which electron affinity is more negative (more exothermic) for sulfur?",
      unit: "kJ/mol",
      isHL: true,
      isAnomaly: false,
      hasMultipleVariables: false,
      notes: ["HL", "Second EA"],
      hint: {
        title: "First vs Second Electron Affinity (HL)",
        definition: "1st EA: S(g) + e⁻ → S⁻(g). 2nd EA: S⁻(g) + e⁻ → S²⁻(g).",
        keyFactors: [
          "1st EA is exothermic (-200 kJ/mol).",
          "2nd EA is always positive/endothermic (+545 kJ/mol) due to electron-electron repulsion with the S⁻ ion."
        ],
        clue: "Adding an electron to an already negative ion is always endothermic (positive)."
      },
      explanation: `Sulfur's 1st EA is exothermic (-200 kJ/mol), but its 2nd EA is endothermic (+545 kJ/mol) because work must be done against electrostatic repulsion to add a second electron to an already negative S⁻ ion.`
    };
  } else {
    const s1 = makeSpecies(o, -1);
    const s2 = makeSpecies(s, -1);
    return {
      s1,
      s2,
      prop1: 'secondEA',
      prop2: 'secondEA',
      title: "Which has the more negative (more exothermic) second electron affinity: oxygen or sulfur?",
      unit: "kJ/mol",
      isHL: true,
      isAnomaly: false,
      hasMultipleVariables: false,
      notes: ["HL", "Second EA"],
      hint: {
        title: "Comparing Second Electron Affinities (HL)",
        definition: "2nd EA adds an electron to a 1- ion: X⁻(g) + e⁻ → X²⁻(g). Both values are endothermic (positive).",
        keyFactors: [
          "Both 2nd EAs are positive because of ion-electron repulsion.",
          "Oxygen (period 2) is much smaller with a higher electron charge density in its 2p subshell, creating more intense repulsion (+753 kJ/mol).",
          "Sulfur (period 3) is larger with a more diffuse 3p subshell, so repulsion is less severe (+545 kJ/mol)."
        ],
        clue: "A smaller ion has higher charge density and thus greater electron repulsion, requiring more energy (more positive) to add another electron."
      },
      explanation: `Both 2nd EAs are endothermic (positive). However, sulfur's 2nd EA (+545 kJ/mol) is LESS positive (closer to negative / less endothermic) than oxygen's (+753 kJ/mol). Oxygen's compact 2p subshell has a much higher electron charge density, creating fierce electrostatic repulsion against the incoming electron.`
    };
  }
}
