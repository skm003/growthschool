import { notFound } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { ContentType } from "@/types";

const VALID: ContentType[] = ["talking-head", "podcast"];

/**
 * Content-type routes: /talking-head, /podcast, /behaviour.
 * (`/` is handled separately and maps to the "all" view.)
 * In Next.js 16, `params` is a Promise and must be awaited.
 */
export default async function ContentTypePage({
  params,
}: PageProps<"/[contentType]">) {
  const { contentType } = await params;

  if (!VALID.includes(contentType as ContentType)) {
    notFound();
  }

  return <DashboardView contentType={contentType as ContentType} />;
}

/** Pre-render the known content-type routes. */
export function generateStaticParams() {
  return VALID.map((contentType) => ({ contentType }));
}
