# NewsAPI CORS Proxy — Vercel

Serverless proxy untuk NewsAPI.org agar bisa dipanggil dari frontend tanpa masalah CORS.

---

## 🚀 Deploy ke Vercel

### Cara 1: Via GitHub (Direkomendasikan)
1. Push folder ini ke repositori GitHub
2. Buka [vercel.com](https://vercel.com) → New Project → Import repo
3. Di **Environment Variables**, tambahkan:
   - `NEWS_API_KEY` = API key kamu dari [newsapi.org](https://newsapi.org)
4. Klik **Deploy**

### Cara 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
# Ikuti instruksi, lalu set env variable:
vercel env add NEWS_API_KEY
```

---

## 📡 Cara Pakai dari Frontend

Setelah deploy, domain kamu akan jadi seperti: `https://nama-project.vercel.app`

### Endpoint yang tersedia
```
GET /api/news?endpoint=top-headlines&country=id
GET /api/news?endpoint=everything&q=teknologi&language=id
GET /api/news?endpoint=sources&language=id
```

### Contoh fetch dari JavaScript
```javascript
// Top headlines Indonesia
const res = await fetch('https://nama-project.vercel.app/api/news?endpoint=top-headlines&country=id');
const data = await res.json();
console.log(data.articles);

// Cari berita tentang AI
const res2 = await fetch('https://nama-project.vercel.app/api/news?endpoint=everything&q=artificial+intelligence&language=id&pageSize=10');
const data2 = await res2.json();
```

### Parameter yang didukung
Semua parameter NewsAPI bisa dipakai langsung. Tambahkan satu parameter khusus:

| Parameter  | Keterangan                                     | Default          |
|------------|------------------------------------------------|------------------|
| `endpoint` | `top-headlines`, `everything`, atau `sources`  | `top-headlines`  |

---

## 🔒 Keamanan (Opsional)

Jika ingin membatasi akses hanya dari domain tertentu, ubah baris ini di `api/news.js`:

```js
// Sebelum (semua domain boleh akses):
res.setHeader("Access-Control-Allow-Origin", "*");

// Sesudah (hanya domain kamu):
res.setHeader("Access-Control-Allow-Origin", "https://namadomain.com");
```

---

## 🛠 Development Lokal

```bash
# Install Vercel CLI
npm i -g vercel

# Copy env
cp .env.example .env.local
# Edit .env.local, isi NEWS_API_KEY

# Jalankan lokal
vercel dev
# Proxy aktif di: http://localhost:3000/api/news
```
