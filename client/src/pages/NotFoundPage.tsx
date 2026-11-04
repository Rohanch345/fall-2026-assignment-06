import { Link } from 'react-router';

export default function NotFoundPage({
  message = 'We couldn’t find the page you were looking for.',
}: {
  message?: string;
}) {
  return (
    <div className="card not-found">
      <p className="not-found__code">404</p>
      <h1 className="page-title">Not found</h1>
      <p className="page-subtitle">{message}</p>
      <Link to="/" className="btn btn--primary">
        Back to articles
      </Link>
    </div>
  );
}
