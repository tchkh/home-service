import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.length < 3) {
    return res.status(400).json({ error: "Query too short or missing" });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&accept-language=th`;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "TechUpHomeService/1.0 (your@email.com)",
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: "Upstream error" });
    }
    const data = await response.json();
    // Set CORS headers for local dev
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
