/**
 * Seed script for Firestore
 * Run: npx ts-node scripts/seed.ts
 * Or via firebase admin in functions shell
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize with default credentials (requires GOOGLE_APPLICATION_CREDENTIALS env)
initializeApp();
const db = getFirestore();

async function seed() {
  console.log("Seeding Firestore...");

  // Seed active jobs
  const jobs = [
    {
      title: "Senior Backend Engineer",
      company: "Empresa confidencial",
      description:
        "Buscamos un Senior Backend Engineer con experiencia sólida en Java 21 para sumarse a un equipo de alto rendimiento.",
      requirements:
        "4.5+ años de experiencia en backend development. Java 21. Título universitario. Experiencia en arquitecturas de microservicios.",
      location: "Buenos Aires / Santa Fe, Argentina",
      type: "CONTRACT" as const,
      status: "ACTIVE" as const,
      slug: "senior-backend-java",
      linkedinUrl: "https://www.linkedin.com/company/lupyx-talent/jobs/",
      tags: ["Java 21", "Backend", "+4.5 años exp.", "Título universitario"],
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: "Senior Marketing Designer",
      company: "Startup AI en crecimiento",
      description:
        "Sumate a una startup de IA en pleno crecimiento como Senior Marketing Designer. Diseñá piezas que impacten.",
      requirements:
        "3-5 años de experiencia en marketing/product design. Inglés avanzado. Figma, Webflow, Photoshop, After Effects.",
      location: "100% Remoto — LATAM",
      type: "CONTRACT" as const,
      status: "ACTIVE" as const,
      slug: "senior-marketing-designer",
      linkedinUrl: "https://www.linkedin.com/company/lupyx-talent/jobs/",
      tags: [
        "Figma",
        "Webflow",
        "After Effects",
        "Inglés avanzado",
        "3-5 años exp.",
      ],
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const job of jobs) {
    await db.collection("jobs").doc(job.slug).set(job);
    console.log(`  ✓ Job: ${job.title}`);
  }

  // Seed config/allowlist
  await db.doc("config/allowlist").set({
    allowed_emails: [
      "jm@lupyxtalent.com",
      "nico.nrc@gmail.com",
      "josefina.marchese@gmail.com",
    ],
    admin_emails: [
      "jm@lupyxtalent.com",
      "nico.nrc@gmail.com",
    ],
    blocked_emails: [],
    updated_at: new Date().toISOString(),
    updated_by: "seed",
  });
  console.log("  ✓ Config: allowlist");

  console.log("\nSeed complete!");
}

seed().catch(console.error);
