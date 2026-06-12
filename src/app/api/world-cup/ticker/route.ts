import { fetchWorldCupLiveData } from '@/lib/football-data/fetch-world-cup';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchWorldCupLiveData({ fresh: true });

  return Response.json({
    matches: data?.matches ?? [],
  });
}
