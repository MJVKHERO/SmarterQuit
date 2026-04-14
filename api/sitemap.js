export default async function handler(req, res) {
  const SUPABASE_URL = "https://srrxlvhggbhkoxiawcsg.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycnhsdmhnZ2Joa294aWF3Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA4MjYsImV4cCI6MjA5MTI5NjgyNn0.CjvRIXYcXJnLCc6-DYbOXbr9fio2TSHo5cexjjUtxCU";
  const BASE_URL = "https://smarterquit.com";

  try {
    // Fetch all published blog posts from Supabase
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,published_at&published=eq.true&order=published_at.desc`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const posts = await response.json();
    const today = new Date().toISOString().split("T")[0];

    // If Supabase returned an error object, log it and fall back to empty
    if (!Array.isArray(posts)) {
      console.error("Supabase sitemap error:", posts);
    }

    // Static pages
    const staticPages = [
      { url: "/",       priority: "1.0", changefreq: "weekly",  lastmod: today },
      { url: "/blog",   priority: "0.8", changefreq: "weekly",  lastmod: today },
      { url: "/privacy",priority: "0.3", changefreq: "yearly",  lastmod: "2025-01-01" },
      { url: "/terms",  priority: "0.3", changefreq: "yearly",  lastmod: "2025-01-01" },
      { url: "/refund", priority: "0.3", changefreq: "yearly",  lastmod: "2025-01-01" },
    ];

    const staticXml = staticPages.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("");

    // Blog posts
    const blogXml = (Array.isArray(posts) ? posts : []).map(post => {
      const lastmod = post.published_at ? post.published_at.split("T")[0] : today;
      return `
  <url>
    <loc>${BASE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${blogXml}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap error:", error);
    res.status(500).send("Error generating sitemap");
  }
}
