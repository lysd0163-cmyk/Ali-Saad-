'use client';

import { FormEvent, useMemo, useState } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import { ChartCard } from '@/components/ChartCard';
import { TIMEFRAME_MAP, type OhlcPoint, type Timeframe, displaySymbol } from '@/lib/symbol';

const timeframes: Timeframe[] = ['D1', 'H4', 'H1', 'M15'];

function downloadFile(filename: string, content: BlobPart, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [candles, setCandles] = useState(250);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<Record<Timeframe, OhlcPoint[]> | null>(null);

  const normalizedSymbol = useMemo(() => displaySymbol(symbol), [symbol]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const responses = await Promise.all(
        timeframes.map(async (tf) => {
          const params = new URLSearchParams({
            symbol: normalizedSymbol,
            interval: TIMEFRAME_MAP[tf].interval,
            outputsize: String(candles),
          });
          const res = await fetch(`/api/ohlc?${params.toString()}`, { cache: 'no-store' });
          const json = await res.json();
          if (!res.ok) throw new Error(`${tf}: ${json.error ?? 'Request failed'}`);
          return [tf, json.values as OhlcPoint[]] as const;
        }),
      );

      setResults(Object.fromEntries(responses) as Record<Timeframe, OhlcPoint[]>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function downloadAllJson() {
    if (!results) return;
    const payload = {
      symbol: normalizedSymbol,
      candles,
      timeframes: Object.fromEntries(
        timeframes.map((tf) => [tf, { interval: TIMEFRAME_MAP[tf].interval, data: results[tf] }]),
      ),
    };
    downloadFile(`${normalizedSymbol}_${candles}_all.json`, JSON.stringify(payload, null, 2));
  }

  async function downloadAllPng() {
    const zip = new JSZip();
    const cards = Array.from(document.querySelectorAll('[data-chart-card="true"]')) as HTMLElement[];
    for (const card of cards) {
      const canvas = await html2canvas(card, { backgroundColor: '#08111f', scale: 2, useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      const name = card.dataset.name ?? 'chart.png';
      zip.file(name, dataUrl.split(',')[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${normalizedSymbol}_${candles}_charts.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">Forex Chart Collector</p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-5xl">جلب صور الشارت و OHLC تلقائيًا</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
              يلتقط الموقع أحدث البيانات لأربعة فريمات فقط: D1 و H4 و H1 و M15، ويصدر صور شارت واضحة وملفات JSON جاهزة للإرسال.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
            مصدر البيانات: Twelve Data
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Symbol</span>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="XAUUSD أو EURUSD"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-sky-400"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">عدد الشموع</span>
            <input
              type="number"
              min={10}
              max={5000}
              value={candles}
              onChange={(e) => setCandles(Number(e.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-sky-400"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'جاري الجلب...' : 'جلب البيانات'}
          </button>
        </form>

        {error ? <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-200">{error}</div> : null}

        {results ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={downloadAllJson} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400">
              تنزيل JSON كامل
            </button>
            <button onClick={downloadAllPng} className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400">
              تنزيل صور ZIP
            </button>
          </div>
        ) : null}
      </div>

      {results ? (
        <div className="grid gap-6">
          {timeframes.map((tf) => (
            <ChartCard
              key={tf}
              symbol={normalizedSymbol}
              timeframe={TIMEFRAME_MAP[tf].label}
              interval={TIMEFRAME_MAP[tf].interval}
              data={results[tf]}
              candles={candles}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
          اكتب الزوج وعدد الشموع ثم اضغط جلب البيانات.
        </div>
      )}
    </main>
  );
}
