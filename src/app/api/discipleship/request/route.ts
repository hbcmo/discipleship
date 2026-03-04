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
      disciplerId: true,
      gender: true,
    },
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role === 'disciplee') {
      const requests = await prisma.discipleshipRequest.findMany({
        where: { discipleeId: user.id },
        include: {
          assignedDiscipler: {
            select: { id: true, name: true, email: true, currentPhase: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ requests, disciplerId: user.disciplerId });
    }

    if (user.role === 'discipler' || user.role === 'admin') {
      const pending = await prisma.discipleshipRequest.findMany({
        where: { status: 'pending' },
        include: {
          disciplee: {
            select: { id: true, name: true, email: true, currentPhase: true, gender: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ requests: pending });
    }

    return NextResponse.json({ requests: [] });
  } catch (error) {
    console.error('Discipleship request GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.role !== 'disciplee') {
      return NextResponse.json({ error: 'Only disciplees can submit requests' }, { status: 403 });
    }

    const { preferredGender, notes } = await req.json();

    const existingPending = await prisma.discipleshipRequest.findFirst({
      where: {
        discipleeId: user.id,
        status: 'pending',
      },
    });

    if (existingPending) {
      return NextResponse.json({ error: 'You already have a pending request' }, { status: 409 });
    }

    const request = await prisma.discipleshipRequest.create({
      data: {
        discipleeId: user.id,
        preferredGender: preferredGender || null,
        notes: notes || null,
        status: 'pending',
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error('Discipleship request POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
