import { useCallback, useEffect, useState } from 'react';
import {
  createComment,
  deleteComment,
  errorMessage,
  getComments,
  isAbort,
  updateComment,
  type Comment,
} from '../api.ts';
import CommentItem from './CommentItem.tsx';
import CommentForm from './CommentForm.tsx';
import { EmptyState, ErrorMessage, Loading } from './Status.tsx';

export default function CommentsSection({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getComments(articleId, controller.signal)
      .then((data) => setComments(data))
      .catch((err) => {
        if (!isAbort(err)) setError(errorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [articleId, reloadKey]);

  const handleAdd = useCallback(
    async (body: string) => {
      const created = await createComment(articleId, body);
      setComments((prev) => [...prev, created]);
    },
    [articleId],
  );

  const handleSave = useCallback(
    async (commentId: number, body: string) => {
      const updated = await updateComment(articleId, commentId, body);
      setComments((prev) =>
        prev.map((c) => (c.commentId === commentId ? updated : c)),
      );
    },
    [articleId],
  );

  const handleDelete = useCallback(
    async (commentId: number) => {
      await deleteComment(articleId, commentId);
      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    },
    [articleId],
  );

  return (
    <section className="comments" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="comments__heading">
        Comments
        {!loading && !error && (
          <span className="count-badge">{comments.length}</span>
        )}
      </h2>

      {loading ? (
        <Loading label="Loading comments…" />
      ) : error ? (
        <ErrorMessage onRetry={() => setReloadKey((k) => k + 1)}>{error}</ErrorMessage>
      ) : comments.length === 0 ? (
        <EmptyState>No comments yet. Be the first to share your thoughts.</EmptyState>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {!error && <CommentForm onSubmit={handleAdd} />}
    </section>
  );
}
