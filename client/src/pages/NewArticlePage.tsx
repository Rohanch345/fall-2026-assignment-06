import { Link, useNavigate } from 'react-router';
import { createArticle } from '../api.ts';
import ArticleForm from '../components/ArticleForm.tsx';

export default function NewArticlePage() {
  const navigate = useNavigate();

  return (
    <>
      <Link to="/" className="back-link">
        ← All articles
      </Link>
      <h1 className="page-title">New article</h1>
      <ArticleForm
        submitLabel="Publish article"
        submittingLabel="Publishing…"
        cancelTo="/"
        onSubmit={async (values) => {
          const created = await createArticle(values);
          navigate(`/articles/${created.articleId}`);
        }}
      />
    </>
  );
}
