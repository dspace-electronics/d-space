import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/account';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('OAuth code exchange error:', error.message);
  }

  // Fallback: If no code in query params, inspect client-side hash fragment (RFC 3986 fragment preservation)
  // before declaring oauth_failed, because implicit OAuth flow returns #access_token=... to the browser.
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Connecting Dspace Account...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #090a0f; color: #ffffff;">
    <div style="text-align: center; max-width: 400px; padding: 24px;">
      <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
      <h2 style="font-size: 18px; margin: 0 0 8px;">Authenticating...</h2>
      <p style="font-size: 13px; color: #9ca3af; margin: 0;">Securing hardware maker workstation session...</p>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
    <script>
      (function() {
        var hash = window.location.hash || '';
        if (hash && (hash.indexOf('access_token=') !== -1 || hash.indexOf('error=') !== -1)) {
          window.location.replace('${origin}/signin' + hash);
        } else {
          window.location.replace('${origin}/signin?error=oauth_failed');
        }
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
