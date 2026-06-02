import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendBrief } from './sendBrief';
import type { SendBriefArgs } from './sendBrief';

const args: SendBriefArgs = {
  brand: 'Acme Care',
  clientName: 'Jordan Lee',
  clientEmail: 'jordan@example.com',
  message: 'Looking forward to it',
  briefText: 'DESIGN BRIEF — Acme Care',
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sendBrief', () => {
  it('POSTs to Web3Forms and returns ok:true on success', async () => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendBrief(args);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.web3forms.com/submit');
    const body = JSON.parse(init.body as string) as { access_key: string; subject: string };
    expect(body.access_key).toBe('test-key');
    expect(body.subject).toBe('New design selections — Acme Care');
  });

  it('surfaces the API error message when success is false', async () => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ json: async () => ({ success: false, message: 'Bad key' }) }),
    );

    const result = await sendBrief(args);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Bad key');
  });

  it('returns fallback:true without calling fetch when no key is set', async () => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendBrief(args);

    expect(result.ok).toBe(false);
    expect(result.fallback).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('falls back when the network call throws', async () => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const result = await sendBrief(args);
    expect(result.ok).toBe(false);
    expect(result.fallback).toBe(true);
  });
});
