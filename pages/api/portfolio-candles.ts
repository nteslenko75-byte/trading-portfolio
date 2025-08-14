import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

// Aгрегація денних OHLC портфеля: сума по кожному активу Open/High/Low/Close * qty на початок дня.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query; // YYYY-MM-DD, опційно
  const { data, error } = await supabase.rpc("portfolio_daily_ohlc", { p_from: from || null, p_to: to || null });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
}
