import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { PostCard } from '@/components/PostCard';
import { useToast } from '@/lib/toast';
import { useAuth } from '@/lib/auth';
import type { Post, PostsListResponse } from '@/lib/types';

export default function HomeFeed() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get<PostsListResponse>('/feed/home?limit=50');
      const sorted = (res.posts ?? []).slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sorted);
    } catch {
      toast('Could not load feed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <button
            onClick={() => navigate('/posts/new')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            + New Post
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-3">
            <p className="text-lg">Your home feed is empty</p>
            <p className="text-sm text-muted-foreground">
              Visit{' '}
              <Link to="/discover" className="text-primary hover:underline">
                Discover
              </Link>{' '}
              to find people to follow
            </p>
            {!profile && (
              <p className="text-xs text-muted-foreground">
                Sign in to start posting
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}