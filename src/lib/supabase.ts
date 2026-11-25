import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfigResponse {
  url: string;
  publishableKey: string;
  configured: boolean;
}

let cachedClient: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;
let lastConfigError: string | null = null;

function createSupabaseInstance(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

function isValidConfig(url: string, key: string): boolean {
  return Boolean(url && key && /^https?:\/\//i.test(url) && key.length > 10);
}

export async function initSupabase(): Promise<SupabaseClient | null> {
  if (cachedClient) return cachedClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
    const envKey =
      (
        (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
        (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
      )?.trim() ?? '';

    if (isValidConfig(envUrl, envKey)) {
      lastConfigError = null;
      cachedClient = createSupabaseInstance(envUrl, envKey);
      return cachedClient;
    }

    try {
      const response = await fetch('/api/supabase-config', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        lastConfigError =
          'Unable to load Supabase configuration from the server.';
        return null;
      }

      const data = (await response.json()) as SupabaseConfigResponse;
      if (!isValidConfig(data.url, data.publishableKey)) {
        lastConfigError =
          'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in your Secrets panel.';
        return null;
      }

      lastConfigError = null;
      cachedClient = createSupabaseInstance(data.url, data.publishableKey);
      return cachedClient;
    } catch {
      lastConfigError =
        'Failed to connect to the configuration endpoint. Please verify your server is running.';
      return null;
    }
  })();

  const client = await initPromise;
  if (!client) {
    initPromise = null;
  }
  return client;
}

export function getSupabase(): SupabaseClient | null {
  return cachedClient;
}

export function getSupabaseConfigError(): string | null {
  return lastConfigError;
}
