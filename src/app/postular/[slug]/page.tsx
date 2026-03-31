import PostularClient from "./PostularClient";

export function generateStaticParams() {
  return [
    { slug: "senior-backend-java" },
    { slug: "senior-marketing-designer" },
  ];
}

export default function PostularPage() {
  return <PostularClient />;
}
