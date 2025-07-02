import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import { httpClient } from "~/lib/http";
import type { Proyek } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";
import EditProjectForm from "./components/form/edit-project-form";

export async function loader({ params }: LoaderFunctionArgs) {
  const response = await httpClient.get<BaseResponse<Proyek>>(`/project/${params.id}`);
  if (response.data.data === undefined) return {} as Proyek;
  return response.data.data;
}

export default function CreateProjectPage() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageContainer>
      <div className="space-y-9">
        <div className="flex items-center gap-3">
          <BackButton to="/app/my-projects" />
          <h2 className="~text-base/2xl font-bold tracking-tight">Buat Pengajuan Proyek</h2>
        </div>
        <EditProjectForm data={data as Proyek} />
      </div>
    </PageContainer>
  );
}
