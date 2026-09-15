import { Metadata } from 'next';
import { LoginPage } from '@/components/ui/sign-in-page';

export const metadata: Metadata = {
  title: 'Sign In — Dspace Electronics Lab',
  description: 'Sign in to access your lab orders, saved boards, and few-hour Porter courier dispatches.',
};

export default function SignInRoute() {
  return <LoginPage />;
}
