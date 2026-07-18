import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { AuthGuard, ProfileGuard, AdminGuard } from '@/components/ProtectedRoute';

import Root from '@/pages/Root';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import HomeFeed from '@/pages/HomeFeed';
import Discover from '@/pages/Discover';
import PostDetail from '@/pages/PostDetail';
import CreatePost from '@/pages/CreatePost';
import EditPost from '@/pages/EditPost';
import UserProfile from '@/pages/UserProfile';
import MyProfile from '@/pages/MyProfile';
import EditProfile from '@/pages/EditProfile';
import Notifications from '@/pages/Notifications';
import Billing from '@/pages/Billing';
import Settings from '@/pages/Settings';
import SearchResults from '@/pages/SearchResults';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminModerationQueue from '@/pages/AdminModerationQueue';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Root />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Auth-only (onboarding allowed) */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard>
                <Onboarding />
              </AuthGuard>
            }
          />

          {/* Auth + profile required */}
          <Route
            path="/home"
            element={
              <ProfileGuard>
                <HomeFeed />
              </ProfileGuard>
            }
          />
          <Route
            path="/discover"
            element={
              <ProfileGuard>
                <Discover />
              </ProfileGuard>
            }
          />
          <Route
            path="/posts/new"
            element={
              <ProfileGuard>
                <CreatePost />
              </ProfileGuard>
            }
          />
          <Route
            path="/posts/:postId"
            element={
              <ProfileGuard>
                <PostDetail />
              </ProfileGuard>
            }
          />
          <Route
            path="/posts/:postId/edit"
            element={
              <ProfileGuard>
                <EditPost />
              </ProfileGuard>
            }
          />
          <Route
            path="/users/:userId"
            element={
              <ProfileGuard>
                <UserProfile />
              </ProfileGuard>
            }
          />
          <Route
            path="/me"
            element={
              <ProfileGuard>
                <MyProfile />
              </ProfileGuard>
            }
          />
          <Route
            path="/me/profile/edit"
            element={
              <ProfileGuard>
                <EditProfile />
              </ProfileGuard>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProfileGuard>
                <Notifications />
              </ProfileGuard>
            }
          />
          <Route
            path="/billing"
            element={
              <ProfileGuard>
                <Billing />
              </ProfileGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <ProfileGuard>
                <Settings />
              </ProfileGuard>
            }
          />
          <Route
            path="/search"
            element={
              <ProfileGuard>
                <SearchResults />
              </ProfileGuard>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <AdminGuard>
                <AdminModerationQueue />
              </AdminGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Root />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}