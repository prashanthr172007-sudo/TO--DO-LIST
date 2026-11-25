import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthScreen() {
  const {
    isConfigured,
    configError,
    authNotice,
    clearAuthNotice,
    signIn,
    signUp,
    resendConfirmation,
    retryConnection,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(() =>
    authNotice ? { type: 'error', text: authNotice } : null
  );

  const handleModeSwitch = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setFeedback(null);
    setCanResend(false);
    clearAuthNotice();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFeedback({
        type: 'error',
        text: 'Please enter both your email address and password.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    setCanResend(false);
    clearAuthNotice();

    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setFeedback({ type: 'error', text: error });
        if (error.toLowerCase().includes('email not confirmed')) {
          setCanResend(true);
        }
      }
    } else {
      const { error, needsEmailConfirmation } = await signUp(
        email.trim(),
        password,
        fullName
      );
      if (error) {
        setFeedback({ type: 'error', text: error });
      } else if (needsEmailConfirmation) {
        setFeedback({
          type: 'success',
          text: 'Account created! Check your email inbox and click the confirmation link to activate your account.',
        });
        setCanResend(true);
        setPassword('');
      }
    }

    setIsSubmitting(false);
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    const { error } = await resendConfirmation(email.trim());
    if (error) {
      setFeedback({ type: 'error', text: error });
    } else {
      setFeedback({
        type: 'success',
        text: 'Confirmation email resent! Please check your inbox.',
      });
    }
    setIsResending(false);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await retryConnection();
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
            Smart Task Manager
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {mode === 'signin'
              ? 'Sign in to access your tasks and priorities.'
              : 'Create an account to organize and track your tasks.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          {!isConfigured && configError && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-2.5"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{configError}</p>
              </div>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 font-semibold text-amber-900 hover:text-amber-700 underline underline-offset-2 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`}
                />
                <span>{isRetrying ? 'Checking...' : 'Retry Connection'}</span>
              </button>
            </div>
          )}

          {/* Mode Toggle */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => handleModeSwitch('signin')}
              className={`py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                mode === 'signin'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => handleModeSwitch('signup')}
              className={`py-2 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              role="alert"
              className={`rounded-xl border px-3.5 py-3 text-xs leading-relaxed space-y-2 ${
                feedback.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {feedback.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
              {canResend && email.trim() && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="ml-6 font-semibold underline underline-offset-2 hover:opacity-80 disabled:opacity-60"
                >
                  {isResending ? 'Sending...' : 'Resend confirmation email'}
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-screen-email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="auth-screen-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="auth-screen-password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-screen-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 pl-3.5 pr-11 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isConfigured}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              <span>
                {isSubmitting
                  ? mode === 'signin'
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
