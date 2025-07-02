import { DataTable } from "~/components/table/data-table";
import { columns } from "./table/columns";
import { useGetAllTopUpByUser } from "~/services/top-up/get-by-user";
import { useMemo } from "react";

export default function SecondSection() {
  const { data } = useGetAllTopUpByUser({});

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => item.topup.jenis === "PENARIKAN SALDO");
  }, [data]);

  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-9">
        <h3 className="font-semibold text-lg">Riwayat Transfer</h3>
      </div>
      <div className="space-y-3 overflow-hidden rounded-md ">
        <DataTable
          columns={columns}
          data={filteredData}
          searchKey="topup_created_at"
          searchLabel="tanggal"
        />
      </div>
    </section>
  );
}
