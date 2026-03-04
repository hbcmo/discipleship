import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting curriculum seed...');

  // Phase 1: Gospel Foundation
  const phase1 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 1 },
    update: {},
    create: {
      phaseNumber: 1,
      phaseName: 'Gospel Foundation',
      description: 'Understand the Gospel message, confirm personal salvation, begin relationship with Christ',
      durationWeeks: 4,
      targetAudience: 'all',
      orderInSequence: 1,
      objectives: JSON.stringify([
        'Understand the Gospel message',
        'Confirm personal salvation experience',
        'Begin personal relationship with Christ'
      ]),
      doctrinalFocus: 'BFM 2000: Section IV (Salvation); 2LC: Chapter 8 & 11; HBC: Points 5-7',
      requirements: JSON.stringify([
        'Articulate the Gospel in simple terms',
        'Share personal testimony',
        'Commit to Phase 2'
      ])
    }
  });

  // Phase 2: Biblical Foundations
  const phase2 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 2 },
    update: {},
    create: {
      phaseNumber: 2,
      phaseName: 'Biblical Foundations',
      description: 'Understand biblical authority, develop Bible study skills, establish spiritual disciplines',
      durationWeeks: 5,
      targetAudience: 'all',
      orderInSequence: 2,
      objectives: JSON.stringify([
        'Understand biblical authority and canon',
        'Develop Bible study skills',
        'Establish spiritual disciplines'
      ]),
      doctrinalFocus: 'BFM 2000: Section I; 2LC: Chapter 1; HBC: Point 1',
      requirements: JSON.stringify([
        'Demonstrate basic Bible study skills',
        'Share one spiritual insight from personal study',
        'Establish daily Bible reading habit',
        'Commit to Phase 3'
      ])
    }
  });

  // Phase 3: Discipleship Basics & The Church
  const phase3 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 3 },
    update: {},
    create: {
      phaseNumber: 3,
      phaseName: 'Discipleship Basics & The Church',
      description: 'Understand church nature and membership, develop community engagement, embrace covenantal responsibilities',
      durationWeeks: 5,
      targetAudience: 'all',
      orderInSequence: 3,
      objectives: JSON.stringify([
        'Understand church nature, mission, and membership',
        'Develop community engagement',
        'Embrace covenantal responsibilities'
      ]),
      doctrinalFocus: 'BFM 2000: Section VI; 2LC: Chapter 26 & 29; HBC: Entire document',
      requirements: JSON.stringify([
        'Articulate understanding of church membership',
        'Sign HBC Membership Covenant',
        'Join a small group or ministry',
        'Commit to Phase 4'
      ])
    }
  });

  // Phase 4: Sanctification & Holiness
  const phase4 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 4 },
    update: {},
    create: {
      phaseNumber: 4,
      phaseName: 'Sanctification & Holiness',
      description: 'Understand sanctification as progressive transformation, identify areas of personal growth, embrace covenant obligations',
      durationWeeks: 6,
      targetAudience: 'all',
      orderInSequence: 4,
      objectives: JSON.stringify([
        'Understand sanctification as progressive transformation',
        'Identify areas of personal holiness development',
        'Embrace covenant obligations regarding godly living'
      ]),
      doctrinalFocus: 'BFM 2000: Section IV.C; 2LC: Chapter 13; HBC: Obligations sections 6 & 8',
      requirements: JSON.stringify([
        'Articulate biblical understanding of sanctification',
        'Share one area of growth',
        'Join accountability relationships',
        'Commit to Phase 5'
      ])
    }
  });

  // Phase 5: Spiritual Leadership Essentials
  const phase5 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 5 },
    update: {},
    create: {
      phaseNumber: 5,
      phaseName: 'Spiritual Leadership Essentials',
      description: 'Understand biblical leadership model, develop servant leadership mentality, prepare for small group or ministry leadership',
      durationWeeks: 6,
      targetAudience: 'leaders',
      orderInSequence: 5,
      objectives: JSON.stringify([
        'Understand biblical leadership model',
        'Develop servant leadership mentality',
        'Prepare for small group or ministry leadership'
      ]),
      doctrinalFocus: 'BFM 2000: Section VI; 2LC: Chapter 26; HBC: Elder obligations',
      requirements: JSON.stringify([
        'Demonstrate servant leadership heart',
        'Show character growth in assessed areas',
        'Present mentoring plan',
        'Be recognized in a ministry role',
        'Commit to Phase 6'
      ])
    }
  });

  // Phase 6: Doctrinal Depth & Christian Thinking
  const phase6 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 6 },
    update: {},
    create: {
      phaseNumber: 6,
      phaseName: 'Doctrinal Depth & Christian Thinking',
      description: 'Understand Baptist theological heritage, develop doctrinal discernment, think biblically about contemporary issues',
      durationWeeks: 8,
      targetAudience: 'leaders',
      orderInSequence: 6,
      objectives: JSON.stringify([
        'Understand Baptist theological heritage',
        'Develop doctrinal discernment',
        'Think biblically about contemporary issues'
      ]),
      doctrinalFocus: 'BFM 2000: All 18 articles; 2LC: All chapters; HBC: Doctrinal statement',
      requirements: JSON.stringify([
        'Complete systematic theology survey',
        'Articulate personal doctrinal convictions',
        'Demonstrate biblical thinking on cultural issues',
        'Ready for Phase 6.5 or 7'
      ])
    }
  });

  // Phase 6.5a: Women\'s Ministry Track
  const phase6_5a = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 100 },
    update: {},
    create: {
      phaseNumber: 100,
      phaseName: 'Christian Womanhood & Mentorship (Track 6.5)',
      description: 'Understand biblical womanhood, develop mentoring skills for women, prepare for women\'s ministry leadership',
      durationWeeks: 8,
      targetAudience: 'women',
      orderInSequence: 65, // After phase 6, before phase 7
      objectives: JSON.stringify([
        'Understand biblical womanhood',
        'Develop mentoring and discipleship skills for women',
        'Prepare for women\'s ministry leadership roles'
      ]),
      doctrinalFocus: 'BFM 2000: Sections II & XVIII; 2LC: Chapter 21; HBC: Women\'s roles',
      requirements: JSON.stringify([
        'Articulate biblical vision for Christian womanhood',
        'Demonstrate mentoring skills',
        'Lead women\'s ministry initiative',
        'Ready for Phase 7'
      ])
    }
  });

  // Phase 6.5b: Men\'s Ministry Track
  const phase6_5b = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 101 },
    update: {},
    create: {
      phaseNumber: 101,
      phaseName: 'Biblical Manhood & Leadership (Track 6.5)',
      description: 'Understand biblical manhood, develop discipleship skills for men, prepare for men\'s ministry or deacon roles',
      durationWeeks: 8,
      targetAudience: 'men',
      orderInSequence: 66, // After phase 6, before phase 7
      objectives: JSON.stringify([
        'Understand biblical manhood',
        'Develop discipleship and mentoring skills for men',
        'Prepare for men\'s ministry leadership or deacon roles'
      ]),
      doctrinalFocus: 'BFM 2000: Sections II, VI, XVIII; 2LC: Chapter 26; HBC: Leadership',
      requirements: JSON.stringify([
        'Articulate biblical vision for Christian manhood',
        'Demonstrate discipleship skills',
        'Show growth in leadership qualifications',
        'Ready for Phase 7'
      ])
    }
  });

  // Phase 7: Formal Ministry Leadership
  const phase7 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 7 },
    update: {},
    create: {
      phaseNumber: 7,
      phaseName: 'Formal Ministry Leadership',
      description: 'Formally recognized leadership roles - small group leaders, women\'s ministry leaders, men\'s ministry leaders',
      durationWeeks: 52, // Ongoing
      targetAudience: 'leaders',
      orderInSequence: 7,
      objectives: JSON.stringify([
        'Lead small groups or Bible studies',
        'Mentor and disciple individuals',
        'Execute ministry initiatives',
        'Provide pastoral care'
      ]),
      doctrinalFocus: 'Continued growth in doctrinal understanding and application',
      requirements: JSON.stringify([
        'Active ministry leadership role',
        'Quarterly training participation',
        'Ongoing theological development',
        'Accountability with senior leadership'
      ])
    }
  });

  // Phase 8: Church Office - Deacon
  const phase8 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 8 },
    update: {},
    create: {
      phaseNumber: 8,
      phaseName: 'Church Office - Deacon',
      description: 'Deacon office with servant leadership, benevolence, and support responsibilities',
      durationWeeks: 52,
      targetAudience: 'men',
      orderInSequence: 8,
      objectives: JSON.stringify([
        'Servant leadership to the church',
        'Benevolence and mercy ministry',
        'Support pastoral staff',
        'Participate in church governance'
      ]),
      doctrinalFocus: '1 Timothy 3:8-13; Acts 6; Church governance',
      requirements: JSON.stringify([
        'Completion of Phase 6',
        '1 Timothy 3:8-13 qualifications',
        'Church leadership recommendation',
        'Church member vote',
        'Public commissioning'
      ])
    }
  });

  // Phase 9: Church Office - Elder/Pastoral Leadership
  const phase9 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 9 },
    update: {},
    create: {
      phaseNumber: 9,
      phaseName: 'Church Office - Elder/Pastoral Leadership',
      description: 'Elder office with shepherding, teaching, vision casting, and theological leadership',
      durationWeeks: 52,
      targetAudience: 'men',
      orderInSequence: 9,
      objectives: JSON.stringify([
        'Primary shepherding and teaching',
        'Vision casting and leadership',
        'Theological discernment',
        'Ordination to gospel ministry'
      ]),
      doctrinalFocus: 'Titus 1:5-9; 1 Timothy 3:1-7; 1 Peter 5:1-4',
      requirements: JSON.stringify([
        'Completion of all prior phases',
        'Titus 1:5-9 qualifications over extended period',
        'Clear teaching giftedness',
        'Church leadership affirmation',
        'Public ordination'
      ])
    }
  });

  // Phase 10: Leadership Multiplication & Succession
  const phase10 = await prisma.curriculumPhase.upsert({
    where: { phaseNumber: 10 },
    update: {},
    create: {
      phaseNumber: 10,
      phaseName: 'Leadership Multiplication & Succession Planning',
      description: 'Senior leadership identifying and developing next generation, building leadership pipeline',
      durationWeeks: 52,
      targetAudience: 'leaders',
      orderInSequence: 10,
      objectives: JSON.stringify([
        'Identify and invest in next generation leaders',
        'Build leadership pipeline',
        'Create systems for multiplication',
        'Train the trainers'
      ]),
      doctrinalFocus: '2 Timothy 2:2; Titus 1-2; Church leadership sustainability',
      requirements: JSON.stringify([
        'Formal mentoring of emerging leaders',
        'Leadership coaching and development',
        'Vision and strategy development',
        'Theological leadership of church'
      ])
    }
  });

  console.log('✅ Curriculum phases created successfully!');
  console.log('📊 Summary:');
  console.log('  - Phase 1-6: All believers progressing through foundational to advanced training');
  console.log('  - Phase 6.5: Gender-specific tracks (Women\'s or Men\'s ministry)');
  console.log('  - Phase 7-10: Formal leadership roles and advancement');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
