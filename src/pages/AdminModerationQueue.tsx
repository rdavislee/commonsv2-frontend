import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getMediaUrl } from '@/lib/api';
import { AdminNav } from '@/components/AdminNav';
import { useToast } from '@/lib/toast';
import type {
  ModerationQueueResponse,
  ModerationQueueItem,
} from '@/lib/types';

const ruleLabels: Record<string, string> = {
  harassment: 'Harassment',
  hate: 'Hate',
  sexually_explicit: 'Sexually explicit material',
  spam: 'Spam',
};

export default function AdminModerationQueue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<ModerationQueueResponse>(
        '/admin/moderation/queue?limit=100'
      );
      setItems(res.items ?? []);
    } catch {
      toast('Could not load moderation queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (reviewId: string) => {
    setWorking(reviewId);
    try {
      await api.post(`/admin/moderation/${reviewId}/approve`);
      await fetchData();
    } catch {
      toast('Could not approve item.', 'error');
    } finally {
      setWorking(null);
    }
  };

  const handleRemove = async (reviewId: string) => {
    if (!confirm('Remove this item permanently?')) return;
    setWorking(reviewId);
    try {
      await api.post(`/admin/moderation/${reviewId}/remove`);
      await fetchData();
    } catch {
      toast('Could not remove item.', 'error');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Moderation Queue</h1>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
            No items in moderation queue
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const isPost = item.targetType === 'post';
              const postHref = isPost ? `/posts/${item.targetId}` : null;
              const authorHref = item.authorId
                ? `/users/${item.authorId}`
                : null;
              return (
                <div
                  key={item.reviewId}
                  className="bg-card border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium uppercase">
                        {item.targetType}
                      </span>
                      {item.ruleViolated && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                          {ruleLabels[item.ruleViolated] ?? item.ruleViolated}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {isPost && item.content.imageUrl && (
                    <Link to={postHref!} className="block">
                      <img
                        src={getMediaUrl(item.content.imageUrl)}
                        alt=""
                        className="w-full max-h-72 object-cover rounded border border-border"
                      />
                    </Link>
                  )}

                  {isPost && item.content.caption && (
                    <p className="text-sm whitespace-pre-wrap">
                      {item.content.caption}
                    </p>
                  )}

                  {!isPost && item.content.text && (
                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                      {item.content.text}
                    </p>
                  )}

                  <div className="text-sm bg-muted/50 p-3 rounded">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      AI rationale
                    </div>
                    <p className="text-sm">{item.rationale}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>by</span>
                      {item.author ? (
                        authorHref ? (
                          <Link
                            to={authorHref}
                            className="font-medium text-foreground hover:underline"
                          >
                            {item.author.name}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">
                            {item.author.name}
                          </span>
                        )
                      ) : (
                        <span>[deleted]</span>
                      )}
                      {isPost && (
                        <Link
                          to={postHref!}
                          className="ml-3 text-primary hover:underline"
                        >
                          Open post →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => handleApprove(item.reviewId)}
                      disabled={working === item.reviewId}
                      className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {working === item.reviewId ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.reviewId)}
                      disabled={working === item.reviewId}
                      className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition"
                    >
                      {working === item.reviewId ? '…' : 'Remove'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}