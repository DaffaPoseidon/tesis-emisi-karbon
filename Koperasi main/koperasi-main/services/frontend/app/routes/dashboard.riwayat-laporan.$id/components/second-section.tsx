import { DataTable } from "~/components/table/data-table";
import Spinner from "~/components/ui/spinner";
import { useGetReportByProjectId } from "~/services/project-report/get-by-project-id";
import { columns } from "./table/columns";

interface Props {
  id: string | number;
}

export default function SecondSection({ id }: Props) {
  const { data, isLoading } = useGetReportByProjectId({ id, jenis_laporan: "RUGI" });
  const filteredData = data?.projectReport?.filter((report) => report.jenis_laporan === "RUGI");
  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-3 overflow-hidden rounded-md ">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : filteredData && filteredData.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredData}
            searchKey="judul"
            searchLabel="judul laporan"
          />
        ) : (
          <div className="text-center">Tidak ada data yang ditemukan.</div>
        )}
      </div>
    </section>
  );
}
