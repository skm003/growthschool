import { DashboardView } from "@/components/dashboard/DashboardView";

/** Home route — defaults to the "All" content-type view. */
export default function Home() {
  return <DashboardView contentType="all" />;
}
