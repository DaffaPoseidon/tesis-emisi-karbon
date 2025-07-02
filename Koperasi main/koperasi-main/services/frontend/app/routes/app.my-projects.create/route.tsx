import { type LoaderFunctionArgs, json } from "@remix-run/node";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import CreateProjectForm from "./components/form/create-project-form";

export async function loader({ params }: LoaderFunctionArgs) {
  return json({ params });
}

export default function CreateProjectPage() {
  return (
    <PageContainer>
      <div className="space-y-9">
        <div className="flex items-center gap-3">
          <BackButton to="/app/my-projects" />
          <h2 className="~text-base/2xl font-bold tracking-tight">Buat Pengajuan Proyek</h2>
        </div>
        <CreateProjectForm />
      </div>
    </PageContainer>
  );
}
