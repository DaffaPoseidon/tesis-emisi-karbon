import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { columns } from "./components/table/columns";
import Spinner from "~/components/ui/spinner";
import { useGetPemilikPelaksana } from "~/services/top-up/get-bagian-pemilik-pelaksana";

export default function SharingManajamenPage() {
  const { data, isLoading } = useGetPemilikPelaksana({ isDashboard: true });
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">
            Dompet Sharing Manajemen & Pemilik Proyek
          </h2>
        </div>
        <div className="space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
          {isLoading ? (
            <div className="mx-auto flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data || []}
              searchKey="nama"
              searchLabel="Nama Anggota"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
