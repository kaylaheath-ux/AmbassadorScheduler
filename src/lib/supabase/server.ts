import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client, bound to the request's cookies. Next 16's
// cookies() is async, so this factory is async too. `setAll` is wrapped in a
// try/catch because Server Components can't write cookies — token refresh
// happens in middleware.ts instead (that's allowed to set them).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — ignore; middleware refreshes the
            // session cookie on the next request.
          }
        },
      },
    },
  );
}
