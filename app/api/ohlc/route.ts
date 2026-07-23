import { NextResponse } from 'next/server';
import { fetchOhlcFromTwelveData } from '@/lib/twelvedata';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol')?.trim();
    const interval = url.searchParams.get('interval')?.trim();
    const outputsize = Number(url.searchParams.get('outputsize') ?? '200');

    if (!symbol) {
      return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
    }
    if (!interval) {
      return NextResponse.json({ error: 'interval is required' }, { status: 400 });
    }
    if (!Number.isInteger(outputsize) || outputsize < 1 || outputsize > 5000) {
      return NextResponse.json({ error: 'outputsize must be between 1 and 5000' }, { status: 400 });
    }

    const data = await fetchOhlcFromTwelveData({ symbol, interval, outputsize });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
