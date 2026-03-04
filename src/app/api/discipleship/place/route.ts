import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getAllowedPhaseNumbersForRole, getPhaseDefinition, PHASE_DEFINITIONS } from '@/lib/phaseCatalog';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      currentPhase: true,
    },
  });
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (currentUser.role !== 'discipler' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allowedPhases = getAllowedPhaseNumbersForRole(currentUser.role);

    return NextResponse.json({
      phases: PHASE_DEFINITIONS,
      allowedPhases,
      canPlaceBeyondSix: currentUser.role === 'admin',
    });
  } catch (error) {
    console.error('Placement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (currentUser.role !== 'discipler' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { discipleeId, phaseNumber } = await req.json();

    if (!discipleeId || typeof phaseNumber !== 'number') {
      return NextResponse.json({ error: 'discipleeId and numeric phaseNumber are required' }, { status: 400 });
    }

    const phase = getPhaseDefinition(phaseNumber);
    if (!phase) {
      return NextResponse.json({ error: 'Invalid phase number' }, { status: 400 });
    }

    const allowedPhases = getAllowedPhaseNumbersForRole(currentUser.role);
    if (!allowedPhases.includes(phaseNumber)) {
      return NextResponse.json({ error: 'You are not allowed to place into this phase' }, { status: 403 });
    }

    const disciplee = await prisma.user.findUnique({
      where: { id: discipleeId },
      select: {
        id: true,
        role: true,
        disciplerId: true,
      },
    });

    if (!disciplee || disciplee.role !== 'disciplee') {
      return NextResponse.json({ error: 'Target user must be a disciplee' }, { status: 400 });
    }

    if (currentUser.role === 'discipler' && disciplee.disciplerId !== currentUser.id) {
      return NextResponse.json({ error: 'You may only place your assigned disciplees' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: discipleeId },
      data: {
        currentPhase: phaseNumber,
        currentPhaseTrack: phaseNumber === 100 ? 'women' : phaseNumber === 101 ? 'men' : 'main',
        progressPercentage: 0,
        phaseStartDate: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentPhase: true,
        currentPhaseTrack: true,
      },
    });

    return NextResponse.json({
      success: true,
      disciplee: updatedUser,
      phase,
    });
  } catch (error) {
    console.error('Placement POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
