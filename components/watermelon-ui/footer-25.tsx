'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/toast-context';

export default function Footer25() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast('Subscribed to Dspace Drops', 'You will receive notifications for new silicon batches.', 'success');
  };

  const navLinks = [
    { label: 'Hardware Catalog', href: '/shop' },
    { label: 'Same-Day Delivery', href: '/delivery' },
    { label: 'Engineering Account', href: '/account' },
    { label: 'Saved Wishlist', href: '/wishlist' },
    { label: 'Lab Admin Hub', href: '/admin' },
  ];

  const socialLinks = [
    { label: 'TWITTER / X', href: 'https://twitter.com' },
    { label: 'GITHUB', href: 'https://github.com' },
    { label: 'DISCORD', href: 'https://discord.com' },
    { label: 'LINKEDIN', href: 'https://linkedin.com' },
  ];

  return (
    <footer className="relative flex min-h-[85vh] w-full flex-col justify-between overflow-hidden bg-black text-[#FAFAFA] font-sans antialiased selection:bg-[#FAFAFA] selection:text-black">
      {/* Ambient Gradient Background & Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-emerald-950/20 via-sky-950/10 to-transparent opacity-60" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-between px-6 py-16 md:px-12 md:py-20 lg:py-24">
        {/* Top Section */}
        <div className="flex flex-col gap-16 md:flex-row md:justify-between lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight transition-opacity hover:opacity-65"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full max-w-sm flex-col md:max-w-md"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs font-mono text-neutral-400 w-fit mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>BENGALURU HARDWARE DROPS</span>
            </div>
            <p className="mb-8 text-xl text-neutral-200 md:text-2xl font-light leading-snug">
              Get silicon restocks and hardware telemetry <br className="hidden sm:block" /> straight to your workbench.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono border-b border-emerald-500/40 pb-4">
                <CheckCircle2 className="h-4 w-4" />
                <span>Subscribed! Check your inbox for launch alerts.</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="relative flex items-center justify-between border-b border-white/20 pb-4 transition-colors focus-within:border-white"
              >
                <input
                  type="email"
                  required
                  placeholder="engineer@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-base sm:text-lg text-white placeholder-neutral-500 outline-none font-mono"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="text-neutral-400 transition-colors hover:text-white p-1 cursor-pointer"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </form>
            )}

            <div className="mt-4 text-[11px] text-neutral-500 font-mono">
              HSR Layout Sector 4 Central Fulfillment · Same-day Porter 2-Wheeler courier
            </div>
          </motion.div>
        </div>

        {/* Middle Section (Socials with Divider) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 mb-12 flex items-center justify-between"
        >
          {/* Horizontal Line extending from left */}
          <div className="hidden h-px flex-1 bg-white/20 md:block md:mr-16 lg:mr-32" />

          <div className="flex w-full flex-wrap items-center justify-between gap-6 md:w-auto md:justify-end sm:gap-8 lg:gap-12">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1.5 text-xs font-mono font-bold tracking-[0.15em] text-neutral-300 transition-colors hover:text-white"
              >
                <span>{social.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Bottom Section (Massive DSPACE Editorial Wordmark) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-auto mb-8 w-full"
        >
          <svg
            viewBox="0 0 1040 180"
            className="h-auto w-full fill-current text-white select-none pointer-events-none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="520"
              y="150"
              textAnchor="middle"
              fontSize="175"
              fontWeight="900"
              fontFamily="var(--font-display), var(--font-sans), sans-serif"
              letterSpacing="0.06em"
              fill="white"
            >
              DSPACE
            </text>
          </svg>
          <h2 className="sr-only">DSPACE ELECTRONICS</h2>
        </motion.div>

        {/* Footer Meta */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start justify-between gap-4 text-xs font-mono text-neutral-400 md:flex-row md:items-end border-t border-neutral-900 pt-6"
        >
          <p className="max-w-2xl leading-relaxed">
            &copy; {new Date().getFullYear()} Dspace Electronics Labs Pvt. Ltd. <br />
            Dispatched directly from HSR Layout Sector 4 Central Warehouse, Bengaluru, Karnataka 560102.
            <br />
            GSTIN: 29AABCU9603R1ZM · Certified ESD Safe Handling Facility.
          </p>

          <div className="flex items-center gap-6 whitespace-nowrap">
            <Link href="/delivery" className="transition-colors hover:text-white">
              Logistics SLA
            </Link>
            <Link href="/signin" className="transition-colors hover:text-white">
              Sign In
            </Link>
            <Link href="/shop" className="transition-colors hover:text-white">
              Catalog
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
