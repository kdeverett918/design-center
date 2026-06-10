import { useState } from 'react';
import { CheckCircle2, FileDown, Loader2, Send } from 'lucide-react';
import { buildBriefText } from './buildBrief';
import type { BriefInput } from './buildBrief';
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

// Lets the client send their finished selections straight to Tech SLP Studio.
// Posts client-side via Web3Forms; falls back to a mailto: draft when no key is
// configured or the network call is blocked.
export default function SendBrief(props: BriefInput) {
  const { brand } = props;
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const submitting = status.kind === 'submitting';

  const openMailto = (briefText: string) => {
    const subject = encodeURIComponent(`New design selections: ${brand}`);
    const body = encodeURIComponent(`${message ? message + '\n\n' : ''}${briefText}`);
    window.location.href = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setStatus({ kind: 'submitting' });

    const briefText = buildBriefText(props);
    const result = await sendBrief({
      brand,
      clientName,
      clientEmail,
      message,
      briefText,
    });

    if (result.ok) {
      setStatus({ kind: 'success' });
      return;
    }
    if (result.fallback) {
      openMailto(briefText);
      setStatus({ kind: 'fallback' });
      return;
    }
    setStatus({ kind: 'error', message: result.error ?? 'Something went wrong. Please try again.' });
  };

  return (
    <div className="rounded-3xl border border-shell-line bg-shell-panel p-5">
      <h3 className="font-display text-sm font-semibold text-shell-ink">Send to Tech SLP Studio</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-shell-mute">
        Happy with your mix? Send your selections to Kristine and she’ll be in touch.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="sb-name" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Your name
          </label>
          <input
            id="sb-name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
          />
        </div>

        <div>
          <label htmlFor="sb-email" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Your email
          </label>
          <input
            id="sb-email"
            type="email"
            required
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-lg border border-shell-line bg-shell-base px-3 py-2 text-sm text-shell-ink outline-none focus:border-shell-glow/60"
          />
        </div>

        <div>
          <label htmlFor="sb-message" className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-shell-mute">
            Message <span className="font-normal normal-case text-shell-mute/70">(optional)</span>
          </label>
          <textarea
            id="sb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Anything else you’d like Kristine to know…"
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
              <Loader2 size={15} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Send size={15} /> Send my selections to Tech SLP Studio
            </>
          )}
        </button>
      </form>

      {/* Secondary action — keep a polished PDF copy of the selections. Reuses the
          print-only brief portaled by BriefSummary (@media print shows only it). */}
      <button
        type="button"
        onClick={() => window.print()}
        className={`${buttonClasses('neutral', 'sm')} mt-2 w-full`}
      >
        <FileDown size={13} /> Download a PDF copy for your records
      </button>

      <div aria-live="polite" className="mt-3 min-h-[1rem]">
        {status.kind === 'success' && (
          <div>
            <LottieFlourish
              src="/lottie/gradient-reveal.json"
              className="mx-auto -mb-1 h-16 w-full max-w-[260px]"
            />
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={14} /> Sent! Kristine will be in touch.
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
