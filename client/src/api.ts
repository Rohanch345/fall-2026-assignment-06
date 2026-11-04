// Thin, typed wrapper around the provided REST API.

export type Article = {
  articleId: number;
  title: string;
  contents: string;
};

export type Comment = {
  commentId: number;
  articleId: number;
  body: string;
};

export type ArticleInput = Pick<Article, 'title' | 'contents'>;

const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(
      0,
      `Could not reach the server at ${API_URL}. Is the API running?`,
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // Response had no JSON body; keep the generic message.
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

const json = (data: unknown) => JSON.stringify(data);

// --- Articles ---

export function getArticles(titleContains?: string, signal?: AbortSignal) {
  const query = titleContains
    ? `?${new URLSearchParams({ title_contains: titleContains })}`
    : '';
  return request<Article[]>(`/articles${query}`, { signal });
}

export function getArticle(articleId: string | number, signal?: AbortSignal) {
  return request<Article>(`/articles/${articleId}`, { signal });
}

export function createArticle(input: ArticleInput) {
  return request<Article>('/articles', { method: 'POST', body: json(input) });
}

export function updateArticle(articleId: number, input: Partial<ArticleInput>) {
  return request<Article>(`/articles/${articleId}`, {
    method: 'PUT',
    body: json(input),
  });
}

export function deleteArticle(articleId: number) {
  return request<Article>(`/articles/${articleId}`, { method: 'DELETE' });
}

// --- Comments ---

export function getComments(articleId: number, signal?: AbortSignal) {
  return request<Comment[]>(`/articles/${articleId}/comments`, { signal });
}

export function createComment(articleId: number, body: string) {
  return request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    body: json({ body }),
  });
}

export function updateComment(
  articleId: number,
  commentId: number,
  body: string,
) {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'PUT',
    body: json({ body }),
  });
}

export function deleteComment(articleId: number, commentId: number) {
  return request<Comment>(`/articles/${articleId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

export function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
