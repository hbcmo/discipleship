import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Scoring rubric: determines phase placement based on total score
const PHASE_PLACEMENT_RUBRIC = [
  { minScore: 0, maxScore: 6, phase: 1 },      // 0-6 points: Start at Phase 1
  { minScore: 7, maxScore: 12, phase: 2 },     // 7-12 points: Start at Phase 2
  { minScore: 13, maxScore: 18, phase: 3 },    // 13-18 points: Start at Phase 3
  { minScore: 19, maxScore: 24, phase: 4 },    // 19-24 points: Start at Phase 4
  { minScore: 25, maxScore: 30, phase: 5 },    // 25-30 points: Start at Phase 5
  { minScore: 31, maxScore: 48, phase: 6 },    // 31-48 points: Start at Phase 6 (foundational)
];

export async function POST(request: Request) {
  try {
    // Get user ID from cookies directly
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: No session found' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'disciplee') {
      return NextResponse.json(
        { error: 'Only disciplees can take assessments' },
        { status: 403 }
      );
    }

    // Parse answers from request
    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // Calculate total score
    let totalScore = 0;
    Object.values(answers).forEach((value: any) => {
      if (typeof value === 'number') {
        totalScore += value;
      }
    });

    // Calculate percentage
    const maxPossibleScore = 72; // 24 questions × 3 points per correct answer
    const scorePercentage = Math.round((totalScore / maxPossibleScore) * 100);

    // Determine recommended phase using rubric
    // Scale: 0-72 points mapped to 0-48 scale for phase placement
    const scaledScore = Math.round((totalScore / 72) * 48);
    let recommendedPhase = 1;
    for (const rubric of PHASE_PLACEMENT_RUBRIC) {
      if (scaledScore >= rubric.minScore && scaledScore <= rubric.maxScore) {
        recommendedPhase = rubric.phase;
        break;
      }
    }

    return NextResponse.json(
      {
        score: totalScore,
        scorePercentage: Math.min(100, scorePercentage),
        recommendedPhase,
        message: `Assessment recommendation: Phase ${recommendedPhase}. Final placement is made by your discipler/admin.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Assessment evaluation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error:', error);
    return NextResponse.json(
      { error: `Failed to evaluate assessment: ${errorMessage}` },
      { status: 500 }
    );
  }
}
