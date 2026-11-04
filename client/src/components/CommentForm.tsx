import { useState, type FormEvent } from 'react';
import { errorMessage } from '../api.ts';
import { FieldError } from './Status.tsx';

export default function CommentForm({
  onSubmit,
}: {
  onSubmit: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) {
      setValidation('Please write something before posting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setBody('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="new-comment" className="field__label">
        Add a comment
      </label>
      <textarea
        id="new-comment"
        className="input textarea"
        placeholder="Share your thoughts…"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (validation) setValidation(null);
        }}
        aria-invalid={!!validation}
        aria-describedby={validation ? 'new-comment-error' : undefined}
      />
      {validation && <FieldError id="new-comment-error">{validation}</FieldError>}
      {error && <FieldError id="new-comment-api-error">{error}</FieldError>}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </form>
  );
}
