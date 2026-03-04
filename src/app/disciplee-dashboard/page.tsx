'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DiscipleeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestNotes, setRequestNotes] = useState('');
  const [preferredGender, setPreferredGender] = useState('');
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [assignedDiscipler, setAssignedDiscipler] = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const router = useRouter();

  const loadConnectionData = async (userData: any) => {
    try {
      const [requestRes, meetingsRes] = await Promise.all([
        fetch('/api/discipleship/request'),
        fetch('/api/meetings'),
      ]);
      const inviteRes = await fetch('/api/discipleship/invite');

      if (requestRes.ok) {
        const requestData = await requestRes.json();
        const requests = requestData.requests || [];
        if (requests.length > 0) {
          setRequestStatus(requests[0].status || 'pending');
          const approved = requests.find((r: any) => r.status === 'approved' && r.assignedDiscipler);
          if (approved?.assignedDiscipler) {
            setAssignedDiscipler(approved.assignedDiscipler);
          }
        }
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData || []);
      }

      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInvitations(inviteData || []);
      }
    } catch (error) {
      console.error('Failed loading connection data:', error);
    }

    if (userData.discipler) {
      setAssignedDiscipler(userData.discipler);
      setRequestStatus('approved');
    }
  };

  const submitDisciplerRequest = async () => {
    setActionError('');
    setActionMessage('');
    try {
      const res = await fetch('/api/discipleship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredGender: preferredGender || null,
          notes: requestNotes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Could not submit request');
        return;
      }

      setRequestStatus('pending');
      setRequestNotes('');
      setPreferredGender('');
      setActionMessage('Request sent successfully. A discipler will be assigned soon.');
    } catch (error) {
      setActionError('Could not submit request');
    }
  };

  const scheduleMeeting = async () => {
    setActionError('');
    setActionMessage('');
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: meetingDateTime,
          location: meetingLocation,
          notes: meetingNotes,
          title: 'Face-to-Face Discipleship Meeting',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Unable to schedule meeting');
        return;
      }

      const newMeeting = await res.json();
      setMeetings((prev) => [newMeeting, ...prev].sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()));
      setMeetingDateTime('');
      setMeetingLocation('');
      setMeetingNotes('');
      setActionMessage('Meeting scheduled successfully.');
    } catch (error) {
      setActionError('Unable to schedule meeting');
    }
  };

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    setActionError('');
    setActionMessage('');
    try {
      const res = await fetch(`/api/discipleship/invite/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Unable to process invitation');
        return;
      }

      setActionMessage(action === 'accept' ? 'Invitation accepted and assignment updated.' : 'Invitation declined.');
      await loadConnectionData(user);
    } catch (error) {
      setActionError('Unable to process invitation');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        // Allow disciplees, disciplers, and admins to view this dashboard
        if (userData.role !== 'disciplee' && userData.role !== 'discipler' && userData.role !== 'admin') {
          router.push('/');
        }
        setUser(userData);
        await loadConnectionData(userData);
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

  const completedPhases = user.completedPhases ? JSON.parse(user.completedPhases) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="border-b border-blue-200 bg-white sticky top-0 shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              HBC
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Harmony Baptist</p>
              <p className="text-xs text-zinc-700">Discipleship Path</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-700 font-medium">{user.name}</span>
            {user.role === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/discipler-dashboard"
                  className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  Discipler View
                </Link>
              </>
            )}
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/auth/login');
              }}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Growth journey header */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8 shadow-sm md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">Your Growth Journey</p>
                <h2 className="text-3xl font-bold text-blue-900 mt-2">Personalized Discipleship Path</h2>
                <p className="text-sm mt-1 text-blue-900 opacity-90">Your discipler will guide your next steps for steady, lifelong growth.</p>
              </div>
              <span className="rounded-full px-4 py-2 text-sm font-bold text-blue-900 bg-white/60">Current Focus Week</span>
            </div>
            <p className="text-sm leading-relaxed text-blue-900 opacity-90">
              This path is not a ladder. Keep growing deeply in Scripture, prayer, and obedience with your discipler.
            </p>
          </div>

          {/* Quick stats */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-zinc-700 font-semibold uppercase">Progress</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{completedPhases.length}</p>
              <p className="text-xs text-zinc-700 mt-1">milestones completed</p>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${(completedPhases.length / 10) * 100}%` }}></div>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-zinc-700 font-semibold uppercase">Status</p>
              <p className="text-sm font-bold text-blue-900 mt-1">Active</p>
              <p className="text-xs text-zinc-700 mt-1">On track</p>
            </div>
          </div>
        </div>

        {/* Assignment and meeting workflow */}
        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-zinc-900 mb-4">Discipleship Connection</h3>

          {actionError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
          )}
          {actionMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{actionMessage}</div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">Discipler Assignment</h4>
              {assignedDiscipler ? (
                <div>
                  <p className="text-sm text-zinc-700">Assigned Discipler:</p>
                  <p className="text-base font-semibold text-blue-900 mt-1">{assignedDiscipler.name}</p>
                  <p className="text-sm text-zinc-600">{assignedDiscipler.email}</p>
                  <p className="text-xs text-zinc-700 mt-2">Your discipler will personalize your ongoing growth plan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-700">
                    {requestStatus === 'pending'
                      ? 'Your request is pending approval.'
                      : 'Request a discipler and include any preferences.'}
                  </p>
                  <select
                    value={preferredGender}
                    onChange={(e) => setPreferredGender(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    disabled={requestStatus === 'pending'}
                  >
                    <option value="">No gender preference</option>
                    <option value="male">Prefer male discipler</option>
                    <option value="female">Prefer female discipler</option>
                  </select>
                  <textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Share context, schedule availability, or needs"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm h-24"
                    disabled={requestStatus === 'pending'}
                  />
                  <button
                    onClick={submitDisciplerRequest}
                    disabled={requestStatus === 'pending'}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {requestStatus === 'pending' ? 'Request Pending' : 'Request a Discipler'}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5">
              <h4 className="text-lg font-semibold text-zinc-900 mb-2">Schedule Face-to-Face Meeting</h4>
              {!assignedDiscipler ? (
                <p className="text-sm text-zinc-600">You can schedule once a discipler is assigned.</p>
              ) : (
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={meetingDateTime}
                    onChange={(e) => setMeetingDateTime(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="Location (coffee shop, church office, etc.)"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                  />
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Optional meeting agenda"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm h-20"
                  />
                  <button
                    onClick={scheduleMeeting}
                    disabled={!meetingDateTime || !meetingLocation}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Schedule Meeting
                  </button>
                </div>
              )}
            </div>
          </div>

          {invitations.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h4 className="text-lg font-semibold text-zinc-900 mb-3">Invitation Requests</h4>
              <div className="space-y-3">
                {invitations.map((invite) => (
                  <div key={invite.id} className="rounded-xl border border-amber-200 bg-white p-4">
                    <p className="text-sm font-semibold text-zinc-900">{invite.discipler?.name} invited you to discipleship</p>
                    <p className="text-xs text-zinc-600 mt-1">Proposed focus phase: {invite.proposedPhase}</p>
                    {invite.message && <p className="text-sm text-zinc-700 mt-2">"{invite.message}"</p>}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => respondToInvitation(invite.id, 'accept')}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToInvitation(invite.id, 'decline')}
                        className="rounded-lg bg-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-300"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h4 className="text-base font-semibold text-zinc-900 mb-3">Upcoming Meetings</h4>
            {meetings.length === 0 ? (
              <p className="text-sm text-zinc-600">No meetings scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {meetings.slice(0, 6).map((meeting) => (
                  <div key={meeting.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-zinc-900">{meeting.title}</p>
                      <span className="text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-1">{meeting.status}</span>
                    </div>
                    <p className="text-sm text-zinc-700 mt-1">{new Date(meeting.scheduledFor).toLocaleString()}</p>
                    <p className="text-sm text-zinc-600">Location: {meeting.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* This week's study */}
        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">This Week's Focus</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-2">Knowing Jesus Through Scripture</h3>
            </div>
            <span className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Week 1</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-2">Scripture Reading</p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                <span className="font-semibold">Romans 3:21-26</span> - The foundation of the Gospel: God's righteousness revealed and provided through Christ
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-2">Memory Verse</p>
              <p className="text-sm text-blue-900 italic font-medium">
                "Therefore, having been justified by faith, we have peace with God through our Lord Jesus Christ." - Romans 5:1
              </p>
            </div>
          </div>

          {/* Reflection questions */}
          <div className="mb-6">
            <h4 className="font-semibold text-zinc-900 mb-4">Reflection Questions</h4>
            <div className="space-y-4">
              {[
                'What does it mean that Christ died "for me" personally?',
                'How does understanding substitution change my view of the cross?',
                'What was my spiritual condition before trusting Christ?'
              ].map((question, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm font-medium text-zinc-700 mb-3">{question}</p>
                  <textarea
                    placeholder="Write your response..."
                    className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-700"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Prayer response */}
          <div className="mb-6">
            <h4 className="font-semibold text-zinc-900 mb-4">Prayer Response</h4>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-zinc-600 mb-3">
                Take time to pray in response to what you've learned this week. Write a prayer reflecting on God's love and Christ's sacrifice.
              </p>
              <textarea
                placeholder="Write your prayer..."
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-zinc-700"
                rows={4}
              />
            </div>
          </div>

          <button className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700">
            Save My Responses
          </button>
        </div>

        {/* Spiritual habits tracking */}
        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-zinc-900">Spiritual Habits This Week</h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Update</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'Prayer', goal: 7, current: 0, icon: '🙏' },
              { name: 'Scripture Reading', goal: 7, current: 0, icon: '📖' },
              { name: 'Reflection', goal: 5, current: 0, icon: '🤔' },
              { name: 'Faith Sharing', goal: 3, current: 0, icon: '💬' }
            ].map((habit, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{habit.icon}</span>
                  <p className="text-sm font-semibold text-zinc-700">{habit.current}/{habit.goal}</p>
                </div>
                <p className="text-sm font-medium text-zinc-900">{habit.name}</p>
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all" style={{ width: `${(habit.current / habit.goal) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages section */}
        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-zinc-900 mb-6">Messages from Your Discipler</h3>
          <div className="text-center py-8">
            <p className="text-zinc-600">No messages yet. Your discipler will share encouragement and insights here.</p>
          </div>
        </div>

        {/* Navigation links */}
        {user.role === 'discipler' && (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
            <p className="text-sm text-zinc-600 mb-3">You're also a discipler. View your leadership dashboard:</p>
            <Link href="/discipler-dashboard" className="inline-block rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Go to Discipler Dashboard
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-zinc-200 pt-6 pb-12 text-center text-xs text-zinc-500">
          <p>This platform is inspired by the discipleship principles found in "Deep Discipleship" by J.T. English.</p>
          <p className="mt-2">Study materials and content are sample content created for demonstration purposes.</p>
        </footer>
      </div>
    </div>
  );
}
