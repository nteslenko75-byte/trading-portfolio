import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  // Агрегуємо позиції з trades (buy - sell)
  const { data, error } = await supabase.rpc("get_open_positions");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
}
