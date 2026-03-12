export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method tidak diizinkan" });

  const source = req.query.source || "gnews";

  if (source === "newsapi") return handleNewsAPI(req, res);
  if (source === "gnews") return handleGNews(req, res);
  return res.status(400).json({ error: "source tidak valid. Pilihan: newsapi, gnews" });
}

async function handleNewsAPI(req, res) {
  const API_KEY = process.env.NEWS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "NEWS_API_KEY belum diatur" });

  const endpoint = req.query.endpoint || "top-headlines";
  if (!["top-headlines", "everything", "sources"].includes(endpoint)) {
    return res.status(400).json({ error: "Endpoint NewsAPI tidak valid" });
  }

  const q = new URLSearchParams(req.query);
  q.delete("source"); q.delete("endpoint");
  q.set("apiKey", API_KEY);

  const response = await fetch(`https://newsapi.org/v2/${endpoint}?${q}`);
  const data = await response.json();
  return res.status(response.status).json(data);
}

async function handleGNews(req, res) {
  const API_KEY = process.env.GNEWS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "GNEWS_API_KEY belum diatur" });

  const endpoint = req.query.endpoint || "top-headlines";
  if (!["top-headlines", "search"].includes(endpoint)) {
    return res.status(400).json({ error: "Endpoint GNews tidak valid" });
  }

  const q = new URLSearchParams(req.query);
  q.delete("source"); q.delete("endpoint"); q.delete("country");
  q.set("token", API_KEY);
  if (!q.has("lang")) q.set("lang", "id");
  if (endpoint === "top-headlines" && !q.has("q") && !q.has("category")) {
    q.set("category", "general");
  }

  const response = await fetch(`https://gnews.io/api/v4/${endpoint}?${q}`);
  const data = await response.json();
  return res.status(response.status).json(data);
}
