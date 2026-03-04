import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get('userId')?.value;

    if (!userId) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        disciplerId: true,
        discipler: {
          select: {
            id: true,
            name: true,
            email: true,
            currentPhase: true,
          },
        },
        currentPhase: true,
        currentPhaseTrack: true,
        completedPhases: true,
        progressPercentage: true,
        phaseStartDate: true,
        gender: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Me error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
