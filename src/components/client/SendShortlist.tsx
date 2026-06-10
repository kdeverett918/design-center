import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { buildShortlistText } from './buildShortlist';
import type { ShortlistGroups } from './buildShortlist';
import { sendBrief } from '../../lib/sendBrief';
import { STUDIO_EMAIL } from '../../lib/studioContact';
import { buttonClasses } from '../ui/Button';
import LottieFlourish from '../ui/LottieFlourish';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'fallback' }
  | { kind: 'error'; message: string };

interface SendShortlistProps {
  groups: ShortlistGroups;
  count: number;
  /** Per-favorite client notes keyed by 'kind:id' — included in the email. */
  notes?: Record<string, string>;
}

export default function SendShortlist({ groups, count, notes }: SendShortlistProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const submitting = status.kind === 'submitting';
  const sender = clientName.trim() || clientEmail.trim() || 'Design Center visitor';

  const openMailto = (shortlistText: string) => {
    const subject = encodeURIComponent(`New design shortlist: ${sender}`);
    const body = encodeURIComponent(`${message ? message + '\n\n' : ''}${shortlistText}`);
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setStatus({ kind: 'submitting' });

    const shortlistText = buildShortlistText({ groups, count, notes });
    const result = await sendBrief({
      brand: 'Shortlist',
      clientName,
      clientEmail,
      message,
      briefText: shortlistText,
      subject: `New design shortlist - ${sender}`,
    });

    if (result.ok) {
      setStatus({ kind: 'success' });
      return;
    }
    if (result.fallback) {
      openMailto(shortlistText);
      setStatus({ kind: 'fallback' });
      return;
    }
    setStatus({ kind: 'error', message: result.error ?? 'Something went wrong. Please try again.' });
  };

  return (
    <div className="rounded-3xl border border-shell-line bg-shell-panel p-5">
      <h3 className="font-display text-sm font-semibold text-shell-ink">Send shortlist to Kristine</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-shell-mute">
        Share all {count} starred item{count === 1 ? '' : 's'} in one email.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="sl-name" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Your name
          </label>
          <input
            id="sl-name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
          />
        </div>

        <div>
          <label htmlFor="sl-email" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Your email
          </label>
          <input
            id="sl-email"
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
          />
        </div>

        <div>
          <label htmlFor="sl-message" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Message <span className="font-normal normal-case text-shell-mute/70">(optional)</span>
          </label>
          <textarea
            id="sl-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Project context, timing, or favorites you care about most..."
            className="w-full resize-none rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none placeholder:text-shell-mute focus:border-shell-glow/60"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`${buttonClasses('success', 'md')} w-full`}
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Mail size={15} /> Send shortlist
            </>
          )}
        </button>
      </form>

      <div aria-live="polite" className="mt-3 min-h-[1rem]">
        {status.kind === 'success' && (
          <div>
            <LottieFlourish
              src="/lottie/gradient-reveal.json"
              className="mx-auto -mb-1 h-16 w-full max-w-[260px]"
            />
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={14} /> Shortlist sent.
            </p>
          </div>
        )}
        {status.kind === 'fallback' && (
          <p className="text-xs leading-relaxed text-shell-mute">
            Opened your email app to send to {STUDIO_EMAIL}.
          </p>
        )}
        {status.kind === 'error' && (
          <p className="text-xs leading-relaxed text-red-400">{status.message}</p>
        )}
      </div>
    </div>
  );
}
