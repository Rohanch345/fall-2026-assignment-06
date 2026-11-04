import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { errorMessage, getArticles, isAbort, type Article } from '../api.ts';
import ArticleCard from '../components/ArticleCard.tsx';
import { EmptyState, ErrorMessage, Loading } from '../components/Status.tsx';

const SEARCH_DEBOUNCE_MS = 300;

export default function ArticleListPage() {
  // The committed search term lives in the URL (?q=) so it survives
  // back/forward navigation. `input` is what's currently typed.
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [input, setInput] = useState(query);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Keep the box in sync if the URL changes (e.g. browser back button).
  useEffect(() => {
    setInput((prev) => (prev.trim() === query ? prev : query));
  }, [query]);

  // Debounce typing, then commit the term to the URL.
  useEffect(() => {
    const term = input.trim();
    if (term === query) return;
    const id = setTimeout(() => {
      setSearchParams(term ? { q: term } : {}, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [input, query, setSearchParams]);

  // Re-fetch from the API whenever the committed term changes.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getArticles(query || undefined, controller.signal)
      .then((data) => setArticles(data))
      .catch((err) => {
        if (!isAbort(err)) setError(errorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, reloadKey]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">Browse, search, and discuss.</p>
        </div>
        <Link to="/articles/new" className="btn btn--primary">
          Create article
        </Link>
      </div>

      <form
        className="search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const term = input.trim();
          setSearchParams(term ? { q: term } : {}, { replace: true });
        }}
      >
        <label htmlFor="search" className="sr-only">
          Search articles by title
        </label>
        <span className="search__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          id="search"
          type="search"
          className="input search__input"
          placeholder="Search by title…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
      </form>

      {loading ? (
        <Loading label={query ? `Searching for “${query}”…` : 'Loading articles…'} />
      ) : error ? (
        <ErrorMessage onRetry={() => setReloadKey((k) => k + 1)}>{error}</ErrorMessage>
      ) : articles.length === 0 ? (
        query ? (
          <EmptyState>No articles match “{query}”.</EmptyState>
        ) : (
          <EmptyState>
            No articles yet.{' '}
            <Link to="/articles/new" className="link">
              Write the first one
            </Link>
            .
          </EmptyState>
        )
      ) : (
        <>
          {query && (
            <p className="result-count" aria-live="polite">
              {articles.length} {articles.length === 1 ? 'result' : 'results'} for “{query}”
            </p>
          )}
          <ul className="article-list">
            {articles.map((article) => (
              <ArticleCard key={article.articleId} article={article} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
