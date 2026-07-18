import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useToast } from '@/lib/toast';
import type { SubscriptionResponse } from '@/lib/types';

export default function Billing() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get<SubscriptionResponse>('/me/subscription');
      setData(res);
    } catch {
      toast('Could not load subscription.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verify checkout return
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      api
        .post<{ status: string; active: boolean; applied: boolean }>(
          '/subscription/verify',
          { sessionId }
        )
        .then(() => {
          // strip query param so refresh doesn't re-verify
          const next = new URLSearchParams(searchParams);
          next.delete('session_id');
          setSearchParams(next, { replace: true });
          fetchData();
        })
        .catch(() => {
          toast('Could not verify checkout.', 'error');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleCheckout = async () => {
    setWorking(true);
    try {
      const successUrl = `${window.location.origin}/billing?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/billing`;
      const res = await api.post<{ sessionId: string; url: string }>(
        '/subscription/checkout',
        { successUrl, cancelUrl }
      );
      // Full-page redirect to Stripe-hosted checkout
      window.location.assign(res.url);
    } catch {
      toast('Could not start checkout.', 'error');
      setWorking(false);
    }
  };

  const handlePortal = async () => {
    setWorking(true);
    try {
      const res = await api.post<{ url: string }>('/subscription/portal');
      window.location.assign(res.url);
    } catch {
      toast('Could not open billing portal.', 'error');
      setWorking(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel subscription at end of current period?')) return;
    setWorking(true);
    try {
      await api.post('/subscription/cancel', { atPeriodEnd: true });
      await fetchData();
      toast('Subscription will end at period close.', 'success');
    } catch {
      toast('Could not cancel subscription.', 'error');
    } finally {
      setWorking(false);
    }
  };

  const sub = data?.subscription;
  const hasAccess = data?.hasActiveAccess ?? false;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Billing</h1>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="font-semibold">Supporter plan</h2>
              <p className="text-sm text-muted-foreground">
                Become a supporter to unlock supporters-only content from
                creators.
              </p>

              {!hasAccess && !sub && (
                <button
                  onClick={handleCheckout}
                  disabled={working}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {working ? 'Loading…' : 'Become a Supporter'}
                </button>
              )}

              {sub && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        'inline-block text-xs px-2 py-0.5 rounded-full font-medium ' +
                        (hasAccess
                          ? 'bg-green-500/20 text-green-700'
                          : 'bg-muted text-muted-foreground')
                      }
                    >
                      {sub.status}
                      {hasAccess ? ' · active' : ''}
                    </span>
                    {sub.cancelAtPeriodEnd && (
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                        Ending at period close
                      </span>
                    )}
                  </div>
                  {sub.currentPeriodEnd && (
                    <p className="text-sm text-muted-foreground">
                      {sub.cancelAtPeriodEnd
                        ? 'Access until'
                        : 'Renews on'}
                      :{' '}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                  {sub.startedAt && (
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(sub.startedAt).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {hasAccess && (
                      <>
                        <button
                          onClick={handlePortal}
                          disabled={working}
                          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 transition"
                        >
                          Manage Billing
                        </button>
                        {!sub.cancelAtPeriodEnd && (
                          <button
                            onClick={handleCancel}
                            disabled={working}
                            className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition"
                          >
                            Cancel Subscription
                          </button>
                        )}
                      </>
                    )}
                    {!hasAccess && (
                      <button
                        onClick={handleCheckout}
                        disabled={working}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                      >
                        {working ? 'Loading…' : 'Become a Supporter'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}