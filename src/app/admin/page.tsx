'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  currentPhase: number;
}

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [phaseDefinitions, setPhaseDefinitions] = useState<any[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const userData = await res.json();
        setCurrentUser(userData);
        
        // Check if user is admin
        if (userData.role !== 'admin') {
          setError('You do not have permission to access the admin panel');
          setTimeout(() => router.push('/'), 2000);
          setLoading(false);
          return;
        }
        
        await Promise.all([fetchUsers(), fetchPhaseDefinitions()]);
      } catch (error) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchPhaseDefinitions = async () => {
    try {
      const res = await fetch('/api/discipleship/place');
      if (res.ok) {
        const data = await res.json();
        setPhaseDefinitions(data.phases || []);
      }
    } catch (err) {
      setError('Failed to load phase definitions');
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const placeDisciplee = async (userId: string) => {
    setError('');
    const phaseNumber = selectedPlacement[userId];
    if (!phaseNumber) {
      setError('Select a phase before saving placement.');
      return;
    }

    try {
      const res = await fetch('/api/discipleship/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipleeId: userId, phaseNumber }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to place disciplee');
      }
    } catch (err) {
      setError('An error occurred during placement');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (error && currentUser?.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">Redirecting you to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b border-blue-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              HBC
            </div>
            <span className="font-semibold text-zinc-900">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{currentUser?.name}</span>
            <Link
              href="/discipler-dashboard"
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Discipler View
            </Link>
            <Link
              href="/disciplee-dashboard"
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Disciplee View
            </Link>
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
        <h1 className="text-3xl font-semibold text-zinc-900 mb-8">User Management</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-blue-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Phase</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Placement</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-blue-100 hover:bg-blue-50">
                  <td className="px-6 py-4 text-sm text-zinc-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-700">{user.currentPhase || 0}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="rounded-lg border border-blue-200 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value="disciplee">Disciplee</option>
                      <option value="discipler">Discipler</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'disciplee' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedPlacement[user.id] || user.currentPhase || ''}
                          onChange={(e) =>
                            setSelectedPlacement((prev) => ({
                              ...prev,
                              [user.id]: Number(e.target.value),
                            }))
                          }
                          className="rounded-lg border border-blue-200 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Select phase...</option>
                          {phaseDefinitions.map((phase) => (
                            <option key={phase.number} value={phase.number}>
                              {phase.number}: {phase.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => placeDisciplee(user.id)}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => updateRole(user.id, user.role === 'discipler' ? 'disciplee' : 'discipler')}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-3xl border border-blue-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Phase Descriptions (Placement Guide)</h2>
          <p className="text-sm text-zinc-600 mb-4">Admins can place disciplees across all phases, including leadership phases beyond 6.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {phaseDefinitions.map((phase) => (
              <div key={phase.number} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">{phase.number}. {phase.name}</p>
                <p className="text-xs text-zinc-600 mt-1">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
