import { Metadata } from 'next';
import { SignUpPage } from '@/components/ui/sign-up-page';

export const metadata: Metadata = {
  title: 'Sign Up — Dspace Electronics Lab',
  description: 'Create an account on Dspace to order precision microcontrollers, sensors, and workbench tools.',
};

export default function SignUpRoute() {
  return <SignUpPage />;
}
