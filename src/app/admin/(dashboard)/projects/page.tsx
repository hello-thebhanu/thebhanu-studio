import type { Metadata } from "next";
import { ProjectsManagerClient } from "@/components/admin/ProjectsManagerClient";
import { getAdminProjectsOverview } from "@/lib/projects/db";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function AdminProjectsPage() {
  const data = await getAdminProjectsOverview();

  return (
    <ProjectsManagerClient
      schemaReady={data.schemaReady}
      errorMessage={data.errorMessage}
      initialProjects={data.projects}
    />
  );
}
