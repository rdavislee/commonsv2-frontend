import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, getMediaUrl, ApiError } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { LockedPlaceholder } from '@/components/LockedPlaceholder';
import { useToast } from '@/lib/toast';
import type { Post, Comment, PostDetailResponse, MeResponse } from '@/lib/types';

const ruleLabels: Record<string, string> = {
  harassment: 'Harassment',
  hate: 'Hate',
  sexually_explicit: 'Sexually explicit material',
  spam: 'Spam',
};

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchData = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [postRes, meRes] = await Promise.all([
        api.get<PostDetailResponse>(`/posts/${postId}`),
        api.get<MeResponse>('/me'),
      ]);
      setPost(postRes.post);
      const sortedComments = (postRes.comments ?? []).slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComments(sortedComments);
      setMe(meRes);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setPost(null);
      } else {
        toast('Could not load post.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    setPost({ ...post, isLiked: true, likeCount: post.likeCount + 1 });
    try {
      const res = await api.post<{ likeCount: number; isLiked: boolean }>(
        `/posts/${post._id}/like`
      );
      setPost((p) => (p ? { ...p, likeCount: res.likeCount, isLiked: true } : p));
    } catch {
      setPost((p) =>
        p
          ? { ...p, isLiked: false, likeCount: Math.max(0, p.likeCount - 1) }
          : p
      );
      toast('Could not like post.', 'error');
    }
  };

  const handleUnlike = async () => {
    if (!post) return;
    setPost({
      ...post,
      isLiked: false,
      likeCount: Math.max(0, post.likeCount - 1),
    });
    try {
      const res = await api.delete<{ likeCount: number; isLiked: boolean }>(
        `/posts/${post._id}/like`
      );
      setPost((p) =>
        p ? { ...p, likeCount: res.likeCount, isLiked: false } : p
      );
    } catch {
      setPost((p) =>
        p ? { ...p, isLiked: true, likeCount: p.likeCount + 1 } : p
      );
      toast('Could not unlike post.', 'error');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await api.post(`/posts/${postId}/comments`, { text: commentText.trim() });
      setCommentText('');
      await fetchData();
    } catch {
      toast('Could not post comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      await fetchData();
    } catch {
      toast('Could not delete comment.', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      navigate('/home', { replace: true });
    } catch {
      toast('Could not delete post.', 'error');
    }
  };

  const handleAdminRemove = async () => {
    if (!post) return;
    if (!confirm('Remove this post?')) return;
    try {
      await api.delete(`/admin/posts/${post._id}`);
      navigate('/admin', { replace: true });
    } catch {
      toast('Could not remove post.', 'error');
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

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = me?.isAdmin ?? false;
  const imgSrc = post.content.imageUrl ? getMediaUrl(post.content.imageUrl) : null;
  const isBlocked =
    post.moderationStatus === 'flagged' ||
    post.moderationStatus === 'pending';

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back
        </button>

        <article className="bg-card border border-border rounded-lg overflow-hidden">
          {isBlocked ? (
            <div className="p-6 bg-destructive/10 border-b border-destructive/30">
              <h2 className="font-semibold text-destructive mb-2">
                This post was flagged
              </h2>
              <p className="text-sm">
                Your post violated our community guideline:{' '}
                <span className="font-medium">
                  {post.moderationRuleViolated
                    ? ruleLabels[post.moderationRuleViolated]
                    : 'Content policy'}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                It is hidden from public feeds. You can edit and resubmit, or
                delete it.
              </p>
            </div>
          ) : imgSrc ? (
            <img
              src={imgSrc}
              alt=""
              className="w-full max-h-[600px] object-cover bg-muted"
            />
          ) : post.isLocked ? (
            <LockedPlaceholder className="h-[400px]" />
          ) : (
            <div className="w-full aspect-square bg-muted" />
          )}

          <div className="p-4 space-y-3">
            {post.author ? (
              <Link
                to={`/users/${post.authorId}`}
                className="flex items-center gap-3 hover:opacity-80"
              >
                {post.author.bioImageUrl && (
                  <img
                    src={getMediaUrl(post.author.bioImageUrl)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                )}
                <div>
                  <div className="font-semibold text-sm">{post.author.name}</div>
                  <div className="text-xs text-muted-foreground">
                    @{post.author.username}
                  </div>
                </div>
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">[deleted]</span>
            )}

            {!isBlocked && post.content.caption && (
              <p className="text-sm whitespace-pre-wrap">{post.content.caption}</p>
            )}

            {post.content.supportersOnly && !isBlocked && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Supporters only
              </span>
            )}

            {!isBlocked && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                <button
                  onClick={post.isLiked ? handleUnlike : handleLike}
                  className="flex items-center gap-1.5 hover:text-foreground transition pt-2"
                >
                  <span className="text-base">{post.isLiked ? '♥' : '♡'}</span>
                  <span>{post.likeCount}</span>
                </button>
                <span className="flex items-center gap-1.5 pt-2">
                  <span className="text-base">💬</span>
                  <span>{post.commentCount}</span>
                </span>
              </div>
            )}

            {(post.isOwner || isAdmin) && (
              <div className="flex gap-2 pt-2 border-t border-border">
                {post.isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/posts/${post._id}/edit`)}
                      className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
                {isAdmin && !post.isOwner && (
                  <button
                    onClick={handleAdminRemove}
                    className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs font-medium hover:bg-destructive/90 transition"
                  >
                    Admin Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </article>

        {!isBlocked && (
          <section className="mt-6 space-y-4">
            <h2 className="font-semibold">Comments</h2>
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Be the first to comment.
              </p>
            )}
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className="bg-card border border-border rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center gap-2 text-sm">
                    {c.author?.bioImageUrl && (
                      <img
                        src={getMediaUrl(c.author.bioImageUrl)}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{c.author?.name ?? '[deleted]'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {c.moderationStatus === 'flagged' && c.isOwner ? (
                    <p className="text-xs text-destructive">
                      Your comment was blocked for:{' '}
                      {c.moderationRuleViolated
                        ? ruleLabels[c.moderationRuleViolated]
                        : 'Content policy'}
                    </p>
                  ) : c.moderationStatus === 'pending' && c.isOwner ? (
                    <p className="text-xs text-amber-600">
                      Your comment is pending review.
                    </p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                  )}
                  {c.isOwner && c.moderationStatus !== 'admin_removed' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitComment} className="space-y-2 pt-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                rows={2}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {submittingComment ? 'Posting…' : 'Post'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}