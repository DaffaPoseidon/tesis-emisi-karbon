import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ProjectUseTokenCard from "~/components/cards/project-used-token-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useJWTPayload } from "~/hooks/use-jwt-payload";
import { useGetAllChartToken } from "~/services/chart-token/get-all";
import { useGetAllTokenUsage } from "~/services/token/token-usage";
import { useGetSumSimpananPokok } from "~/services/top-up/get-sum-simpanan-pokok";
import { useGetSumSimpananWajib } from "~/services/top-up/get-sum-simpanan-wajib";
import { useGetTransactionByUserId } from "~/services/transaction/get-by-user-id";
import toRupiah from "~/utils/to-rupiah";

export default function PlatinumDashboard() {
  // const [_searchParams, setSearchParams] = useSearchParams();
  const { jwtPayload } = useJWTPayload();
  const [simpananData, setSimpananData] = useState({
    simpananPokok: 0,
    simpananWajib: 0,
  });
  const { data: simpananPokok } = useGetSumSimpananPokok();
  const { data: simpananWajib } = useGetSumSimpananWajib();
  const { data: historyTransaction, isError: transactionError } = useGetTransactionByUserId(
    jwtPayload?.id,
  );
  const { data: ChartData } = useGetAllChartToken();
  const { data, isError } = useGetAllTokenUsage();

  // const filterOptions = Object.values(StatusProject).map((status) => ({
  //   label: status,
  //   value: status,
  // }));

  useMemo(() => {
    if (simpananPokok) {
      setSimpananData((prev) => ({ ...prev, simpananPokok: Number(simpananPokok.total) }));
    }
    if (simpananWajib) {
      setSimpananData((prev) => ({ ...prev, simpananWajib: Number(simpananWajib.total) }));
    }
  }, [simpananPokok, simpananWajib]);

  const GraphData = useMemo(() => {
    if (ChartData === undefined) return [];
    return ChartData.map((item) => ({
      name: `${item.month} ${item.year}`,
      value: Number.parseInt(item.sum_nominal),
    }));
  }, [ChartData]);

  // const handleFilterChange = (value: string) => {
  //   const params = new URLSearchParams();
  //   if (value !== "") {
  //     params.set("filter", value);
  //     setSearchParams(params, {
  //       preventScrollReset: true,
  //     });
  //     return;
  //   }
  //   params.delete("filter");
  //   setSearchParams(params, {
  //     preventScrollReset: true,
  //   });
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-2xl tracking-tight">Dashboard</h2>
      </div>
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <CardDashboard title="Simpanan Wajib" value={toRupiah(simpananData.simpananWajib)} />
        <CardDashboard title="Simpanan Pokok" value={toRupiah(simpananData.simpananPokok)} />
      </div>
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grafik Performa Penyertaan Modal Usaha</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <ResponsiveContainer width="100%" height={300} className="w-full overflow-auto">
              <LineChart data={GraphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 14, width: 250 }}
                />
                <YAxis
                  dataKey="value"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 14, width: 250 }}
                />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historyTransaction?.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.transaction.judul_projek}</p>
                    <p className="text-muted-foreground text-sm">{item.transaction.created_at}</p>
                  </div>
                  <p className={"font-medium text-green-500"}>
                    {toRupiah(Number(item.transaction.total_nominal))}
                  </p>
                </div>
              ))}
              {transactionError && (
                <div className="col-span-1 mx-auto items-center justify-center md:col-span-2 xl:col-span-3">
                  <p className="text-center text-gray-500">Tidak ada transaksi yang ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-xl tracking-tight">Detail Penggunaan Token</h3>
          {/* <Combobox
            placeholder="Filter proyek..."
            searchPlaceholder="Filter proyek..."
            items={filterOptions}
            onValueChange={handleFilterChange}
          /> */}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {data?.map((item, index) => (
            <ProjectUseTokenCard key={index} data={item} to={`/app/token/${item.id}`} />
          ))}
          {isError && (
            <div className="col-span-1 mx-auto items-center justify-center md:col-span-2 xl:col-span-3">
              <p className="text-center text-gray-500">Tidak ada proyek yang ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardDashboard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl">{value}</div>
      </CardContent>
    </Card>
  );
}
