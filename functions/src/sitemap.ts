import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

export const sitemap = onRequest({ maxInstances: 1 }, async (req, res) => {
  if (req.method !== "GET") { res.status(405).send("Method not allowed"); return; }

  const db = getFirestore();
  const jobsSnap = await db.collection("jobs").where("status", "==", "ACTIVE").get();

  const staticPages = [
    { loc: "https://lupyxtalent.com", priority: "1.0", changefreq: "weekly" },
    { loc: "https://lupyxtalent.com/auth/signin", priority: "0.5", changefreq: "monthly" },
  ];

  const jobPages = jobsSnap.docs.map((doc) => ({
    loc: `https://lupyxtalent.com/postular/${doc.data().slug || doc.id}`,
    priority: "0.8",
    changefreq: "weekly",
  }));

  const allPages = [...staticPages, ...jobPages];
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.set("Cache-Control", "public, max-age=3600");
  res.status(200).send(xml);
});
