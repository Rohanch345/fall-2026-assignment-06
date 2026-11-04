import { useState, type FormEvent } from 'react';
import { errorMessage, type Comment } from '../api.ts';
import { FieldError } from './Status.tsx';

type Props = {
  comment: Comment;
  onSave: (commentId: number, body: string) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
};

export default function CommentItem({ comment, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [validation, setValidation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);

  const errorId = `comment-${comment.commentId}-error`;

  function startEdit() {
    setDraft(comment.body);
    setValidation(null);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(comment.body);
    setValidation(null);
    setError(null);
    setEditing(false);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) {
      setValidation('Comment cannot be empty.');
      return;
    }
    setBusy('saving');
    setError(null);
    try {
      await onSave(comment.commentId, body);
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setBusy('deleting');
    setError(null);
    try {
      await onDelete(comment.commentId);
      // On success the parent removes this item, so no state reset is needed.
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  if (editing) {
    return (
      <li className="comment comment--editing">
        <form onSubmit={handleSave} noValidate>
          <label htmlFor={`edit-${comment.commentId}`} className="sr-only">
            Edit comment
          </label>
          <textarea
            id={`edit-${comment.commentId}`}
            className="input textarea"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (validation) setValidation(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEdit();
            }}
            aria-invalid={!!validation}
            aria-describedby={validation ? errorId : undefined}
            autoFocus
            onFocus={(e) => {
              // Place the caret at the end so typing continues the comment.
              const end = e.currentTarget.value.length;
              e.currentTarget.setSelectionRange(end, end);
            }}
          />
          {validation && <FieldError id={errorId}>{validation}</FieldError>}
          {error && <FieldError id={`${errorId}-api`}>{error}</FieldError>}
          <div className="comment__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy !== null}>
              {busy === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`comment${busy === 'deleting' ? ' comment--busy' : ''}`}>
      <p className="comment__body">{comment.body}</p>
      {error && <FieldError id={`${errorId}-api`}>{error}</FieldError>}
      <div className="comment__actions">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={startEdit}
          disabled={busy !== null}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn--danger-ghost btn--sm"
          onClick={handleDelete}
          disabled={busy !== null}
        >
          {busy === 'deleting' ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </li>
  );
}
