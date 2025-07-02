import { Link } from "@remix-run/react";
import { Icons } from "~/components/icons";
import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import Spinner from "~/components/ui/spinner";
import { useCountProjects } from "~/services/projects/count";
import { useGetAllTopUp } from "~/services/top-up/get-all";
import { useGetKasKoperasi } from "~/services/top-up/kas-koperasi";
import { useCountUsers } from "~/services/user/count";
import toRupiah from "~/utils/to-rupiah";
import { columns } from "./components/table/columns";

export default function DashboardPage() {
  const { data: countUsers } = useCountUsers();
  const { data: countProjects } = useCountProjects();
  const { data: kasKoperasi } = useGetKasKoperasi();
  console.log("kasKoperasi", kasKoperasi);
  const { data: topUpData, isLoading } = useGetAllTopUp({ isDashboard: true });

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Dashboard</h2>
        </div>
        <section className="grid grid-cols-1 gap-2 xl:grid-cols-3">
          <DashboardCard value={countUsers} title="Total User" icon="users" />
          <DashboardCard value={countProjects} title="Total Proyek" icon="project" />
          <DashboardCard
            value={toRupiah(kasKoperasi?.total ?? 0)}
            title="Kas Koperasi"
            icon="moon"
          />
        </section>
        <div className="space-y-3 overflow-auto rounded-md bg-white p-5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xl">10 Top Up Terakhir</h3>
            <Button asChild variant="outline">
              <Link to="/dashboard/saldo/top-up">Lihat Semua</Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="mx-auto flex items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={topUpData || []}
              searchKey="topup_nama"
              searchLabel="Nama User"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: { title?: string; value?: number | string; icon?: keyof typeof Icons }) {
  const Icon = Icons[icon || "arrowRight"];
  return (
    <Card className="w-full flex-1 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-green-100 p-3">
            <Icon className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <p className="font-bold text-2xl">{value}</p>
            <p className="text-muted-foreground text-sm">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
