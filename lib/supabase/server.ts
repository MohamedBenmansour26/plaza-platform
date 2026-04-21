import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

type AuthOptions = {
  /** Supabase auth flow type. Pass 'pkce' for magic-link / OAuth flows that
   *  use a callback route calling exchangeCodeForSession(code). */
  flowType?: 'pkce' | 'implicit';
};

export async function createClient(authOptions?: AuthOptions) {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(authOptions?.flowType ? { auth: { flowType: authOptions.flowType } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // Middleware is responsible for refreshing the session.
          }
        },
      },
    },
  );
}
