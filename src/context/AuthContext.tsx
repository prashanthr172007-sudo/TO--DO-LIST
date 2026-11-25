import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getSupabase,
  getSupabaseConfigError,
  initSupabase,
} from '../lib/supabase';

interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  configError: string | null;
  authNotice: string | null;
  displayName: string;
  displayEmail: string;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<SignUpResult>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  retryConnection: () => Promise<void>;
  clearAuthNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractUrlAuthError(): string | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash
    );

    const errorDesc =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error');

    if (errorDesc) {
      window.history.replaceState({}, document.title, window.location.pathname);
      return decodeURIComponent(errorDesc.replace(/\+/g, ' '));
    }
  } catch {
    // Ignore malformed URL params
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(() =>
    extractUrlAuthError()
  );

  const bootstrapAuth = useCallback(async () => {
    setIsLoading(true);
    const client = await initSupabase();

    if (!client) {
      setIsConfigured(false);
      setConfigError(
        getSupabaseConfigError() ??
          'Supabase credentials are not configured yet.'
      );
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsConfigured(true);
    setConfigError(null);

    const { data, error } = await client.auth.getSession();
    if (error) {
      setConfigError(error.message);
    }

    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
    setIsLoading(false);

    return client;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    bootstrapAuth().then((client) => {
      if (!isMounted || !client) return;
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setIsLoading(false);
        if (event === 'SIGNED_IN' && window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [bootstrapAuth]);

  const value = useMemo<AuthContextValue>(() => {
    const email = user?.email ?? '';
    const rawName =
      (user?.user_metadata?.full_name as string | undefined) ??
      (email ? email.split('@')[0].replace(/[._-]/g, ' ') : '');
    const displayName = rawName
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return {
      user,
      session,
      isLoading,
      isConfigured,
      configError,
      authNotice,
      displayName: displayName || 'Workspace User',
      displayEmail: email,
      signIn: async (signInEmail: string, password: string) => {
        const client = getSupabase() ?? (await initSupabase());
        if (!client) {
          return {
            error:
              getSupabaseConfigError() ??
              'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
          };
        }
        const { error } = await client.auth.signInWithPassword({
          email: signInEmail,
          password,
        });
        return { error: error ? error.message : null };
      },
      signUp: async (
        signUpEmail: string,
        password: string,
        fullName?: string
      ) => {
        const client = getSupabase() ?? (await initSupabase());
        if (!client) {
          return {
            error:
              getSupabaseConfigError() ??
              'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
            needsEmailConfirmation: false,
          };
        }
        const { data, error } = await client.auth.signUp({
          email: signUpEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            ...(fullName?.trim()
              ? { data: { full_name: fullName.trim() } }
              : {}),
          },
        });
        if (error) {
          return { error: error.message, needsEmailConfirmation: false };
        }
        const needsEmailConfirmation = Boolean(data.user && !data.session);
        return { error: null, needsEmailConfirmation };
      },
      resendConfirmation: async (targetEmail: string) => {
        const client = getSupabase() ?? (await initSupabase());
        if (!client) {
          return { error: 'Supabase is not configured.' };
        }
        const { error } = await client.auth.resend({
          type: 'signup',
          email: targetEmail,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        return { error: error ? error.message : null };
      },
      signOut: async () => {
        const client = getSupabase();
        if (!client) return { error: null };
        const { error } = await client.auth.signOut();
        return { error: error ? error.message : null };
      },
      retryConnection: async () => {
        await bootstrapAuth();
      },
      clearAuthNotice: () => setAuthNotice(null),
    };
  }, [user, session, isLoading, isConfigured, configError, authNotice, bootstrapAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
