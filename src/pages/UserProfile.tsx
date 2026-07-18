import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, getMediaUrl } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { PostGrid } from '@/components/PostGrid';
import { useToast } from '@/lib/toast';
import type { UserProfileResponse } from '@/lib/types';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get<UserProfileResponse>(
        `/profiles/${userId}?limit=60`
      );
      const sortedPosts = (res.posts ?? []).slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setData({ ...res, posts: sortedPosts });
    } catch {
      toast('Could not load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleFollow = async () => {
    if (!data || !userId) return;
    setData({
      ...data,
      isFollowing: true,
      followerCount: data.followerCount + 1,
    });
    try {
      await api.post(`/users/${userId}/follow`);
    } catch {
      setData({
        ...data,
        isFollowing: false,
        followerCount: Math.max(0, data.followerCount - 1),
      });
      toast('Could not follow user.', 'error');
    }
  };

  const handleUnfollow = async () => {
    if (!data || !userId) return;
    setData({
      ...data,
      isFollowing: false,
      followerCount: Math.max(0, data.followerCount - 1),
    });
    try {
      await api.delete(`/users/${userId}/follow`);
    } catch {
      setData({
        ...data,
        isFollowing: true,
        followerCount: data.followerCount + 1,
      });
      toast('Could not unfollow user.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="text-center py-12">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back
        </button>

        <header className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {data.profile.bioImageUrl ? (
              <img
                src={getMediaUrl(data.profile.bioImageUrl)}
                alt=""
                className="w-24 h-24 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted" />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{data.profile.name}</h1>
              <p className="text-sm text-muted-foreground">
                @{data.profile.username}
              </p>
              {data.profile.bio && (
                <p className="text-sm mt-3 whitespace-pre-wrap">
                  {data.profile.bio}
                </p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">
                    {data.followerCount}
                  </strong>{' '}
                  followers
                </span>
                <span>
                  <strong className="text-foreground">
                    {data.followingCount}
                  </strong>{' '}
                  following
                </span>
              </div>
            </div>
            <div>
              {data.isFollowing ? (
                <button
                  onClick={handleUnfollow}
                  className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition"
                >
                  Following
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                >
                  Follow
                </button>
              )}
            </div>
          </div>
        </header>

        <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3 tracking-wider">
          Posts
        </h2>
        <PostGrid posts={data.posts} emptyMessage="No posts yet" />
      </main>
    </div>
  );
}