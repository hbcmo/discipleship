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

export async function PATCH(
  req: Request,
  context: { params: Promise<{ invitationId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (currentUser.role !== 'disciplee') {
      return NextResponse.json({ error: 'Only disciplees can respond to invitations' }, { status: 403 });
    }

    const { invitationId } = await context.params;
    const { action } = await req.json();

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Action must be accept or decline' }, { status: 400 });
    }

    const invitation = await prisma.discipleshipInvitation.findUnique({
      where: { id: invitationId },
      include: {
        discipler: {
          select: {
            id: true,
            role: true,
            currentPhase: true,
          },
        },
      },
    });

    if (!invitation || invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Pending invitation not found' }, { status: 404 });
    }

    if (invitation.invitedUserId !== currentUser.id) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 });
    }

    if (action === 'decline') {
      const declined = await prisma.discipleshipInvitation.update({
        where: { id: invitationId },
        data: { status: 'declined' },
      });

      return NextResponse.json({ success: true, invitation: declined });
    }

    if ((invitation.discipler.currentPhase || 0) < (currentUser.currentPhase || 0)) {
      return NextResponse.json(
        { error: 'This assignment is blocked because discipler phase is below your current phase.' },
        { status: 400 }
      );
    }

    const [updatedUser, acceptedInvitation] = await prisma.$transaction([
      prisma.user.update({
        where: { id: currentUser.id },
        data: {
          disciplerId: invitation.disciplerId,
          currentPhase: invitation.proposedPhase,
          currentPhaseTrack:
            invitation.proposedPhase === 100
              ? 'women'
              : invitation.proposedPhase === 101
                ? 'men'
                : 'main',
          progressPercentage: 0,
          phaseStartDate: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          disciplerId: true,
          currentPhase: true,
        },
      }),
      prisma.discipleshipInvitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' },
      }),
    ]);

    return NextResponse.json({ success: true, user: updatedUser, invitation: acceptedInvitation });
  } catch (error) {
    console.error('Invitation response error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
