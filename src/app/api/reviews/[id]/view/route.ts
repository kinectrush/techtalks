import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function viewedCookieName(id: string) {
  return `rv_viewed_${id}`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const cookieName = viewedCookieName(id);

    // If already counted (per-browser/day), skip.
    const cookieHeader = req.headers.get('cookie') ?? '';
    if (cookieHeader.includes(`${cookieName}=`)) {
      return NextResponse.json({ skipped: true });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc('increment_review_views', {
      p_id: id,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message, hint: error.hint ?? null, code: error.code ?? null },
        { status: 500 },
      );
    }

    const res = NextResponse.json({ skipped: false, engagement: data ?? null });
    res.cookies.set(cookieName, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Unknown error',
        hint: 'Check SUPABASE_SERVICE_ROLE_KEY and apply RPC migration 20260602010000.',
      },
      { status: 500 },
    );
  }
}

