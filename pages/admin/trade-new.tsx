import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";

export default function TradeNew() {
  const [ticker, setTicker] = useState("");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);
  const [executedAt, setExecutedAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Мінімальна перевірка авторизації
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("trades").insert({
      portfolio_id: null, // null = портфель за замовчуванням (див. view);
      ticker: ticker.trim().toUpperCase(),
      side,
      qty,
      price,
      fee,
      executed_at: new Date(executedAt).toISOString(),
      note,
    });
    setMsg(error ? error.message : "Угоду збережено.");
  }

  async function importCsv(file: File) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean);
    // Очікуємо заголовки: ticker,side,qty,price,fee,executed_at,note
    const [header, ...lines] = rows;
    const cols = header.split(",").map((s) => s.trim().toLowerCase());
    const idx = (name: string) => cols.indexOf(name);
    const payload = lines.map((line) => {
      const c = line.split(",");
      return {
        portfolio_id: null,
        ticker: c[idx("ticker")].toUpperCase(),
        side: c[idx("side")] as "buy" | "sell",
        qty: parseFloat(c[idx("qty")]),
        price: parseFloat(c[idx("price")]),
        fee: parseFloat(c[idx("fee")] || "0"),
        executed_at: new Date(c[idx("executed_at")]).toISOString(),
        note: c[idx("note")] || null,
      };
    });
    const { error } = await supabase.from("trades").insert(payload);
    setMsg(error ? error.message : `Імпортовано: ${payload.length}`);
  }

  return (
    <div className="max-w-2xl mx-auto card p-6 space-y-4">
      <h2 className="text-lg font-medium">Нова угода</h2>
      <form className="grid grid-cols-2 gap-4" onSubmit={submit}>
        <div><label className="label">Тикер</label><input className="input" value={ticker} onChange={(e) => setTicker(e.target.value)} required /></div>
        <div><label className="label">Сторона</label>
          <select className="input" value={side} onChange={(e) => setSide(e.target.value as any)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div><label className="label">Кількість</label><input className="input" type="number" step="1" value={qty} onChange={(e) => setQty(parseFloat(e.target.value))} required /></div>
        <div><label className="label">Ціна</label><input className="input" type="number" step="0.0001" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} required /></div>
        <div><label className="label">Комісія ($)</label><input className="input" type="number" step="0.01" value={fee} onChange={(e) => setFee(parseFloat(e.target.value))} /></div>
        <div><label className="label">Час виконання</label><input className="input" type="datetime-local" value={executedAt} onChange={(e) => setExecutedAt(e.target.value)} required /></div>
        <div className="col-span-2"><label className="label">Нотатка</label><textarea className="input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="col-span-2"><button className="btn" type="submit">Зберегти</button></div>
      </form>

      <div>
        <h3 className="text-base font-medium mb-2">Імпорт CSV</h3>
        <input className="input" type="file" accept=".csv" onChange={(e) => e.target.files && importCsv(e.target.files[0])} />
        <p className="text-neutral-400 text-sm mt-2">Формат: <code>ticker,side,qty,price,fee,executed_at,note</code></p>
      </div>
      {msg && <p className="text-neutral-300">{msg}</p>}
    </div>
  );
}
