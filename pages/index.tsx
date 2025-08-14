import { useEffect, useRef, useState } from "react";
import { createChart, ISeriesApi, CandlestickData } from "lightweight-charts";

type PositionRow = { ticker: string; qty: number; avg_price: number; last_close: number; market_value: number; weight_pct: number };

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState<PositionRow[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: { background: { color: "#0a0a0a" }, textColor: "#d4d4d4" },
      grid: { vertLines: { color: "#111" }, horzLines: { color: "#111" } },
      width: containerRef.current.clientWidth,
      height: 420,
      timeScale: { timeVisible: false, secondsVisible: false, fixLeftEdge: true },
      localization: { locale: "uk-UA" },
    });
    const series = chart.addCandlestickSeries();
    seriesRef.current = series;

    const handle = () => chart.applyOptions({ width: containerRef.current!.clientWidth });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  async function loadData() {
    setLoading(true);
    const [candlesRes, posRes] = await Promise.all([
      fetch("/api/portfolio-candles").then((r) => r.json()),
      fetch("/api/open-positions").then((r) => r.json()),
    ]);
    const candles = (candlesRes?.data || []).map((c: any) => ({
      time: c.date, open: c.open, high: c.high, low: c.low, close: c.close,
    })) as CandlestickData[];
    seriesRef.current?.setData(candles);
    setPositions(posRes?.data || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Портфель — денні свічки (київський час)</h2>
          <div className="flex gap-2">
            <button className="btn" onClick={loadData} disabled={loading}>{loading ? "Оновлюю…" : "Оновити"}</button>
            <a className="btn" href="/api/refresh-prices">Оновити ціни (кеш)</a>
          </div>
        </div>
        <div ref={containerRef} />
      </div>

      <div className="card p-4">
        <h3 className="text-base font-medium mb-3">Відкриті позиції</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Тикер</th>
                <th className="th text-right">К-сть</th>
                <th className="th text-right">Сер. ціна</th>
                <th className="th text-right">Останнє Close</th>
                <th className="th text-right">Вартість</th>
                <th className="th text-right">Вага</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.ticker}>
                  <td className="td">{p.ticker}</td>
                  <td className="td text-right">{p.qty}</td>
                  <td className="td text-right">${p.avg_price.toFixed(2)}</td>
                  <td className="td text-right">${p.last_close.toFixed(2)}</td>
                  <td className="td text-right">${p.market_value.toFixed(2)}</td>
                  <td className="td text-right">{p.weight_pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <a className="btn" href="/trades">Подивитись усі угоди</a>
        </div>
      </div>
    </div>
  );
}
