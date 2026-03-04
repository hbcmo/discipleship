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

async function canAccessDisciplee(currentUser: { id: string; role: string }, discipleeId: string) {
  const disciplee = await prisma.user.findUnique({
    where: { id: discipleeId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      disciplerId: true,
      currentPhase: true,
      progressPercentage: true,
      completedPhases: true,
      phaseStartDate: true,
      updatedAt: true,
    },
  });

  if (!disciplee || disciplee.role !== 'disciplee') {
    return { allowed: false, disciplee: null };
  }

  if (currentUser.role === 'admin') {
    return { allowed: true, disciplee };
  }

  if (currentUser.role === 'discipler' && disciplee.disciplerId === currentUser.id) {
    return { allowed: true, disciplee };
  }

  return { allowed: false, disciplee: null };
}

export async function GET(_req: Request, context: { params: Promise<{ discipleeId: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (currentUser.role !== 'discipler' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { discipleeId } = await context.params;
    const access = await canAccessDisciplee(currentUser, discipleeId);

    if (!access.allowed || !access.disciplee) {
      return NextResponse.json({ error: 'Disciplee not found or not accessible' }, { status: 404 });
    }

    const [studyPlans, messages, upcomingMeetings] = await Promise.all([
      prisma.studyPlan.findMany({
        where: { userId: discipleeId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      (prisma as any).discipleeMessage.findMany({
        where: { discipleeId },
        include: {
          discipler: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.meeting.findMany({
        where: { discipleeId },
        orderBy: { scheduledFor: 'asc' },
        take: 10,
        select: {
          id: true,
          title: true,
          scheduledFor: true,
          location: true,
          status: true,
        },
      }),
    ]);

    return NextResponse.json({
      disciplee: access.disciplee,
      studyPlans,
      messages,
      upcomingMeetings,
    });
  } catch (error) {
    console.error('Disciplee detail GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ discipleeId: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (currentUser.role !== 'discipler' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { discipleeId } = await context.params;
    const access = await canAccessDisciplee(currentUser, discipleeId);

    if (!access.allowed) {
      return NextResponse.json({ error: 'Disciplee not found or not accessible' }, { status: 404 });
    }

    const body = await req.json();

    if (body.type === 'study-plan') {
      const title = String(body.title || '').trim();
      const content = String(body.content || '').trim();

      if (!title || !content) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
      }

      const plan = await prisma.studyPlan.create({
        data: {
          userId: discipleeId,
          title,
          content,
        },
      });

      return NextResponse.json({ success: true, plan });
    }

    if (body.type === 'message') {
      const content = String(body.content || '').trim();

      if (!content) {
        return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
      }

      const message = await (prisma as any).discipleeMessage.create({
        data: {
          disciplerId: currentUser.id,
          discipleeId,
          content,
        },
      });

      return NextResponse.json({ success: true, message });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
  } catch (error) {
    console.error('Disciplee detail POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
