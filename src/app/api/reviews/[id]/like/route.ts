import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

function likedCookieName(id: string) {
  return `rv_liked_${id}`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const cookieName = likedCookieName(id);

    const cookieHeader = req.headers.get('cookie') ?? '';
    if (cookieHeader.includes(`${cookieName}=`)) {
      return NextResponse.json({ skipped: true, liked: true });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc('increment_review_reactions', {
      p_id: id,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message, hint: error.hint ?? null, code: error.code ?? null },
        { status: 500 },
      );
    }

    const res = NextResponse.json({
      skipped: false,
      liked: true,
      engagement: data ?? null,
    });
    res.cookies.set(cookieName, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
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

