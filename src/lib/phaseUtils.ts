// Phase progression utilities and constants

export const PHASE_INFO = {
  1: { name: 'Gospel Foundation', color: 'bg-blue-100', textColor: 'text-blue-900', duration: 4 },
  2: { name: 'Biblical Foundations', color: 'bg-indigo-100', textColor: 'text-indigo-900', duration: 5 },
  3: { name: 'Discipleship Basics & The Church', color: 'bg-purple-100', textColor: 'text-purple-900', duration: 5 },
  4: { name: 'Sanctification & Holiness', color: 'bg-pink-100', textColor: 'text-pink-900', duration: 6 },
  5: { name: 'Spiritual Leadership Essentials', color: 'bg-rose-100', textColor: 'text-rose-900', duration: 6 },
  6: { name: 'Doctrinal Depth & Christian Thinking', color: 'bg-red-100', textColor: 'text-red-900', duration: 8 },
  100: { name: 'Christian Womanhood & Mentorship', color: 'bg-cyan-100', textColor: 'text-cyan-900', duration: 8 },
  101: { name: 'Biblical Manhood & Leadership', color: 'bg-teal-100', textColor: 'text-teal-900', duration: 8 },
  7: { name: 'Formal Ministry Leadership', color: 'bg-emerald-100', textColor: 'text-emerald-900', duration: 52 },
  8: { name: 'Church Office - Deacon', color: 'bg-green-100', textColor: 'text-green-900', duration: 52 },
  9: { name: 'Church Office - Elder/Pastoral Leadership', color: 'bg-lime-100', textColor: 'text-lime-900', duration: 52 },
  10: { name: 'Leadership Multiplication & Succession', color: 'bg-yellow-100', textColor: 'text-yellow-900', duration: 52 },
};

export const PHASE_SEQUENCE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const GENDER_SPECIFIC_TRACKS = {
  women: [1, 2, 3, 4, 5, 6, 100, 7, 8, 9, 10],
  men: [1, 2, 3, 4, 5, 6, 101, 7, 8, 9, 10],
};

export function getPhaseInfo(phaseNumber: number) {
  return PHASE_INFO[phaseNumber as keyof typeof PHASE_INFO] || {
    name: 'Unknown Phase',
    color: 'bg-gray-100',
    textColor: 'text-gray-900',
    duration: 0,
  };
}

export function getProgressPercentage(currentPhase: number, completedPhases: number[]): number {
  if (currentPhase === 0) return 0;
  const phaseWeight = 100 / PHASE_SEQUENCE.length;
  const completedWeight = completedPhases.length * phaseWeight;
  const currentWeight = (currentPhase - 1) * phaseWeight;
  return Math.min(Math.round(completedWeight + currentWeight / 2), 100);
}

export function getNextPhaseNumber(currentPhase: number, track?: 'men' | 'women'): number | null {
  const sequence = track ? GENDER_SPECIFIC_TRACKS[track] : PHASE_SEQUENCE;
  const currentIndex = sequence.indexOf(currentPhase);
  if (currentIndex === -1 || currentIndex === sequence.length - 1) return null;
  return sequence[currentIndex + 1];
}

export function getPreviousPhaseNumber(currentPhase: number, track?: 'men' | 'women'): number | null {
  const sequence = track ? GENDER_SPECIFIC_TRACKS[track] : PHASE_SEQUENCE;
  const currentIndex = sequence.indexOf(currentPhase);
  if (currentIndex <= 0) return null;
  return sequence[currentIndex - 1];
}

export function getPhasePosition(phaseNumber: number, track?: 'men' | 'women'): { current: number; total: number } {
  const sequence = track ? GENDER_SPECIFIC_TRACKS[track] : PHASE_SEQUENCE;
  const index = sequence.indexOf(phaseNumber);
  return {
    current: index === -1 ? 0 : index + 1,
    total: sequence.length,
  };
}

export function isPhaseAccessible(phaseNumber: number, completedPhases: number[], currentPhase: number): boolean {
  // Continuous growth model: all phases can be revisited at any time.
  return true;
}

export function shouldShowGenderTrack(gender?: string | null): 'men' | 'women' | null {
  if (gender === 'male') return 'men';
  if (gender === 'female') return 'women';
  return null;
}
