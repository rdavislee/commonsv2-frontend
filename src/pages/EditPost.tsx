import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useToast } from '@/lib/toast';
import type { PostDetailResponse, Post } from '@/lib/types';

export default function EditPost() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [supportersOnly, setSupportersOnly] = useState(false);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    api
      .get<PostDetailResponse>(`/posts/${postId}`)
      .then((res) => {
        setPost(res.post);
        setCaption(res.post.content.caption);
        setSupportersOnly(res.post.content.supportersOnly);
      })
      .catch((e) => {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          navigate('/login', { replace: true });
          return;
        }
        toast('Could not load post.', 'error');
      })
      .finally(() => setLoading(false));
  }, [postId, toast]);

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
        <div className="text-center py-12">Post not found</div>
      </div>
    );
  }

  if (!post.isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="text-center py-12">You can only edit your own posts.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Post</h1>
          <button
            onClick={() => navigate(`/posts/${postId}`)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[100px]"
              rows={4}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={supportersOnly}
              onChange={(e) => setSupportersOnly(e.target.checked)}
            />
            Supporters only
          </label>
        </div>
      </main>
    </div>
  );
}