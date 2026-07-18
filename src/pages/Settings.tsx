import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { api, clearAuthToken } from '@/lib/api';
import { Nav } from '@/components/Nav';
import type { MeResponse, MeProfileResponse } from '@/lib/types';

export default function Settings() {
  const { email, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    api
      .get<MeResponse>('/me')
      .then(setMe)
      .catch(() => {
        /* ignore */
      });
    api
      .get<MeProfileResponse>('/me/profile')
      .then(setProfile)
      .catch(() => {
        /* ignore */
      });
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Delete your account permanently? This cannot be undone. All your posts and data will be removed.'
      )
    )
      return;
    if (!confirm('Are you absolutely sure?')) return;
    try {
      await api.delete('/me');
    } catch {
      toast('Could not delete account.', 'error');
      // continue with cleanup
    }
    clearAuthToken();
    navigate('/login', { replace: true });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !oldPassword || newPassword.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        oldPassword,
        newPassword,
      });
      toast('Password updated.', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch {
      toast('Could not change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <section className="bg-card border border-border rounded-lg p-6 space-y-2">
          <h2 className="font-semibold">Account</h2>
          <div className="text-sm">
            <span className="text-muted-foreground">Email: </span>
            <span>{me?.email ?? email ?? '—'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition"
          >
            Log out
          </button>
        </section>

        <section className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="old" className="text-sm font-medium">
                Current password
              </label>
              <input
                id="old"
                type="password"
                required
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new" className="text-sm font-medium">
                New password
              </label>
              <input
                id="new"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {changingPassword ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        <section className="bg-card border border-destructive/30 rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all your data.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition"
          >
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}