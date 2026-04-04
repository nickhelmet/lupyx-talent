/**
 * One-off migration: create candidates from existing applications
 * Run: GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json npx ts-node scripts/migrate-applications-to-candidates.ts
 */

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp({ projectId: "lupyx-talent" });
const db = getFirestore();

async function migrate() {
  console.log("Migrating applications → candidates...\n");

  const appsSnap = await db.collection("applications").orderBy("appliedAt", "desc").get();
  console.log(`Found ${appsSnap.size} applications`);

  // Group by email to avoid duplicates
  const byEmail = new Map<string, { apps: FirebaseFirestore.QueryDocumentSnapshot[]; }>();
  for (const doc of appsSnap.docs) {
    const email = doc.data().email as string;
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, { apps: [] });
    byEmail.get(email)!.apps.push(doc);
  }

  console.log(`Unique emails: ${byEmail.size}\n`);

  let created = 0;
  let skipped = 0;

  for (const [email, { apps }] of byEmail) {
    // Check if candidate already exists
    const existing = await db.collection("candidates")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Update matchHistory with any missing applications
      const candidateDoc = existing.docs[0];
      const data = candidateDoc.data();
      const history = Array.isArray(data.matchHistory) ? data.matchHistory : [];
      const existingAppIds = new Set(history.map((h: { applicationId?: string }) => h.applicationId));

      let updated = false;
      for (const appDoc of apps) {
        const app = appDoc.data();
        if (!existingAppIds.has(appDoc.id)) {
          history.push({
            jobId: app.jobId,
            jobTitle: app.jobTitle,
            applicationId: appDoc.id,
            date: app.appliedAt?._seconds
              ? new Date(app.appliedAt._seconds * 1000).toISOString()
              : new Date().toISOString(),
          });
          updated = true;
        }
      }

      if (updated) {
        await candidateDoc.ref.update({ matchHistory: history, updatedAt: FieldValue.serverTimestamp() });
        console.log(`  ↻ Updated: ${email} (added ${apps.length - existingAppIds.size} jobs to history)`);
      } else {
        console.log(`  – Skipped: ${email} (already up to date)`);
      }
      skipped++;
      continue;
    }

    // Create new candidate from most recent application
    const latestApp = apps[0].data();
    const matchHistory = apps.map((appDoc) => {
      const app = appDoc.data();
      return {
        jobId: app.jobId,
        jobTitle: app.jobTitle,
        applicationId: appDoc.id,
        date: app.appliedAt?._seconds
          ? new Date(app.appliedAt._seconds * 1000).toISOString()
          : new Date().toISOString(),
      };
    });

    await db.collection("candidates").add({
      firstName: latestApp.firstName || "",
      lastName: latestApp.lastName || "",
      email,
      phone: latestApp.phone || null,
      city: latestApp.city || null,
      skills: [],
      notes: null,
      tags: [],
      source: "application",
      cvPath: latestApp.cvPath || null,
      cvAnalysis: null,
      matchHistory,
      createdBy: "migration",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log(`  ✓ Created: ${email} (${latestApp.firstName} ${latestApp.lastName}) — ${apps.length} application(s)`);
    created++;
  }

  console.log(`\nMigration complete: ${created} created, ${skipped} skipped/updated`);
}

migrate().catch(console.error);
