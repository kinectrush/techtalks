import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { matches: [], groupStandings: [], disabled: true },
    { status: 410 },
  );
}
