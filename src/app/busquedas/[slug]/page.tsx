import PublicLayout from "@/components/PublicLayout";
import JobDetailClient from "./JobDetailClient";

export function generateStaticParams() {
  return [
    { slug: "senior-backend-java" },
    { slug: "senior-marketing-designer" },
  ];
}

export default function JobDetailPage() {
  return (
    <PublicLayout>
      <JobDetailClient />
    </PublicLayout>
  );
}
