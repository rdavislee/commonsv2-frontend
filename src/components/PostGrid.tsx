import { Link } from 'react-router-dom';
import { LockedPlaceholder } from './LockedPlaceholder';
import type { Post } from '@/lib/types';
import { getMediaUrl } from '@/lib/api';

interface Props {
  posts: Post[];
  emptyMessage?: string;
}

const ruleLabels: Record<string, string> = {
  harassment: 'Harassment',
  hate: 'Hate',
  sexually_explicit: 'Sexually explicit',
  spam: 'Spam',
};

export function PostGrid({ posts, emptyMessage = 'No posts yet' }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {posts.map((post) => {
        const imgSrc = post.content.imageUrl
          ? getMediaUrl(post.content.imageUrl)
          : null;
        const isBlocked = post.moderationStatus === 'flagged';
        const isPending = post.moderationStatus === 'pending';
        return (
          <Link
            key={post._id}
            to={`/posts/${post._id}`}
            className="relative block aspect-square bg-muted overflow-hidden group"
          >
            {imgSrc ? (
              <img
                src={imgSrc}
                alt=""
                className="w-full h-full object-cover group-hover:opacity-90 transition"
              />
            ) : post.isLocked ? (
              <LockedPlaceholder />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No image
              </div>
            )}
            {(isBlocked || isPending) && (
              <div className="absolute top-1 right-1">
                <span
                  className={
                    'text-[10px] px-1.5 py-0.5 rounded ' +
                    (isBlocked
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-amber-500 text-white')
                  }
                >
                  {isBlocked
                    ? `Blocked${
                        post.moderationRuleViolated
                          ? ': ' + ruleLabels[post.moderationRuleViolated]
                          : ''
                      }`
                    : 'Pending'}
                </span>
              </div>
            )}
            {post.content.supportersOnly && !isBlocked && !isPending && (
              <div className="absolute top-1 right-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/90 text-primary-foreground">
                  Supporters
                </span>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}