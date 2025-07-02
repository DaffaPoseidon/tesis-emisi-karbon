import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { columns } from "./components/table/columns";
import { useGetAllProject } from "~/services/projects/get-all";
import Spinner from "~/components/ui/spinner";
import { useMemo } from "react";

export default function PenarikanProyekPage() {
  const { data, isLoading } = useGetAllProject();

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.status === "SELESAI");
  }, [data]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Dompet Penarikan Saldo Proyek</h2>
        </div>
        <div className="space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
          {isLoading ? (
            <div className="mx-auto flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              searchKey="judul"
              searchLabel="Nama Proyek"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
