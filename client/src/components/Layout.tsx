import { Link, Outlet } from 'react-router';

export default function Layout() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              ¶
            </span>
            The Article Desk
          </Link>
          <Link to="/articles/new" className="btn btn--primary btn--sm">
            + New article
          </Link>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
    </div>
  );
}
