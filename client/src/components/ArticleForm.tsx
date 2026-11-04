import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { ArticleInput } from '../api.ts';
import { ErrorMessage, FieldError } from './Status.tsx';

type Props = {
  initialValues?: ArticleInput;
  submitLabel: string;
  submittingLabel: string;
  cancelTo: string;
  onSubmit: (values: ArticleInput) => Promise<void>;
};

type Errors = Partial<Record<keyof ArticleInput, string>>;

export default function ArticleForm({
  initialValues = { title: '', contents: '' },
  submitLabel,
  submittingLabel,
  cancelTo,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialValues.title);
  const [contents, setContents] = useState(initialValues.contents);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = 'Title is required.';
    if (!contents.trim()) next.contents = 'Contents are required.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ title: title.trim(), contents: contents.trim() });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save.');
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      {submitError && <ErrorMessage>{submitError}</ErrorMessage>}

      <div className="field">
        <label htmlFor="title" className="field__label">
          Title
        </label>
        <input
          id="title"
          className="input"
          value={title}
          maxLength={255}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
          }}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          autoFocus
        />
        {errors.title && <FieldError id="title-error">{errors.title}</FieldError>}
      </div>

      <div className="field">
        <label htmlFor="contents" className="field__label">
          Contents
        </label>
        <textarea
          id="contents"
          className="input textarea textarea--tall"
          value={contents}
          onChange={(e) => {
            setContents(e.target.value);
            if (errors.contents) setErrors((p) => ({ ...p, contents: undefined }));
          }}
          aria-invalid={!!errors.contents}
          aria-describedby={errors.contents ? 'contents-error' : undefined}
        />
        {errors.contents && (
          <FieldError id="contents-error">{errors.contents}</FieldError>
        )}
      </div>

      <div className="form__actions">
        <Link to={cancelTo} className="btn btn--ghost">
          Cancel
        </Link>
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
