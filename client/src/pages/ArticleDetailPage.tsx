import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ApiError,
  deleteArticle,
  errorMessage,
  getArticle,
  isAbort,
  type Article,
} from '../api.ts';
import CommentsSection from '../components/CommentsSection.tsx';
import { ErrorMessage, Loading } from '../components/Status.tsx';
import NotFoundPage from './NotFoundPage.tsx';

export default function ArticleDetailPage() {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getArticle(articleId!, controller.signal)
      .then((data) => setArticle(data))
      .catch((err) => {
        if (!isAbort(err)) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [articleId, reloadKey]);

  async function handleDelete() {
    if (!article) return;
    if (!window.confirm(`Delete “${article.title}”? This also deletes its comments.`)) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteArticle(article.articleId);
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  }

  if (loading) return <Loading label="Loading article…" />;

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage message="That article doesn’t exist or was deleted." />;
  }

  if (error || !article) {
    return (
      <ErrorMessage onRetry={() => setReloadKey((k) => k + 1)}>
        {error?.message ?? 'Could not load this article.'}
      </ErrorMessage>
    );
  }

  return (
    <>
      <Link to="/" className="back-link">
        ← All articles
      </Link>

      <article className="card article">
        <header className="article__header">
          <h1 className="article__title">{article.title}</h1>
          <div className="article__actions">
            <Link to={`/articles/${article.articleId}/edit`} className="btn btn--ghost btn--sm">
              Edit
            </Link>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </header>
        {deleteError && <ErrorMessage>{deleteError}</ErrorMessage>}
        <div className="article__contents">{article.contents}</div>
      </article>

      <CommentsSection articleId={article.articleId} />
    </>
  );
}
