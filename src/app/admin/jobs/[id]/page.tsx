import EditJobClient from "./EditJobClient";

export function generateStaticParams() {
  return [
    { id: "senior-backend-java" },
    { id: "senior-marketing-designer" },
  ];
}

export default function EditJobPage() {
  return <EditJobClient />;
}
