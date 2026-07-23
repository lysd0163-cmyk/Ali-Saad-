import { normalizeSymbol, type OhlcPoint } from './symbol';

export async function fetchOhlcFromTwelveData(params: {
  symbol: string;
  interval: string;
  outputsize: number;
}): Promise<{ symbol: string; interval: string; values: OhlcPoint[]; meta?: Record<string, unknown> }> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('TWELVE_DATA_API_KEY is missing. Add it to .env.local');
  }

  const symbol = normalizeSymbol(params.symbol);
  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', params.interval);
  url.searchParams.set('outputsize', String(params.outputsize));
  url.searchParams.set('format', 'JSON');
  url.searchParams.set('apikey', apiKey);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Twelve Data request failed with HTTP ${res.status}`);
  }

  if (data.status === 'error') {
    throw new Error(data.message ?? 'Twelve Data returned an error');
  }

  const values: OhlcPoint[] = Array.isArray(data.values)
    ? data.values
        .map((item: Record<string, string>) => ({
          time: item.datetime,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: item.volume ? Number(item.volume) : undefined,
        }))
        .filter((point: OhlcPoint) => Number.isFinite(point.open) && Number.isFinite(point.high) && Number.isFinite(point.low) && Number.isFinite(point.close))
        .reverse()
    : [];

  return {
    symbol: data.symbol ?? symbol,
    interval: params.interval,
    values,
    meta: data.meta,
  };
}
