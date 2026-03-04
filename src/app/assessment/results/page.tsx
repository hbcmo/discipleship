'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PHASE_INFO } from '@/lib/phaseUtils';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const score = parseInt(searchParams.get('score') || '0');
  const phase = parseInt(searchParams.get('phase') || '1');
  const scorePercentage = parseInt(searchParams.get('percentage') || '0');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        setUser(userData);
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const phaseInfo = PHASE_INFO[phase as keyof typeof PHASE_INFO] || PHASE_INFO[1];
  const phaseDescriptions: { [key: number]: string } = {
    1: 'You\'re just beginning your Christian journey. This phase covers the foundational Gospel message and assurance of salvation.',
    2: 'You have a basic understanding of salvation. Now learn how to study Scripture and grow through God\'s Word.',
    3: 'You understand the Gospel and Scripture. This phase focuses on church membership and the role of community.',
    4: 'You\'re ready for deeper spiritual transformation. This phase covers sanctification and spiritual disciplines.',
    5: 'You understand discipleship well. Now learn the character and practices of spiritual leadership.',
    6: 'You\'re ready for advanced doctrine. This phase explores Baptist theology, church practice, and apologetics.',
  };

  const performanceMessage = 
    scorePercentage >= 80 ? '🌟 Excellent! You demonstrated strong knowledge.' :
    scorePercentage >= 60 ? '👍 Good understanding. You\'re ready for your recommended phase.' :
    scorePercentage >= 40 ? '💪 Solid foundation. This phase will build on what you know.' :
    '📚 No worries! We\'re placing you where you can grow most effectively.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              HBC
            </div>
            <span className="font-semibold text-zinc-900">Assessment Results</span>
          </div>
          <span className="text-sm text-zinc-600">{user.name}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Main Result Card */}
        <div className="mb-8 rounded-3xl border-2" style={{ borderColor: phaseInfo.color, backgroundColor: `${phaseInfo.color}05` }}>
          <div className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2" style={{ color: phaseInfo.color }}>🎯 Assessment Complete</h1>
              <p className="text-zinc-600">{performanceMessage}</p>
            </div>

            {/* Score Display */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <div className="rounded-2xl bg-white p-6 text-center border-2 border-zinc-100">
                <p className="text-sm font-semibold text-zinc-600 mb-2">Your Score</p>
                <p className="text-5xl font-bold text-blue-600">{score}</p>
                <p className="text-xs text-zinc-600 mt-2">points earned</p>
              </div>

              <div className="rounded-2xl bg-white p-6 text-center border-2 border-zinc-100">
                <p className="text-sm font-semibold text-zinc-600 mb-2">Accuracy</p>
                <p className="text-5xl font-bold" style={{ color: phaseInfo.color }}>{scorePercentage}%</p>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${scorePercentage}%`, backgroundColor: phaseInfo.color }}
                  ></div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 text-center border-2 border-zinc-100">
                <p className="text-sm font-semibold text-zinc-600 mb-2">Recommended Phase</p>
                <p className="text-5xl font-bold" style={{ color: phaseInfo.color }}>{phase}</p>
                <p className="text-xs text-zinc-600 mt-2">{phaseInfo.name}</p>
              </div>
            </div>

            {/* Phase Description */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: `${phaseInfo.color}10`, borderLeft: `4px solid ${phaseInfo.color}` }}>
              <h3 className="font-semibold mb-2" style={{ color: phaseInfo.color }}>What's in Phase {phase}?</h3>
              <p className="text-sm text-zinc-700 mb-4">{phaseDescriptions[phase] || 'Explore advanced topics in your discipleship journey.'}</p>
              
              {phase === 6 && (
                <div className="mt-4 p-4 rounded-lg bg-white border border-zinc-200">
                  <p className="text-xs font-semibold text-zinc-900 mb-2">📍 Note:</p>
                  <p className="text-xs text-zinc-700">After Phase 6, you'll choose a gender-specific track (Women's Womanhood & Mentorship or Men's Biblical Manhood & Leadership) before progressing to formal ministry leadership roles.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6">
            <h3 className="font-semibold text-green-900 mb-2">✅ Accept Recommendation</h3>
            <p className="text-sm text-green-800 mb-4">Start your discipleship journey at Phase {phase}. You'll begin with content tailored to this level.</p>
            <Link
              href="/disciplee-dashboard"
              className="block text-center rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">🔄 Retake Assessment</h3>
            <p className="text-sm text-blue-800 mb-4">Want to try again? You can retake the assessment if you felt you could do better.</p>
            <button
              onClick={() => router.push('/assessment')}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-10 rounded-2xl bg-white border border-blue-200 p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">Can I start at a different phase?</h3>
              <p className="text-sm text-zinc-700">Yes! This recommendation is based on the assessment, but you can adjust it if needed. Talk with your discipler about what's best for you.</p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">What if I don't pass Phase 1?</h3>
              <p className="text-sm text-zinc-700">Every phase is designed to help you grow. Starting where you are allows you to build a strong foundation before moving forward.</p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">How long does each phase take?</h3>
              <p className="text-sm text-zinc-700">Phase 1-6 typically take 4-8 weeks each, depending on your pace. Phases 7-10 are ongoing as you take on leadership roles.</p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2">Can I move faster or slower than recommended?</h3>
              <p className="text-sm text-zinc-700">Absolutely! Your discipler can adjust your pace based on your progress and what's best for your growth.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-zinc-500 border-t border-zinc-200 pt-6">
          <p>This placement assessment is designed to help you start at an appropriate level.</p>
          <p className="mt-2">Your discipler can adjust your phase assignment at any time.</p>
        </footer>
      </div>
    </div>
  );
}

export default function AssessmentResults() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
