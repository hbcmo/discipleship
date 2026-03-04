import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'discipler') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requests = await prisma.discipleshipRequest.findMany({
      where: { status: 'pending' },
      include: {
        disciplee: {
          select: { id: true, name: true, email: true, currentPhase: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const disciplers = await prisma.user.findMany({
      where: {
        role: { in: ['discipler', 'admin'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currentPhase: true,
        _count: {
          select: { disciples: true },
        },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    const assignedDisciplees = await prisma.user.findMany({
      where: user.role === 'admin' ? { role: 'disciplee', disciplerId: { not: null } } : { role: 'disciplee', disciplerId: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        currentPhase: true,
        disciplerId: true,
        discipler: {
          select: { id: true, name: true, email: true, currentPhase: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ requests, disciplers, assignedDisciplees });
  } catch (error) {
    console.error('Assignment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'discipler') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { discipleeId, disciplerId } = await req.json();
    if (!discipleeId || !disciplerId) {
      return NextResponse.json({ error: 'discipleeId and disciplerId are required' }, { status: 400 });
    }

    const [disciplee, discipler] = await Promise.all([
      prisma.user.findUnique({
        where: { id: discipleeId },
        select: { id: true, role: true, currentPhase: true },
      }),
      prisma.user.findUnique({
        where: { id: disciplerId },
        select: { id: true, role: true, currentPhase: true },
      }),
    ]);

    if (!disciplee || disciplee.role !== 'disciplee') {
      return NextResponse.json({ error: 'Invalid disciplee user' }, { status: 400 });
    }

    if (!discipler || (discipler.role !== 'discipler' && discipler.role !== 'admin')) {
      return NextResponse.json({ error: 'Invalid discipler user' }, { status: 400 });
    }

    // Prevent less advanced discipler being assigned to a more advanced disciplee
    if ((discipler.currentPhase || 0) < (disciplee.currentPhase || 0)) {
      return NextResponse.json(
        {
          error: `Assignment blocked: discipler phase (${discipler.currentPhase || 0}) is lower than disciplee phase (${disciplee.currentPhase || 0}).`,
        },
        { status: 400 }
      );
    }

    const updatedDisciplee = await prisma.user.update({
      where: { id: discipleeId },
      data: { disciplerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        currentPhase: true,
        disciplerId: true,
      },
    });

    await prisma.discipleshipRequest.updateMany({
      where: { discipleeId, status: 'pending' },
      data: {
        status: 'approved',
        assignedDisciplerId: disciplerId,
      },
    });

    return NextResponse.json({ success: true, disciplee: updatedDisciplee });
  } catch (error) {
    console.error('Assignment POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
