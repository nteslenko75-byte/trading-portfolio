import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";
import { ensureDailyCache } from "../../lib/priceProviders";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  // Беремо тикери з відкритих позицій
  const { data: tickers, error } = await supabase.rpc("list_unique_tickers");
  if (error) return res.status(500).json({ error: error.message });
  for (const t of tickers as { ticker: string }[]) {
    // eslint-disable-next-line no-await-in-loop
    await ensureDailyCache(t.ticker);
  }
  res.json({ ok: true, updated: tickers?.length || 0 });
}
