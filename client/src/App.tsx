import { Route, Routes } from 'react-router';
import Layout from './components/Layout.tsx';
import ArticleListPage from './pages/ArticleListPage.tsx';
import ArticleDetailPage from './pages/ArticleDetailPage.tsx';
import NewArticlePage from './pages/NewArticlePage.tsx';
import EditArticlePage from './pages/EditArticlePage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ArticleListPage />} />
        <Route path="articles/new" element={<NewArticlePage />} />
        <Route path="articles/:articleId" element={<ArticleDetailPage />} />
        <Route path="articles/:articleId/edit" element={<EditArticlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
