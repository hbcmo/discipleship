import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getAllowedPhaseNumbersForRole, getPhaseDefinition } from '@/lib/phaseCatalog';
import { sendInvitationEmail } from '@/lib/email';

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

    if (currentUser.role === 'disciplee') {
      const invitations = await prisma.discipleshipInvitation.findMany({
        where: {
          status: 'pending',
          OR: [
            { invitedUserId: currentUser.id },
          ],
        },
        include: {
          discipler: {
            select: {
              id: true,
              name: true,
              email: true,
              currentPhase: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(invitations);
    }

    if (currentUser.role !== 'discipler' && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invitations = await prisma.discipleshipInvitation.findMany({
      where: { disciplerId: currentUser.id },
      include: {
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            currentPhase: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(invitations);
  } catch (error) {
    console.error('Invite GET error:', error);
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

    const { email, message, proposedPhase } = await req.json();
    const origin = req.headers.get('origin');
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      origin ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const targetPhase = typeof proposedPhase === 'number' ? proposedPhase : 1;
    const phaseDef = getPhaseDefinition(targetPhase);
    const phaseLabel = phaseDef ? `${phaseDef.number} - ${phaseDef.name}` : `Phase ${targetPhase}`;

    const allowedPhases = getAllowedPhaseNumbersForRole(currentUser.role);
    if (!allowedPhases.includes(targetPhase)) {
      return NextResponse.json({ error: 'You are not allowed to propose that phase' }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        role: true,
        currentPhase: true,
      },
    });

    if (existingUser && existingUser.role !== 'disciplee') {
      return NextResponse.json({ error: 'That email belongs to a non-disciplee account' }, { status: 400 });
    }

    if (existingUser) {
      if (currentUser.role === 'discipler' && (currentUser.currentPhase || 0) < (existingUser.currentPhase || 0)) {
        return NextResponse.json(
          { error: 'Cannot invite a disciplee currently at a phase higher than your own phase' },
          { status: 400 }
        );
      }

      const existingPending = await prisma.discipleshipInvitation.findFirst({
        where: {
          disciplerId: currentUser.id,
          invitedUserId: existingUser.id,
          status: 'pending',
        },
      });

      if (existingPending) {
        return NextResponse.json({ error: 'A pending invitation already exists for this disciplee' }, { status: 409 });
      }

      const invitation = await prisma.discipleshipInvitation.create({
        data: {
          disciplerId: currentUser.id,
          inviteeEmail: normalizedEmail,
          message: message || null,
          proposedPhase: targetPhase,
          status: 'pending',
          invitedUserId: existingUser.id,
        },
      });

      const discipler = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { name: true },
      });

      let note = 'Existing disciplee found. Invitation sent and awaiting acceptance.';
      if (appUrl) {
        const emailResult = await sendInvitationEmail({
          to: normalizedEmail,
          disciplerName: discipler?.name || 'Your discipler',
          proposedPhaseLabel: phaseLabel,
          customMessage: message || null,
          appUrl,
        });

        if (!emailResult.sent) {
          note += ' (Invite email could not be delivered; record was still created.)';
          console.error('Invitation email send failed:', emailResult.reason);
        }
      } else {
        note += ' (Set NEXT_PUBLIC_APP_URL to enable email invite links.)';
      }

      return NextResponse.json({
        success: true,
        invitation,
        note,
      });
    }

    const invitation = await prisma.discipleshipInvitation.create({
      data: {
        disciplerId: currentUser.id,
        inviteeEmail: normalizedEmail,
        message: message || null,
        proposedPhase: targetPhase,
        status: 'pending',
      },
    });

    const discipler = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { name: true },
    });

    let note = 'Invitation sent by email. They can use the signup link to join.';
    if (appUrl) {
      const emailResult = await sendInvitationEmail({
        to: normalizedEmail,
        disciplerName: discipler?.name || 'Your discipler',
        proposedPhaseLabel: phaseLabel,
        customMessage: message || null,
        appUrl,
      });

      if (!emailResult.sent) {
        note = 'Invitation recorded. Share signup link with this person to complete onboarding. (Email send failed.)';
        console.error('Invitation email send failed:', emailResult.reason);
      }
    } else {
      note = 'Invitation recorded. Share signup link with this person to complete onboarding. (Set NEXT_PUBLIC_APP_URL to include links in emails.)';
    }

    return NextResponse.json({
      success: true,
      invitation,
      note,
    });
  } catch (error) {
    console.error('Invite POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
