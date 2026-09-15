'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Cpu, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { DspaceLogo } from '@/components/ui/dspace-logo';

export function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;
    setErrorMessage('');
    setIsLoading(true);
    try {
      const loggedUser = loginWithEmail(formData.email, formData.password);
      if (loggedUser?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMessage(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err?.message || 'Google authentication could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 lg:p-10 bg-[#f4f5f8] dark:bg-[#090a0f] transition-colors">
      {/* Return to Store Outside the Box */}
      <div className="w-full max-w-5xl mb-3 sm:mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0e1117] hover:bg-neutral-100 dark:hover:bg-white/10 border border-neutral-200/90 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>
      </div>

      {/* Main Curved Card Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-[#0e1117] border border-neutral-200/90 dark:border-white/10 rounded-[28px] sm:rounded-[36px] shadow-2xl shadow-neutral-900/10 dark:shadow-black/60 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Panel - Playful 3D Cartoon Hardware Maker Showcase */}
        <div className="flex-1 relative overflow-hidden hidden md:flex flex-col justify-end p-8 lg:p-10 bg-neutral-950 text-white rounded-[24px] sm:rounded-[32px] m-3 shadow-inner">
          {/* Background Illustration */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/cartoon-hardware-lab.jpg"
              alt="Dspace Cartoon Hardware Maker Lab"
              fill
              priority
              className="object-cover opacity-90 filter brightness-95 contrast-105"
            />
            {/* Smooth Atmospheric Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/20" />
          </div>

          {/* Bottom Warehouse Tag */}
          <div className="relative z-10 text-[11px] font-mono text-neutral-300 bg-neutral-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl self-start border border-white/10 shadow-lg">
            Hub: 1273, HAL 3rd Stage, New Thippasandra, Bengaluru 560075
          </div>
        </div>

        {/* Right Panel - Curved Minimalist Sign In Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#0e1117]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-7">
              <div className="mb-5">
                <Link href="/" className="inline-block" aria-label="Dspace Home">
                  <DspaceLogo size="md" />
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Sign in to Dspace
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-[#6366f1] hover:underline font-semibold"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="engineer@lab.com"
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] outline-hidden transition-all bg-neutral-50/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 focus:bg-white dark:focus:bg-[#161a22] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo password reset link has been dispatched to your email.')}
                    className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-neutral-200 dark:border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-[#6366f1]/30 focus:border-[#6366f1] outline-hidden transition-all bg-neutral-50/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 focus:bg-white dark:focus:bg-[#161a22] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6366f1] border-neutral-300 rounded focus:ring-[#6366f1]"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">{errorMessage}</p>
                    {errorMessage.includes('password') && (
                      <p className="text-[11px] text-rose-500/80 dark:text-rose-400/80">
                        Did you forget your password? You can also create a new account via Sign up.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white py-3.5 px-4 rounded-2xl font-semibold text-sm transition-all shadow-md shadow-[#6366f1]/20 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-[#0e1117] text-neutral-400 dark:text-neutral-500 font-mono">OR CONTINUE WITH</span>
                </div>
              </div>

              {/* Single Clean Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-neutral-200 dark:border-white/10 rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/5 transition-all text-xs font-semibold text-neutral-700 dark:text-neutral-200 cursor-pointer bg-neutral-50/50 dark:bg-white/[0.02] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
