import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';
import { getMediaUrl } from '@/lib/api';

export function Nav() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ count: number }>('/me/notifications/unread-count')
      .then((res) => {
        if (!cancelled) setUnreadCount(res.count);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Commons
          </Link>
          <Link
            to="/home"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Home
          </Link>
          <Link
            to="/discover"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Discover
          </Link>
          <Link
            to="/search"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Search
          </Link>
          <Link
            to="/notifications"
            className="text-sm text-muted-foreground hover:text-foreground transition relative"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/me"
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            {profile?.bioImageUrl ? (
              <img
                src={getMediaUrl(profile.bioImageUrl)}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-muted" />
            )}
            <span className="text-sm font-medium">{profile?.name ?? 'Me'}</span>
          </Link>
          <Link
            to="/billing"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Billing
          </Link>
          <Link
            to="/settings"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-destructive transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}