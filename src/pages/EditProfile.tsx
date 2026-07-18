import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { api, uploadFile, getMediaUrl, ApiError } from '@/lib/api';
import { Nav } from '@/components/Nav';
import type { MeProfileResponse } from '@/lib/types';

export default function EditProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.bioImageUrl ?? '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<MeProfileResponse>('/me/profile')
      .then((res) => {
        setDisplayName(res.profile.name);
        setUsername(res.profile.username);
        setBio(res.profile.bio);
        setAvatarUrl(res.profile.bioImageUrl);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          navigate('/onboarding', { replace: true });
        } else {
          toast('Could not load profile.', 'error');
        }
      });
  }, [navigate, toast]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadFile<{ media: { url: string } }>(
        '/media/upload',
        file,
        { mimeType: file.type }
      );
      setAvatarUrl(res.media.url);
    } catch {
      toast('Avatar upload failed.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const { updateProfile } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) return;
    setSubmitting(true);
    try {
      await updateProfile({
        name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        bioImageUrl: avatarUrl,
      });
      navigate('/me', { replace: true });
    } catch {
      toast('Could not save profile.', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <button
            onClick={() => navigate('/me')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-center">
            <label
              htmlFor="avatar"
              className="cursor-pointer w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition"
            >
              {avatarUrl ? (
                <img
                  src={getMediaUrl(avatarUrl)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground text-center px-2">
                  {uploadingAvatar ? 'Uploading…' : 'Upload'}
                </span>
              )}
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              required
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              maxLength={500}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || uploadingAvatar}
            className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}