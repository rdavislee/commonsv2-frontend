import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function AdminNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ items: unknown[] }>('/admin/moderation/queue?limit=1')
      .then((res) => {
        if (!cancelled) setQueueCount(res.items?.length ?? 0);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link to="/admin" className="text-lg font-bold tracking-tight">
            Commons Admin
          </Link>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/moderation"
            className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
          >
            Moderation Queue
            {queueCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full">
                {queueCount}
              </span>
            )}
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-destructive transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}