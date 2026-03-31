import { onSchedule } from "firebase-functions/v2/scheduler";

// Daily Firestore backup - exports all collections to Cloud Storage
// Requires: Cloud Storage bucket and Firestore export permissions
// Schedule: every day at 3:00 AM UTC
export const scheduledBackup = onSchedule(
  { schedule: "0 3 * * *", timeZone: "America/Argentina/Buenos_Aires", maxInstances: 1 },
  async () => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    if (!projectId) {
      console.error("No project ID found");
      return;
    }

    const client = new (await import("@google-cloud/firestore")).v1.FirestoreAdminClient();
    const databaseName = client.databasePath(projectId, "(default)");

    try {
      const [response] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: `gs://${projectId}-backups/firestore/${new Date().toISOString().split("T")[0]}`,
        collectionIds: [], // Empty = all collections
      });
      console.log(`Backup started: ${response.name}`);
    } catch (error) {
      console.error("Backup failed:", error);
    }
  },
);
