'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DisciplerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [disciplers, setDisciplers] = useState<any[]>([]);
  const [assignedDisciplees, setAssignedDisciplees] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedDisciplers, setSelectedDisciplers] = useState<{ [key: string]: string }>({});
  const [meetingDiscipleeId, setMeetingDiscipleeId] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [phaseDefinitions, setPhaseDefinitions] = useState<any[]>([]);
  const [allowedPhases, setAllowedPhases] = useState<number[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<{ [key: string]: number }>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [invitePhase, setInvitePhase] = useState(1);
  const [invitations, setInvitations] = useState<any[]>([]);
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      const [assignRes, meetingsRes] = await Promise.all([
        fetch('/api/discipleship/assign'),
        fetch('/api/meetings'),
      ]);
      const [placementRes, invitationRes] = await Promise.all([
        fetch('/api/discipleship/place'),
        fetch('/api/discipleship/invite'),
      ]);

      if (assignRes.ok) {
        const data = await assignRes.json();
        setPendingRequests(data.requests || []);
        setDisciplers(data.disciplers || []);
        setAssignedDisciplees(data.assignedDisciplees || []);
      }

      if (meetingsRes.ok) {
        const meetingData = await meetingsRes.json();
        setMeetings(meetingData || []);
      }

      if (placementRes.ok) {
        const placementData = await placementRes.json();
        setPhaseDefinitions(placementData.phases || []);
        setAllowedPhases(placementData.allowedPhases || []);
      }

      if (invitationRes.ok) {
        const invitationData = await invitationRes.json();
        setInvitations(invitationData || []);
      }
    } catch (e) {
      setError('Failed loading dashboard data');
    }
  };

  const placeDisciplee = async (discipleeId: string) => {
    setError('');
    setMessage('');
    const phaseNumber = selectedPlacement[discipleeId];

    if (!phaseNumber) {
      setError('Select a phase before placing.');
      return;
    }

    try {
      const res = await fetch('/api/discipleship/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipleeId, phaseNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Placement failed');
        return;
      }
      setMessage(`Placement updated to ${data.phase?.name || `Phase ${phaseNumber}`}.`);
      await loadDashboardData();
    } catch (e) {
      setError('Placement failed');
    }
  };

  const sendInvitation = async () => {
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/discipleship/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          message: inviteMessage,
          proposedPhase: invitePhase,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send invitation');
        return;
      }

      setMessage(data.note || 'Invitation sent.');
      setInviteEmail('');
      setInviteMessage('');
      setInvitePhase(1);
      await loadDashboardData();
    } catch (e) {
      setError('Failed to send invitation');
    }
  };

  const assignDisciplee = async (discipleeId: string) => {
    setError('');
    setMessage('');
    const disciplerId = selectedDisciplers[discipleeId] || user?.id;

    try {
      const res = await fetch('/api/discipleship/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipleeId, disciplerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to assign disciplee');
        return;
      }

      setMessage('Disciplee assigned successfully.');
      await loadDashboardData();
    } catch (e) {
      setError('Failed to assign disciplee');
    }
  };

  const scheduleMeeting = async () => {
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipleeId: meetingDiscipleeId,
          scheduledFor: meetingDateTime,
          location: meetingLocation,
          notes: meetingNotes,
          title: 'Face-to-Face Discipleship Meeting',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to schedule meeting');
        return;
      }
      setMessage('Meeting scheduled successfully.');
      setMeetingDiscipleeId('');
      setMeetingDateTime('');
      setMeetingLocation('');
      setMeetingNotes('');
      await loadDashboardData();
    } catch (e) {
      setError('Failed to schedule meeting');
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
        if (userData.role !== 'discipler' && userData.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(userData);
        await loadDashboardData();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              HBC
            </div>
            <span className="font-semibold text-zinc-900">Discipleship</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{user.name}</span>
            <Link href="/disciplee-dashboard" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              View My Progress
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
                Admin Panel
              </Link>
            )}
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
        <h1 className="text-3xl font-semibold text-zinc-900 mb-8">
          Welcome, {user.name}! ({user.role === 'admin' ? 'Admin + Discipler' : 'Discipler'} View)
        </h1>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div>}

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            Assigned Disciplees
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {assignedDisciplees.length === 0 && (
              <p className="text-sm text-zinc-600">No assigned disciplees yet.</p>
            )}
            {assignedDisciplees.map((disciplee) => (
              <button
                key={disciplee.id}
                onClick={() => router.push(`/discipler-dashboard/disciplee/${disciplee.id}`)}
                className="rounded-lg border border-blue-100 bg-blue-50 p-4 hover:bg-blue-100 cursor-pointer transition text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-zinc-900">{disciplee.name}</p>
                  <span className="text-sm font-semibold text-blue-600">Phase {disciplee.currentPhase || 0}</span>
                </div>
                <p className="text-sm text-zinc-600 mb-3">{disciplee.email}</p>
                <p className="text-xs text-zinc-700 mb-2">
                  Discipler: {disciplee.discipler?.name || 'Unassigned'}
                </p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.max(5, ((disciplee.currentPhase || 0) / 10) * 100)}%` }}
                  ></div>
                </div>
                <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={selectedPlacement[disciplee.id] || disciplee.currentPhase || ''}
                    onChange={(e) =>
                      setSelectedPlacement((prev) => ({
                        ...prev,
                        [disciplee.id]: Number(e.target.value),
                      }))
                    }
                    className="rounded-lg border border-zinc-300 px-2 py-1 text-xs"
                  >
                    <option value="">Place in...</option>
                    {phaseDefinitions
                      .filter((phase) => allowedPhases.includes(phase.number))
                      .map((phase) => (
                        <option key={phase.number} value={phase.number}>
                          {phase.number}: {phase.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => placeDisciplee(disciplee.id)}
                    className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Save Placement
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Invite a New Disciplee</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Send an invitation by email. If the user already exists, they can be assigned immediately.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500"
            />
            <select
              value={invitePhase}
              onChange={(e) => setInvitePhase(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
            >
              {phaseDefinitions
                .filter((phase) => allowedPhases.includes(phase.number))
                .map((phase) => (
                  <option key={phase.number} value={phase.number}>
                    Start focus: {phase.number} - {phase.name}
                  </option>
                ))}
            </select>
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Optional invitation message"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 h-20 md:col-span-2"
            />
          </div>
          <button
            onClick={sendInvitation}
            disabled={!inviteEmail}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Send Invitation
          </button>

          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-zinc-900">Recent Invitations</h3>
            {invitations.length === 0 ? (
              <p className="text-sm text-zinc-600">No invitations yet.</p>
            ) : (
              invitations.slice(0, 6).map((invite) => (
                <div key={invite.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-sm font-medium text-zinc-900">{invite.inviteeEmail}</p>
                  <p className="text-xs text-zinc-600">Proposed phase: {invite.proposedPhase}</p>
                  <p className="text-xs text-zinc-500">Status: {invite.status}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Phase Placement Guide</h2>
          <p className="text-sm text-zinc-600 mb-4">
            Use these descriptions to prayerfully place disciplees based on current maturity and readiness.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {phaseDefinitions
              .filter((phase) => allowedPhases.includes(phase.number) || user.role === 'admin')
              .map((phase) => (
                <div key={phase.number} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-sm font-semibold text-zinc-900">{phase.number}. {phase.name}</p>
                  <p className="text-xs text-zinc-600 mt-1">{phase.description}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Pending Discipler Requests</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-zinc-600">No pending requests at this time.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{request.disciplee.name}</p>
                      <p className="text-sm text-zinc-600">{request.disciplee.email}</p>
                      <p className="text-xs text-zinc-700 mt-1">Disciplee phase: {request.disciplee.currentPhase || 0}</p>
                      {request.notes && <p className="text-xs text-zinc-600 mt-1">Notes: {request.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDisciplers[request.disciplee.id] || user.id}
                        onChange={(e) =>
                          setSelectedDisciplers((prev) => ({
                            ...prev,
                            [request.disciplee.id]: e.target.value,
                          }))
                        }
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      >
                        {disciplers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.role}) - phase {d.currentPhase || 0} - {d._count?.disciples || 0} disciples
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => assignDisciplee(request.disciplee.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Schedule Face-to-Face Meeting</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={meetingDiscipleeId}
              onChange={(e) => setMeetingDiscipleeId(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">Select disciplee</option>
              {assignedDisciplees.map((disciplee) => (
                <option key={disciplee.id} value={disciplee.id}>
                  {disciplee.name} (phase {disciplee.currentPhase || 0})
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={meetingDateTime}
              onChange={(e) => setMeetingDateTime(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              placeholder="Location"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm md:col-span-2"
            />
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Optional notes"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm h-20 md:col-span-2"
            />
          </div>
          <button
            onClick={scheduleMeeting}
            disabled={!meetingDiscipleeId || !meetingDateTime || !meetingLocation}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Create Meeting
          </button>

          <div className="mt-6 space-y-3">
            {meetings.length === 0 ? (
              <p className="text-sm text-zinc-600">No meetings scheduled yet.</p>
            ) : (
              meetings.slice(0, 8).map((meeting) => (
                <div key={meeting.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900">{meeting.title}</p>
                    <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-1">{meeting.status}</span>
                  </div>
                  <p className="text-sm text-zinc-700 mt-1">{new Date(meeting.scheduledFor).toLocaleString()}</p>
                  <p className="text-xs text-zinc-600">{meeting.location}</p>
                  <p className="text-xs text-zinc-700 mt-1">Disciplee: {meeting.disciplee?.name}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Customize Study Material
            </h2>
            <p className="text-sm text-zinc-600 mb-4">
              Edit this week's study content or create new materials tailored to your disciplees' needs.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Scripture Reference
                </label>
                <input
                  type="text"
                  defaultValue="John 1:1-14"
                  placeholder="e.g., John 1:1-14"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Study Title
                </label>
                <input
                  type="text"
                  defaultValue="The Word Made Flesh"
                  placeholder="e.g., The Word Made Flesh"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-900 mb-2">
                  Main Focus
                </label>
                <textarea
                  defaultValue="Study the opening of John's Gospel to understand Jesus as God's Word."
                  placeholder="What is the main teaching goal?"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none h-16"
                ></textarea>
              </div>
              <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Save Custom Material
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Customize Reflection Questions
            </h2>
            <p className="text-sm text-zinc-600 mb-4">
              Tailor the reflection questions to match your disciplees' spiritual journey.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-zinc-900 mb-1 block">Question 1</label>
                <textarea
                  defaultValue="Who is 'the Word' according to verses 1-3?"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none h-12"
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900 mb-1 block">Question 2</label>
                <textarea
                  defaultValue="What does verse 14 teach about Jesus becoming human?"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none h-12"
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900 mb-1 block">Question 3</label>
                <textarea
                  defaultValue="How does this passage impact your understanding of who Jesus is?"
                  className="w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none h-12"
                ></textarea>
              </div>
              <button className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Update Questions
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[
                { user: 'Michael Johnson', action: 'Completed John 1:1-14 study', time: '2 hours ago' },
                { user: 'Sarah Williams', action: 'Submitted prayer reflection', time: '5 hours ago' },
                { user: 'David Chen', action: 'Started new lesson', time: '1 day ago' },
              ].map((activity, idx) => (
                <div key={idx} className="border-l-2 border-blue-300 pl-4 pb-3">
                  <p className="text-sm font-semibold text-zinc-900">{activity.user}</p>
                  <p className="text-xs text-zinc-600">{activity.action}</p>
                  <p className="text-xs text-zinc-400 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
