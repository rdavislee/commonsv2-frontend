import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getMediaUrl } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';
import { useToast } from '@/lib/toast';
import type {
  PostsListResponse,
  MembersResponse,
  ModerationQueueResponse,
  Post,
  Member,
} from '@/lib/types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, membersRes, queueRes] = await Promise.all([
        api.get<PostsListResponse>('/admin/dashboard/recent-posts?limit=20'),
        api.get<MembersResponse>('/admin/dashboard/recent-members?limit=20'),
        api.get<ModerationQueueResponse>(
          '/admin/moderation/queue?limit=50'
        ),
      ]);
      setPosts(postsRes.posts ?? []);
      setMembers(membersRes.members ?? []);
      setQueueCount((queueRes.items ?? []).length);
    } catch {
      toast('Could not load dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (postId: string) => {
    if (!confirm('Remove this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      await fetchData();
    } catch {
      toast('Could not remove post.', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-700',
    admin_approved: 'bg-green-500/20 text-green-700',
    pending: 'bg-amber-500/20 text-amber-700',
    flagged: 'bg-destructive/20 text-destructive',
    admin_removed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link
            to="/admin/moderation"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-card border border-border hover:bg-muted/40 transition"
          >
            <span className="text-sm font-medium">Moderation Queue</span>
            {queueCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full">
                {queueCount}
              </span>
            )}
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading…
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                Recent Posts
              </h2>
              {posts.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                  No posts yet
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="p-3 flex items-center gap-3"
                    >
                      {post.content.imageUrl && (
                        <Link
                          to={`/posts/${post._id}`}
                          className="flex-shrink-0"
                        >
                          <img
                            src={getMediaUrl(post.content.imageUrl)}
                            alt=""
                            className="w-14 h-14 object-cover rounded border border-border"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/posts/${post._id}`}
                          className="text-sm font-medium line-clamp-1 hover:underline"
                        >
                          {post.content.caption || '(no caption)'}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>
                            by{' '}
                            {post.author ? (
                              <Link
                                to={`/users/${post.authorId}`}
                                className="hover:underline"
                              >
                                {post.author.name}
                              </Link>
                            ) : (
                              '[deleted]'
                            )}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span
                            className={
                              'px-1.5 py-0.5 rounded text-[10px] ' +
                              (statusColors[post.moderationStatus] ??
                                'bg-muted text-muted-foreground')
                            }
                          >
                            {post.moderationStatus}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(post._id)}
                        className="px-2 py-1 rounded text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3">
                Recent Members
              </h2>
              {members.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                  No members yet
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg divide-y divide-border">
                  {members.map((m) => (
                    <Link
                      key={m.userId}
                      to={`/users/${m.userId}`}
                      className="p-3 flex items-center gap-3 hover:bg-muted/40 transition"
                    >
                      {m.avatarUrl ? (
                        <img
                          src={getMediaUrl(m.avatarUrl)}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {m.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined{' '}
                          {new Date(m.joinedAt).toLocaleDateString()} ·{' '}
                          {m.followerCount} followers
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}