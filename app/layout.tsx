import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AppLayoutShell } from '@/components/app-layout-shell';

const fontSans = Plus_Jakarta_Sans({
  variable: '--font-sans-custom',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const fontMono = JetBrains_Mono({
  variable: '--font-mono-custom',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const fontDisplay = Playfair_Display({
  variable: '--font-display-custom',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Dspace Electronics — Precision Hardware & Rapid Bengaluru Dispatch',
  description:
    'Engineering-grade electronic components, genuine microcontrollers, precision sensors, and lab tools dispatched across Bengaluru via Porter 2-Wheeler courier.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#fbfbfd] text-neutral-900 dark:bg-[#050608] dark:text-neutral-100 transition-colors duration-200">
        <Providers>
          <AppLayoutShell>{children}</AppLayoutShell>
        </Providers>
      </body>
    </html>
  );
}
