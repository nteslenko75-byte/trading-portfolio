import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;
  let q = supabase.from("posts").select("*").eq("status", "published").order("published_at", { ascending: false });
  if (slug) q = q.eq("slug", slug);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
}
