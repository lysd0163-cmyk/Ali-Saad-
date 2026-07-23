export function normalizeSymbol(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '').replace(/\//g, '');
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}/${cleaned.slice(3)}`;
  }
  return cleaned;
}

export function displaySymbol(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '');
}

export type Timeframe = 'D1' | 'H4' | 'H1' | 'M15';

export const TIMEFRAME_MAP: Record<Timeframe, { interval: string; label: string }> = {
  D1: { interval: '1day', label: 'D1' },
  H4: { interval: '4h', label: 'H4' },
  H1: { interval: '1h', label: 'H1' },
  M15: { interval: '15min', label: 'M15' },
};

export interface OhlcPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
