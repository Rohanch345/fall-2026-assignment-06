import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ApiError, getArticle, isAbort, updateArticle, type Article } from '../api.ts';
import ArticleForm from '../components/ArticleForm.tsx';
import { ErrorMessage, Loading } from '../components/Status.tsx';
import NotFoundPage from './NotFoundPage.tsx';

export default function EditArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setArticle(null);
    setError(null);
    getArticle(articleId!, controller.signal)
      .then((data) => setArticle(data))
      .catch((err) => {
        if (!isAbort(err)) setError(err instanceof Error ? err : new Error(String(err)));
      });
    return () => controller.abort();
  }, [articleId, reloadKey]);

  if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
    return <NotFoundPage message="That article doesn’t exist or was deleted." />;
  }
  if (error) {
    return (
      <ErrorMessage onRetry={() => setReloadKey((k) => k + 1)}>{error.message}</ErrorMessage>
    );
  }
  if (!article) return <Loading label="Loading article…" />;

  const detailPath = `/articles/${article.articleId}`;

  return (
    <>
      <Link to={detailPath} className="back-link">
        ← Back to article
      </Link>
      <h1 className="page-title">Edit article</h1>
      <ArticleForm
        key={article.articleId}
        initialValues={{ title: article.title, contents: article.contents }}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        cancelTo={detailPath}
        onSubmit={async (values) => {
          const updated = await updateArticle(article.articleId, values);
          navigate(`/articles/${updated.articleId}`);
        }}
      />
    </>
  );
}
