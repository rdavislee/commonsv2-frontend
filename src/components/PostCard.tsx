import { Link } from 'react-router-dom';
import { LockedPlaceholder } from './LockedPlaceholder';
import type { Post } from '@/lib/types';
import { getMediaUrl } from '@/lib/api';

interface Props {
  post: Post;
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  showAuthor?: boolean;
}

export function PostCard({ post, onLike, onUnlike, showAuthor = true }: Props) {
  const imgSrc = post.content.imageUrl ? getMediaUrl(post.content.imageUrl) : null;

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {showAuthor && (
        <header className="p-3 flex items-center gap-3">
          {post.author ? (
            <Link
              to={`/users/${post.authorId}`}
              className="flex items-center gap-2 hover:opacity-80"
            >
              {post.author.bioImageUrl ? (
                <img
                  src={getMediaUrl(post.author.bioImageUrl)}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted" />
              )}
              <span className="font-semibold text-sm">{post.author.name}</span>
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">[deleted]</span>
          )}
          {post.content.supportersOnly && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Supporters
            </span>
          )}
        </header>
      )}

      <Link to={`/posts/${post._id}`} className="block">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className="w-full aspect-square object-cover bg-muted"
          />
        ) : post.isLocked ? (
          <LockedPlaceholder />
        ) : (
          <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </Link>

      <div className="p-3 space-y-2">
        {post.content.caption && (
          <p className="text-sm whitespace-pre-wrap line-clamp-3">
            {post.content.caption}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (post.isLiked) onUnlike?.(post._id);
              else onLike?.(post._id);
            }}
            className="flex items-center gap-1.5 hover:text-foreground transition"
          >
            <span className="text-base">{post.isLiked ? '♥' : '♡'}</span>
            <span>{post.likeCount}</span>
          </button>
          <Link
            to={`/posts/${post._id}`}
            className="flex items-center gap-1.5 hover:text-foreground transition"
          >
            <span className="text-base">💬</span>
            <span>{post.commentCount}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}