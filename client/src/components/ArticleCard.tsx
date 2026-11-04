import { Link } from 'react-router';
import type { Article } from '../api.ts';

const PREVIEW_LENGTH = 160;

function preview(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= PREVIEW_LENGTH) return flat;
  return flat.slice(0, PREVIEW_LENGTH).replace(/\s+\S*$/, '') + '…';
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <li className="card article-card">
      <h2 className="article-card__title">
        <Link to={`/articles/${article.articleId}`} className="article-card__link">
          {article.title}
        </Link>
      </h2>
      <p className="article-card__preview">{preview(article.contents)}</p>
      <span className="article-card__cta" aria-hidden="true">
        Read article →
      </span>
    </li>
  );
}
