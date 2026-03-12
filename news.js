// api/news.js — Vercel Serverless Function
// Proxy untuk NewsAPI.org agar mengatasi CORS di frontend

export default async function handler(req, res) {
  // === CORS Headers ===
  // Ganti "*" dengan domain spesifik kamu jika ingin lebih aman
  // Contoh: "https://namadomain.com"
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hanya izinkan GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  // Ambil API key dari environment variable (atur di Vercel Dashboard)
  const API_KEY = process.env.NEWS_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "NEWS_API_KEY belum diatur di environment variables" });
  }

  // Ambil semua query params dari request, lalu teruskan ke NewsAPI
  const queryParams = new URLSearchParams(req.query);

  // Tentukan endpoint NewsAPI berdasarkan param "endpoint" (opsional)
  // Default: /v2/top-headlines
  const endpoint = req.query.endpoint || "top-headlines";
  const validEndpoints = ["top-headlines", "everything", "sources"];

  if (!validEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: `Endpoint tidak valid. Pilihan: ${validEndpoints.join(", ")}` });
  }

  // Hapus param "endpoint" dari query agar tidak dikirim ke NewsAPI
  queryParams.delete("endpoint");

  // Tambahkan API key
  queryParams.set("apiKey", API_KEY);

  const newsApiUrl = `https://newsapi.org/v2/${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(newsApiUrl);
    const data = await response.json();

    // Teruskan status code dari NewsAPI
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error fetching NewsAPI:", error);
    return res.status(500).json({ error: "Gagal menghubungi NewsAPI", details: error.message });
  }
}
