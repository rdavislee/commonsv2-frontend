import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, uploadFile, getMediaUrl } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useToast } from '@/lib/toast';
import type { Post } from '@/lib/types';

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [supportersOnly, setSupportersOnly] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const res = await uploadFile<{ media: { url: string } }>(
        '/media/upload',
        file,
        { mimeType: file.type }
      );
      setUploadedUrl(res.media.url);
    } catch {
      toast('Photo upload failed.', 'error');
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedUrl || !caption.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ post: Post }>('/posts', {
        caption: caption.trim(),
        imageUrl: uploadedUrl,
        supportersOnly,
      });
      navigate(`/posts/${res.post._id}`, { replace: true });
    } catch {
      toast('Could not create post.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">New Post</h1>
          <button
            onClick={() => navigate('/home')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Photo</label>
            <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full max-h-[500px] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setUploadedUrl(null);
                    }}
                    className="absolute top-2 right-2 px-2 py-1 rounded-md bg-background/80 text-foreground text-xs"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="block aspect-square flex items-center justify-center cursor-pointer hover:bg-muted/50"
                >
                  <span className="text-muted-foreground text-sm">
                    {uploading ? 'Uploading…' : 'Click to upload photo'}
                  </span>
                </label>
              )}
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {uploadedUrl && (
              <p className="text-xs text-green-600">Upload complete</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="caption" className="text-sm font-medium">
              Caption
            </label>
            <textarea
              id="caption"
              required
              maxLength={2000}
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={supportersOnly}
              onChange={(e) => setSupportersOnly(e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <span className="text-sm">
              Supporters only{' '}
              <span className="text-muted-foreground">
                (only subscribers can view)
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !uploadedUrl || !caption.trim()}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </form>
      </main>
    </div>
  );
}