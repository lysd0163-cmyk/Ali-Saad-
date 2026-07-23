'use client';

import { useEffect, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ColorType, CrosshairMode, createChart, type CandlestickData, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import type { OhlcPoint } from '@/lib/symbol';

function downloadBlob(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ChartCard({
  symbol,
  timeframe,
  interval,
  data,
  candles,
}: {
  symbol: string;
  timeframe: string;
  interval: string;
  data: OhlcPoint[];
  candles: number;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const changePct = useMemo(() => {
    if (!last || !prev || !prev.close) return null;
    return ((last.close - prev.close) / prev.close) * 100;
  }, [last, prev]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 520,
      layout: {
        background: { type: ColorType.Solid, color: '#0b1324' },
        textColor: '#cbd5e1',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.10)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.10)' },
      },
      rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.18)' },
      timeScale: { borderColor: 'rgba(148, 163, 184, 0.18)', timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    series.setData(data as CandlestickData[]);
    chart.timeScale().fitContent();

    const resize = new ResizeObserver(() => {
      chart.applyOptions({ width: container.clientWidth });
    });
    resize.observe(container);

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      resize.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data]);

  async function handleDownloadPng() {
    if (!sectionRef.current) return;
    const canvas = await html2canvas(sectionRef.current, {
      backgroundColor: '#08111f',
      scale: 2,
      useCORS: true,
    });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_${timeframe}_${candles}.png`;
    a.click();
  }

  function handleDownloadJson() {
    downloadBlob(
      `${symbol}_${timeframe}_${candles}.json`,
      JSON.stringify({ symbol, timeframe, interval, candles, data }, null, 2),
    );
  }

  return (
    <section ref={sectionRef} data-chart-card="true" data-name={`${symbol}_${timeframe}_${candles}.png`} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {symbol} · {timeframe}
          </h3>
          <p className="text-sm text-slate-300">
            {interval} · {data.length} شمعة
          </p>
        </div>
        <div className="text-right">
          {last ? (
            <>
              <div className="text-lg font-semibold text-white">{last.close.toFixed(5)}</div>
              {changePct !== null ? (
                <div className={`text-sm ${changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1324]" style={{ width: '100%' }}>
        <div className="px-4 pt-3 text-xs uppercase tracking-[0.35em] text-slate-400">OHLC Snapshot</div>
        <div ref={containerRef} className="w-full" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={handleDownloadPng} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">
          تنزيل PNG
        </button>
        <button onClick={handleDownloadJson} className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600">
          تنزيل JSON
        </button>
      </div>
    </section>
  );
}
