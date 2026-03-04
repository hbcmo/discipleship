'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function DiscipleeDetailPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const router = useRouter();
  const params = useParams();
  const discipleeId = params.id as string;

  // Mock disciplee data
  const discipleeData: any = {
    '1': {
      name: 'Michael Johnson',
      email: 'michael@example.com',
      progress: '72%',
      focus: 'Building prayer rhythms',
      habits: [
        { label: 'Prayer', current: 5, total: 7 },
        { label: 'Scripture Reading', current: 4, total: 7 },
        { label: 'Reflection', current: 3, total: 5 },
        { label: 'Faith Sharing', current: 2, total: 3 },
      ],
      recentActivity: [
        { action: 'Completed John 1:1-14 study', time: '2 hours ago' },
        { action: 'Submitted prayer reflection', time: '1 day ago' },
        { action: 'Started new lesson', time: '3 days ago' },
      ],
      messages: [
        { text: 'I am struggling with consistency in prayer.', date: '2 days ago' },
        { text: 'Scripture reading has been really challenging this week.', date: '5 days ago' },
      ],
    },
    '2': {
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      progress: '68%',
      focus: 'Scripture memorization',
      habits: [
        { label: 'Prayer', current: 6, total: 7 },
        { label: 'Scripture Reading', current: 5, total: 7 },
        { label: 'Reflection', current: 4, total: 5 },
        { label: 'Faith Sharing', current: 3, total: 3 },
      ],
      recentActivity: [
        { action: 'Memorized John 1:1-3', time: '1 day ago' },
        { action: 'Completed reflection', time: '2 days ago' },
      ],
      messages: [
        { text: 'Memorization is going well!', date: '1 day ago' },
      ],
    },
    '3': {
      name: 'David Chen',
      email: 'david@example.com',
      progress: '55%',
      focus: 'Faith sharing practice',
      habits: [
        { label: 'Prayer', current: 3, total: 7 },
        { label: 'Scripture Reading', current: 2, total: 7 },
        { label: 'Reflection', current: 1, total: 5 },
        { label: 'Faith Sharing', current: 1, total: 3 },
      ],
      recentActivity: [
        { action: 'Started new lesson', time: '1 day ago' },
      ],
      messages: [
        { text: 'Having trouble getting started this week.', date: '3 days ago' },
      ],
    },
  };

  const disciplee = discipleeData[discipleeId] || {
    name: 'Disciplee',
    email: 'Details unavailable in this view',
    progress: '--',
    focus: 'Use the dashboard actions to manage this disciplee.',
    habits: [] as any[],
    recentActivity: [] as any[],
    messages: [] as any[],
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });

        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!res.ok) {
          setAuthError('Unable to validate your session right now. Please refresh and try again.');
          return;
        }

        const userData = await res.json();
        if (userData.role !== 'discipler' && userData.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(userData);
      } catch (error) {
        setAuthError('Unable to validate your session right now. Please refresh and try again.');
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
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {authError || 'Unable to load this page.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/discipler-dashboard" className="flex items-center gap-3 hover:opacity-70">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                HBC
              </div>
              <span className="font-semibold text-zinc-900">Discipleship</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{user.name}</span>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/discipler-dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-semibold mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900">{disciplee.name}</h1>
              <p className="text-sm text-zinc-600 mt-1">{disciplee.email}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">{disciplee.progress}</p>
              <p className="text-sm text-zinc-600">Overall Progress</p>
            </div>
          </div>
          <p className="text-lg text-zinc-700 bg-blue-50 rounded-lg p-4">
            Current Focus: <span className="font-semibold">{disciplee.focus}</span>
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Spiritual Habits</h2>
            <div className="space-y-3">
              {disciplee.habits.map((habit: any) => (
                <div key={habit.label} className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-zinc-900">{habit.label}</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {habit.current}/{habit.total}
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(habit.current / habit.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {disciplee.recentActivity.map((activity: any, idx: number) => (
                <div key={idx} className="border-l-2 border-blue-300 pl-4 pb-3">
                  <p className="text-sm text-zinc-900">{activity.action}</p>
                  <p className="text-xs text-zinc-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Messages</h2>
          <div className="space-y-4">
            {disciplee.messages.map((msg: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm text-zinc-900">{msg.text}</p>
                <p className="text-xs text-zinc-500 mt-2">{msg.date}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <label className="block text-sm font-semibold text-zinc-900 mb-2">
              Send Message
            </label>
            <div className="flex gap-2">
              <textarea
                placeholder="Encouragement, questions, or feedback..."
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows={3}
              ></textarea>
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 h-fit">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
