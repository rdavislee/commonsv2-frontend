import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getMediaUrl } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { PostGrid } from '@/components/PostGrid';
import { useAuth } from '@/lib/auth';
import type { MeProfileResponse, PostsListResponse, Post } from '@/lib/types';

export default function MyProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [meRes, setMeRes] = useState<MeProfileResponse | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<MeProfileResponse>('/me/profile'),
      api.get<PostsListResponse>('/me/posts?limit=60'),
    ])
      .then(([profileRes, postsRes]) => {
        setMeRes(profileRes);
        const sortedPosts = (postsRes.posts ?? []).slice().sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sortedPosts);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !meRes) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <header className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {profile?.bioImageUrl ? (
              <img
                src={getMediaUrl(profile.bioImageUrl)}
                alt=""
                className="w-24 h-24 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-sm text-muted-foreground">
                @{profile?.username}
              </p>
              {profile?.bio && (
                <p className="text-sm mt-3 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {meRes.followerCount}
                  </strong>{' '}
                  followers
                </span>
                <span>
                  <strong className="text-foreground">
                    {meRes.followingCount}
                  </strong>{' '}
                  following
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/me/profile/edit"
                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => navigate('/posts/new')}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
              >
                + New Post
              </button>
            </div>
          </div>
        </header>

        <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3 tracking-wider">
          Your Posts
        </h2>
        <PostGrid posts={posts} emptyMessage="You haven't posted yet" />
      </main>
    </div>
  );
}