'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

// Custom Google SVG Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// Custom Apple SVG Icon
const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="1.15em"
    height="1.15em"
    fill="currentColor"
    {...props}
  >
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
  </svg>
);

export default function Auth10() {
  const router = useRouter();
  const { loginWithEmail, signupWithEmail, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 24,
      },
    },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const logged = loginWithEmail(email, password);
        showToast('Welcome back to Dspace', `Signed in as ${logged.fullName || email}`, 'success');
        router.push(logged.role === 'admin' ? '/admin' : '/account');
      } else {
        const newUser = signupWithEmail(name, email, password);
        showToast('Account Created', `Welcome to Dspace, ${newUser.fullName}`, 'success');
        router.push('/account');
      }
    } catch (err: any) {
      showToast('Authentication Error', err?.message || 'Failed to authenticate', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'Google') {
        await signInWithGoogle();
      } else {
        showToast(provider + ' Sign-In', 'Apple ID authentication is not yet enabled.', 'info');
      }
    } catch (err: any) {
      showToast('Authentication Notice', err?.message || `${provider} sign-in requires active OAuth configuration.`, 'info');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#050505] font-sans text-neutral-200 antialiased selection:bg-neutral-800 selection:text-white lg:flex-row">
      {/* Left Image Panel - Dspace Electronics Aesthetics */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden p-8 sm:p-12 lg:w-1/2 min-h-[44vh] lg:min-h-screen">
        {/* Background Layer with Darkened Vignette */}
        <div className="absolute inset-0 bg-radial-[at_top_left] from-neutral-800 via-neutral-950 to-black opacity-90" />
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85"
          alt="Precision Microcontroller Silicon"
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Top Header */}
        <div className="relative z-10 flex w-full items-center justify-between pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>RETURN TO STORE</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-3 py-1 text-xs font-mono text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>HSR HUB DISPATCH READY</span>
          </div>
        </div>

        {/* Middle Brand Mark */}
        <div className="relative z-10 my-auto py-12 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-2xl tracking-tighter mb-4 shadow-xl">
            D
          </div>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white font-mono">
            Dspace<span className="text-neutral-500">.lab</span>
          </span>
          <p className="mt-3 text-xs sm:text-sm font-mono tracking-wider text-neutral-400 uppercase">
            Precision Electronics · Few-Hour Porter BLR Dispatch
          </p>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-10 mb-4 flex w-full flex-col items-start">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-xs font-mono text-neutral-300 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ENTERPRISE SILICON HARDWARE PASS</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium leading-snug tracking-tight text-white">
            Get access to your engineering lab,
            <br className="hidden sm:block" />
            bulk bill of materials, and same-day Porter logistics.
          </h1>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-[#09090b]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md md:max-w-lg"
        >
          {/* Mode Switcher Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  {mode === 'signin' ? 'Sign in to Dspace' : 'Create an Account'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your lab orders and saved boards.'
                    : 'Join thousands of robotics engineers, makers, and labs across Bengaluru.'}
                </p>
              </div>

              <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Full Name / Lab Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Nambiar (HyperFlow Robotics)"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
                />
              </motion.div>
            )}

            {/* Email */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maker@example.com"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => showToast('Password Reset Link Sent', 'Check your email inbox for instructions', 'info')}
                    className="text-xs text-neutral-400 hover:text-white underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500 transition-all"
              />
            </motion.div>

            {/* Terms checkbox */}
            <motion.div variants={itemVariants} className="mt-1 flex items-center gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-950 text-white accent-white focus:ring-0 focus:outline-none"
              />
              <label htmlFor="terms" className="text-xs text-neutral-400">
                I agree to the{' '}
                <span className="text-neutral-200 underline cursor-pointer hover:text-white">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-neutral-200 underline cursor-pointer hover:text-white">
                  Hardware Safety Policy
                </span>
              </label>
            </motion.div>

            {/* Action Submit Button */}
            <motion.div variants={itemVariants} className="mt-2">
              <button
                type="submit"
                disabled={isLoading || !agreeTerms}
                className="w-full rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 py-3.5 text-sm font-semibold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
                    <span>Verifying session...</span>
                  </span>
                ) : mode === 'signin' ? (
                  <span>Sign In</span>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6 flex items-center">
            <div className="grow border-t border-neutral-800"></div>
            <span className="px-4 text-xs font-mono uppercase tracking-widest text-neutral-500">Or continue with</span>
            <div className="grow border-t border-neutral-800"></div>
          </motion.div>

          {/* Social Buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('Google')}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 py-3 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <GoogleIcon className="text-base" />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('Apple')}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 py-3 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <AppleIcon className="text-base" />
              <span>Apple ID</span>
            </button>
          </motion.div>



          {/* Footer toggle */}
          <motion.div variants={itemVariants} className="mt-6 text-center text-xs text-neutral-400">
            {mode === 'signin' ? (
              <>
                New to Dspace?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-semibold text-white underline hover:text-neutral-200 cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-semibold text-white underline hover:text-neutral-200 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
