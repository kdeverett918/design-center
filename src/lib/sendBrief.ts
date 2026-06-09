// =============================================================================
// sendBrief — client-side delivery of the design selections to Tech SLP Studio.
//
// Uses Web3Forms (https://web3forms.com) so there is NO backend we host: the
// browser POSTs directly to their submit endpoint with a public access key.
// When the key is absent (or the network call fails), we return a `fallback`
// flag so the calling component can degrade gracefully to a mailto: link.
//
// This module is intentionally pure/side-effect-free (no DOM, no mailto) so it
// stays easy to unit-test. The mailto fallback lives in the component.
// =============================================================================

export interface SendBriefArgs {
  brand: string;
  clientName: string;
  clientEmail: string;
  message: string;
  briefText: string;
  subject?: string;
}

export interface SendResult {
  ok: boolean;
  error?: string;
  fallback?: boolean;
}

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

export async function sendBrief(args: SendBriefArgs): Promise<SendResult> {
  // Read the key at call-time so vi.stubEnv works in tests.
  const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

  // No key configured → let the UI fall back to mailto.
  if (!key) {
    return { ok: false, fallback: true };
  }

  const { brand, clientName, clientEmail, message, briefText, subject } = args;
  const body = {
    access_key: key,
    subject: subject ?? `New design selections — ${brand}`,
    from_name: clientName || 'Design Center client',
    replyto: clientEmail,
    name: clientName,
    email: clientEmail,
    message: `${message ? message + '\n\n' : ''}${briefText}`,
  };

  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { success?: boolean; message?: string };
    if (data.success === true) {
      return { ok: true };
    }
    return { ok: false, error: data.message ?? 'Submission failed.' };
  } catch (err) {
    // Network blocked / offline → fall back to mailto.
    return { ok: false, fallback: true, error: err instanceof Error ? err.message : String(err) };
  }
}
