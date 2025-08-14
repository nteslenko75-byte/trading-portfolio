// Провайдери щоденних OHLC для US акцій/ETF з фолбеком і кешем у Supabase.
import { supabase } from "./supabaseClient";

const ALPHA = process.env.ALPHAVANTAGE_API_KEY;
const TWELVE = process.env.TWELVEDATA_API_KEY;

export type DailyBar = { date: string; open: number; high: number; low: number; close: number };

async function fetchAlphaVantage(ticker: string): Promise<DailyBar[] | null> {
  if (!ALPHA) return null;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
    ticker
  )}&outputsize=compact&apikey=${ALPHA}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const ts = j["Time Series (Daily)"];
  if (!ts) return null;
  return Object.keys(ts)
    .sort()
    .map((d) => ({
      date: d,
      open: parseFloat(ts[d]["1. open"]),
      high: parseFloat(ts[d]["2. high"]),
      low: parseFloat(ts[d]["3. low"]),
      close: parseFloat(ts[d]["4. close"]),
    }));
}

async function fetchTwelveData(ticker: string): Promise<DailyBar[] | null> {
  if (!TWELVE) return null;
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
    ticker
  )}&interval=1day&outputsize=5000&format=JSON&apikey=${TWELVE}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  if (!j?.values) return null;
  return j.values
    .slice()
    .reverse()
    .map((v: any) => ({
      date: v.datetime.split(" ")[0],
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }));
}

export async function ensureDailyCache(ticker: string): Promise<void> {
  // Читаємо останню дату кешу
  const { data: last, error: e1 } = await supabase
    .from("price_cache_daily")
    .select("date")
    .eq("ticker", ticker)
    .order("date", { ascending: false })
    .limit(1);
  if (e1) console.error(e1);

  // Тягнемо свіжі дані з провайдерів
  const [a, b] = await Promise.all([fetchAlphaVantage(ticker), fetchTwelveData(ticker)]);
  const bars = a || b;
  if (!bars) return;

  // Фільтр нових записів (порівняно з останньою датою в кеші)
  const lastDate = last?.[0]?.date ?? "1900-01-01";
  const fresh = bars.filter((bar) => bar.date > lastDate);
  if (!fresh.length) return;

  const rows = fresh.map((bar) => ({
    ticker,
    date: bar.date,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    source: a ? "alphavantage" : "twelvedata",
  }));

  const { error: e2 } = await supabase.from("price_cache_daily").insert(rows);
  if (e2) console.error(e2);
}

export async function readDailyFromCache(ticker: string): Promise<DailyBar[]> {
  const { data, error } = await supabase
    .from("price_cache_daily")
    .select("date, open, high, low, close")
    .eq("ticker", ticker)
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []) as DailyBar[];
}
