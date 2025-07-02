import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { columns } from "./components/table/columns";
import { useGetAllSaldo } from "~/services/top-up/get-saldo";

export default function PenarikanSaldoPage() {
  const { data } = useGetAllSaldo({});
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Penarikan Saldo</h2>
        </div>
        <div className="space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
          <DataTable
            columns={columns}
            data={data || []}
            searchKey="topup_nama"
            searchLabel="Nama Anggota"
          />
        </div>
      </div>
    </PageContainer>
  );
}
