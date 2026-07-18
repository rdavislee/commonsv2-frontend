import { Navigate } from 'react-router-dom';
import { useAuthStatus } from '@/lib/auth';

export default function Root() {
  const { status, isAuthenticated, hasProfile } = useAuthStatus();
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasProfile) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/home" replace />;
}