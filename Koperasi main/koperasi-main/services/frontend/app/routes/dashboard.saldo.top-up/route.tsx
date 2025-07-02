import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { useGetAllTopUp } from "~/services/top-up/get-all";
import { columns } from "./components/table/columns";
import { useMemo } from "react";
import Spinner from "~/components/ui/spinner";

export default function TopUpPage() {
  const { data, isLoading } = useGetAllTopUp({});

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) =>
      [
        "SIMPANAN POKOK",
        "SIMPANAN WAJIB",
        "TOPUP SALDO",
        "UPGRADE USER",
      ].includes(item.topup.jenis || "")
    );
  }, [data]);
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Top Up</h2>
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
              searchKey="topup_nama"
              searchLabel="Nama User"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
