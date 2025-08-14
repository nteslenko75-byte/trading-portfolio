import { useEffect, useState } from "react";

export default function Trades() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/trades").then((r) => r.json()).then((j) => setRows(j.data || [])); }, []);
  return (
    <div className="card p-4">
      <h2 className="text-lg font-medium mb-3">Історія угод</h2>
      <div className="overflow-x-auto">
        <table className="table">
          <thead><tr>
            <th className="th">Дата</th>
            <th className="th">Тикер</th>
            <th className="th">Сторона</th>
            <th className="th text-right">К-сть</th>
            <th className="th text-right">Ціна</th>
            <th className="th text-right">Комісія</th>
            <th className="th">Нотатка</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td">{new Date(r.executed_at).toLocaleString()}</td>
                <td className="td">{r.ticker}</td>
                <td className="td">{r.side}</td>
                <td className="td text-right">{r.qty}</td>
                <td className="td text-right">${r.price.toFixed(2)}</td>
                <td className="td text-right">${(r.fee ?? 0).toFixed(2)}</td>
                <td className="td">{r.note || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
