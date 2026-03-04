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
    },
  });
}

export async function PATCH(req: Request, context: { params: Promise<{ meetingId: string }> }) {
  try {
    const { meetingId } = await context.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!status || !['scheduled', 'completed', 'canceled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, disciplerId: true, discipleeId: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const canEdit =
      user.role === 'admin' ||
      user.id === meeting.disciplerId ||
      user.id === meeting.discipleeId;

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Meeting PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
