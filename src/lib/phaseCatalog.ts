export interface PhaseDefinition {
  number: number;
  name: string;
  description: string;
  audience: 'all' | 'leaders' | 'men' | 'women';
}

export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    number: 1,
    name: 'Gospel Foundation',
    description: 'Build confidence in the Gospel, assurance of salvation, and a daily walk with Christ.',
    audience: 'all',
  },
  {
    number: 2,
    name: 'Biblical Foundations',
    description: 'Learn how to read Scripture faithfully and establish spiritual disciplines.',
    audience: 'all',
  },
  {
    number: 3,
    name: 'Discipleship Basics & The Church',
    description: 'Grow in church membership, covenant life, and discipleship in community.',
    audience: 'all',
  },
  {
    number: 4,
    name: 'Sanctification & Holiness',
    description: 'Pursue transformation, holiness, and practical obedience in daily life.',
    audience: 'all',
  },
  {
    number: 5,
    name: 'Spiritual Leadership Essentials',
    description: 'Develop servant-leadership character and readiness to guide others.',
    audience: 'leaders',
  },
  {
    number: 6,
    name: 'Doctrinal Depth & Christian Thinking',
    description: 'Strengthen theological discernment and biblical engagement with culture.',
    audience: 'leaders',
  },
  {
    number: 100,
    name: 'Christian Womanhood & Mentorship (Track 6.5)',
    description: 'Women-specific mentoring, discipleship, and ministry development.',
    audience: 'women',
  },
  {
    number: 101,
    name: 'Biblical Manhood & Leadership (Track 6.5)',
    description: 'Men-specific formation, mentoring, and leadership preparation.',
    audience: 'men',
  },
  {
    number: 7,
    name: 'Formal Ministry Leadership',
    description: 'Serve in formal ministry leadership with accountability and multiplication.',
    audience: 'leaders',
  },
  {
    number: 8,
    name: 'Church Office - Deacon',
    description: 'Develop deacon-level servant leadership in church care and governance.',
    audience: 'men',
  },
  {
    number: 9,
    name: 'Church Office - Elder/Pastoral Leadership',
    description: 'Shepherding, doctrinal oversight, and pastoral leadership development.',
    audience: 'men',
  },
  {
    number: 10,
    name: 'Leadership Multiplication & Succession',
    description: 'Multiply leaders and build long-term ministry sustainability.',
    audience: 'leaders',
  },
];

export const DISCIPLER_MAX_PLACEABLE_PHASE = 6;

export function getAllowedPhaseNumbersForRole(role: string): number[] {
  if (role === 'admin') {
    return PHASE_DEFINITIONS.map((p) => p.number);
  }

  return PHASE_DEFINITIONS.filter((p) => p.number <= DISCIPLER_MAX_PLACEABLE_PHASE).map((p) => p.number);
}

export function getPhaseDefinition(phaseNumber: number) {
  return PHASE_DEFINITIONS.find((p) => p.number === phaseNumber) || null;
}
