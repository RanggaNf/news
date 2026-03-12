// api/news.js — Vercel Serverless Function
// Proxy gabungan: NewsAPI.org + GNews API

export default async function handler(req, res) {
  // === CORS Headers ===
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method tidak diizinkan" });

  const source = req.query.source || "gnews";

  if (source === "newsapi") {
    return handleNewsAPI(req, res);
  } else if (source === "gnews") {
    return handleGNews(req, res);
  } else {
    return res.status(400).json({ error: 'Parameter "source" tidak valid. Pilihan: newsapi, gnews' });
  }
}

async function handleNewsAPI(req, res) {
  const API_KEY = process.env.NEWS_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "NEWS_API_KEY belum diatur di environment variables" });
  }

  const endpoint = req.query.endpoint || "top-headlines";
  const validEndpoints = ["top-headlines", "everything", "sources"];

  if (!validEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: `Endpoint NewsAPI tidak valid. Pilihan: ${validEndpoints.join(", ")}` });
  }

  const queryParams = new URLSearchParams(req.query);
  queryParams.delete("source");
  queryParams.delete("endpoint");
  queryParams.set("apiKey", API_KEY);

  const url = `https://newsapi.org/v2/${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Gagal menghubungi NewsAPI", details: error.message });
  }
}

async function handleGNews(req, res) {
  const API_KEY = process.env.GNEWS_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "GNEWS_API_KEY belum diatur di environment variables" });
  }

  const endpoint = req.query.endpoint || "top-headlines";
  const validEndpoints = ["top-headlines", "search"];

  if (!validEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: `Endpoint GNews tidak valid. Pilihan: ${validEndpoints.join(", ")}` });
  }

  const queryParams = new URLSearchParams(req.query);
  queryParams.delete("source");
  queryParams.delete("endpoint");
  queryParams.set("token", API_KEY);

  // Hapus country - tidak support di plan gratis GNews
  queryParams.delete("country");

  // Default bahasa Indonesia
  if (!queryParams.has("lang")) queryParams.set("lang", "id");

  // top-headlines wajib ada category atau q
  if (endpoint === "top-headlines" && !queryParams.has("q") && !queryParams.has("category")) {
    queryParams.set("category", "general");
  }

  const url = `https://gnews.io/api/v4/${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Gagal menghubungi GNews", details: error.message });
  }
}
