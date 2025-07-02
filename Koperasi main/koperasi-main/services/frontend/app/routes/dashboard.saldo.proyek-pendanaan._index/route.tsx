import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { columns } from "./components/table/columns";
import Spinner from "~/components/ui/spinner";
import { useGetAllProjectWallet } from "~/services/project-wallet/get-all";
import { useMemo } from "react";

export default function ProyekPendanaanPage() {
  const { data, isLoading } = useGetAllProjectWallet();

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      [
        "BERJALAN",
        "BERJALAN SIKLUS 2",
        "BERJALAN SIKLUS 3",
        "BERJALAN SIKLUS 4",
        "BERJALAN SIKLUS 5",
        "BERJALAN SIKLUS 6",
        "BERJALAN SIKLUS 7",
        "BERJALAN SIKLUS 8",
        "BERJALAN SIKLUS 9",
        "BERJALAN SIKLUS 10",
        "BERJALAN SIKLUS 11",
        "BERJALAN SIKLUS 12",
        "BERJALAN SIKLUS 13",
        "BERJALAN SIKLUS 14",
        "BERJALAN SIKLUS 15",
        "BERJALAN SIKLUS 16",
        "BERJALAN SIKLUS 17",
        "BERJALAN SIKLUS 18",
        "BERJALAN SIKLUS 19",
        "BERJALAN SIKLUS 20",
      ].includes(item.project?.status || ""),
    );
  }, [data]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Dompet Proyek Pendanaan</h2>
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
              searchKey="project_judul"
              searchLabel="Nama Proyek"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
