import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useToast } from '@/lib/toast';
import { getMediaUrl } from '@/lib/api';
import type { NotificationsResponse, Notification } from '@/lib/types';

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get<NotificationsResponse>('/me/notifications');
      const sorted = (res.notifications ?? []).slice().sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    } catch {
      toast('Could not load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast('Could not mark notification as read.', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/me/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  const goToTarget = (n: Notification) => {
    if (!n.read) handleMarkRead(n._id);
    if (n.type === 'follow' && n.actorId) {
      navigate(`/users/${n.actorId}`);
    } else if (n.targetPostId) {
      navigate(`/posts/${n.targetPostId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={
                  'p-3 flex items-start gap-3 hover:bg-muted/40 transition cursor-pointer ' +
                  (!n.read ? 'bg-primary/5' : '')
                }
                onClick={() => goToTarget(n)}
              >
                {n.actor?.bioImageUrl && (
                  <img
                    src={getMediaUrl(n.actor.bioImageUrl)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {n.actor?.name ?? 'Someone'}
                    </span>{' '}
                    {n.type === 'like' && 'liked your post'}
                    {n.type === 'comment' && 'commented on your post'}
                    {n.type === 'follow' && 'started following you'}
                  </p>
                  {n.targetPost && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {n.targetPost.caption || '(post)'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}