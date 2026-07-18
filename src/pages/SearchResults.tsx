import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api, getMediaUrl } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { useToast } from '@/lib/toast';
import type { Profile, ProfilesSearchResponse } from '@/lib/types';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<ProfilesSearchResponse>(
        `/profiles/search?query=${encodeURIComponent(q.trim())}&limit=30`
      );
      setResults(res.profiles ?? []);
    } catch {
      toast('Search failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { query } : {});
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Search Users</h1>
        <form onSubmit={onSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username"
            className="flex-1 px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Search
          </button>
        </form>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Searching…
          </div>
        ) : !initialQuery ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Enter a name to search.
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No users found.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {results.map((p) => (
              <Link
                key={p._id}
                to={`/users/${p.userId}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/40 transition"
              >
                {p.bioImageUrl ? (
                  <img
                    src={getMediaUrl(p.bioImageUrl)}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    @{p.username}
                  </div>
                  {p.bio && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {p.bio}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}