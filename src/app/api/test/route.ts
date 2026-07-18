import { fetchLiveMarkets } from '@/lib/bento';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const markets = await fetchLiveMarkets();
    return NextResponse.json({ success: true, markets });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error?.message || String(error),
      stack: error?.stack || ''
    }, { status: 500 });
  }
}
