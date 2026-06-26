import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const incomingError = searchParams.get("error_description") || searchParams.get("error");

  if (incomingError) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth&error_description=${encodeURIComponent(incomingError)}`
    );
  }

  if (code) {
    const separator = next.includes("?") ? "&" : "?";
    const redirectTo = `${origin}${next}${separator}login=success`;
    // Create the redirect response FIRST so cookies are set directly on it
    const response = NextResponse.redirect(redirectTo);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            // Write cookies onto the redirect response so the browser receives them
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;

    return NextResponse.redirect(
      `${origin}/login?error=oauth&error_description=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=oauth&error_description=${encodeURIComponent("Không nhận được mã xác thực từ Google.")}`
  );
}
