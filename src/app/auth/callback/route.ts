import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const incomingError = searchParams.get("error_description") || searchParams.get("error");

  if (incomingError) {
    return NextResponse.redirect(`${origin}/login?error=oauth&error_description=${encodeURIComponent(incomingError)}`);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=oauth&error_description=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/login?error=oauth&error_description=${encodeURIComponent("Không nhận được mã xác thực từ Google.")}`);
}
