import { Navigate } from 'react-router-dom';
import { useAuthStatus } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuthStatus();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, hasProfile, isAdmin } = useAuthStatus();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // Admins without profiles can still browse the regular app
  if (!hasProfile && !isAdmin) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, isAdmin } = useAuthStatus();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}