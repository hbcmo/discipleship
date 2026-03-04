import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if this is the first user
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    
    let role: string = isFirstUser ? 'admin' : 'disciplee';
    let disciplerId: string | null = null;
    let currentPhase = 0;

    const pendingInvitation = !isFirstUser
      ? await prisma.discipleshipInvitation.findFirst({
          where: { inviteeEmail: normalizedEmail, status: 'pending' },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    if (pendingInvitation) {
      disciplerId = pendingInvitation.disciplerId;
      currentPhase = pendingInvitation.proposedPhase || 1;
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
        role,
        disciplerId,
        currentPhase,
        currentPhaseTrack: currentPhase === 100 ? 'women' : currentPhase === 101 ? 'men' : 'main',
        phaseStartDate: currentPhase > 0 ? new Date() : null,
      },
    });

    if (pendingInvitation) {
      await prisma.discipleshipInvitation.update({
        where: { id: pendingInvitation.id },
        data: {
          status: 'accepted',
          invitedUserId: user.id,
        },
      });
    }

    // Set session cookie
    const response = NextResponse.json({ 
      success: true, 
      userId: user.id, 
      role: user.role,
      needsAssessment: false,
    });
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
