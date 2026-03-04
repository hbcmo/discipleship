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
      disciplerId: true,
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

    let whereClause: any = {};

    if (user.role === 'disciplee') {
      whereClause = { discipleeId: user.id };
    } else if (user.role === 'discipler') {
      whereClause = { disciplerId: user.id };
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        discipler: { select: { id: true, name: true, email: true, currentPhase: true } },
        disciplee: { select: { id: true, name: true, email: true, currentPhase: true } },
      },
      orderBy: { scheduledFor: 'asc' },
      take: 50,
    });

    return NextResponse.json(meetings);
  } catch (error) {
    console.error('Meetings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { discipleeId, scheduledFor, location, notes, title } = await req.json();

    if (!scheduledFor || !location) {
      return NextResponse.json({ error: 'scheduledFor and location are required' }, { status: 400 });
    }

    const when = new Date(scheduledFor);
    if (isNaN(when.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduledFor date' }, { status: 400 });
    }

    let resolvedDiscipleeId = discipleeId;
    let resolvedDisciplerId: string | null = null;

    if (user.role === 'disciplee') {
      resolvedDiscipleeId = user.id;
      resolvedDisciplerId = user.disciplerId || null;

      if (!resolvedDisciplerId) {
        return NextResponse.json({ error: 'You are not yet assigned to a discipler' }, { status: 400 });
      }
    } else if (user.role === 'discipler') {
      if (!resolvedDiscipleeId) {
        return NextResponse.json({ error: 'discipleeId is required for disciplers' }, { status: 400 });
      }
      const disciplee = await prisma.user.findUnique({
        where: { id: resolvedDiscipleeId },
        select: { disciplerId: true },
      });

      if (!disciplee || disciplee.disciplerId !== user.id) {
        return NextResponse.json({ error: 'You can only schedule with your assigned disciplees' }, { status: 403 });
      }

      resolvedDisciplerId = user.id;
    } else if (user.role === 'admin') {
      if (!resolvedDiscipleeId) {
        return NextResponse.json({ error: 'discipleeId is required' }, { status: 400 });
      }

      const disciplee = await prisma.user.findUnique({
        where: { id: resolvedDiscipleeId },
        select: { disciplerId: true },
      });

      if (!disciplee?.disciplerId) {
        return NextResponse.json({ error: 'Selected disciplee has no assigned discipler' }, { status: 400 });
      }

      resolvedDisciplerId = disciplee.disciplerId;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title: title || 'Discipleship Meeting',
        disciplerId: resolvedDisciplerId,
        discipleeId: resolvedDiscipleeId,
        scheduledFor: when,
        location,
        notes: notes || null,
        createdById: user.id,
        status: 'scheduled',
      },
      include: {
        discipler: { select: { id: true, name: true, email: true } },
        disciplee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Meetings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
