import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session so it stays valid (do not run code between
  // createServerClient and getUser, per Supabase SSR guidance).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes: require auth + admin role from the backend.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';

      const meResponse = await fetch(`${backendUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!meResponse.ok) {
        throw new Error('Failed to fetch user role');
      }

      const userData = await meResponse.json();

      if (!userData.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
