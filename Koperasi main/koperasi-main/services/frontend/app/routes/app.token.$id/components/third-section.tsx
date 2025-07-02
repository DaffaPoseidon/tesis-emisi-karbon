import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import Spinner from "~/components/ui/spinner";
import { useGetHistoryTokenByID } from "~/services/history-token/get-by-id";
import { columns } from "./table/columns";
import { useParams } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ThirdSection() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetHistoryTokenByID(id ?? "");

  const transformedData =
    data
      ?.map((item) => ({
        date: new Date(item.created_at).toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        }),
        value: item.nilai,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      }) || [];

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="space-y-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grafik Performa Penyertaan Modal Usaha</CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              <ResponsiveContainer width="100%" height={300} className="w-full overflow-auto">
                <LineChart data={transformedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 14 }} />
                  <YAxis dataKey="value" tick={{ fontSize: 14 }} tickFormatter={formatNumber} />
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    labelFormatter={(label) => `Periode: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={{ fill: "#16A34A", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
          {isLoading ? (
            <div className="mx-auto flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data ?? []}
              searchKey="created_at"
              searchLabel="tanggal"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
