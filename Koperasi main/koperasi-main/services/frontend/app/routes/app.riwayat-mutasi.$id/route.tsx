import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { useGetMutationByProjectId } from "~/services/mutation/get-by-project-id";
import { columns } from "./components/table/columns";

export async function loader({ params }: LoaderFunctionArgs) {
  return {
    id: params.id,
  };
}

export default function RiwayatLaporanMutasi() {
  const data = useLoaderData<typeof loader>();
  const { data: mutasiData } = useGetMutationByProjectId(data.id ?? "");
  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BackButton to={`/app/token/${data.id}`} />
          <h2 className="~text-base/2xl font-bold tracking-tight">Rekap Laba Rugi</h2>
        </div>
        <div className="space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
          <DataTable
            columns={columns}
            data={mutasiData?.mutation ?? []}
            searchKey="title"
            searchLabel="judul laporan"
          />
        </div>
      </div>
    </PageContainer>
  );
}
