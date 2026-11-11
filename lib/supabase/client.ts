import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-dspace.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://') &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
};

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
