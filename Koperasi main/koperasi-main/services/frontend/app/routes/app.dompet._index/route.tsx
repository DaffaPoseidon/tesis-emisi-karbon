import { Link } from "@remix-run/react";
import { Coins } from "lucide-react";
import { useMemo, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { Icons } from "~/components/icons";
import PageContainer from "~/components/page-container";
import { DataTable } from "~/components/table/data-table";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import Spinner from "~/components/ui/spinner";
import { useJWTPayload } from "~/hooks/use-jwt-payload";
import { useGetAllTopUpByUser } from "~/services/top-up/get-by-user";
import { useGetSaldoUser } from "~/services/top-up/get-saldo-user";
import { useGetSumSimpananPokok } from "~/services/top-up/get-sum-simpanan-pokok";
import { useGetSumSimpananWajib } from "~/services/top-up/get-sum-simpanan-wajib";
import toRupiah from "~/utils/to-rupiah";
import TopUpModal from "./components/modal/top-up/topup";
import { columns } from "./components/table/columns";

export default function DompetRegulerPage() {
  const [simpananData, setSimpananData] = useState({
    simpananPokok: 0,
    simpananWajib: 0,
    saldoSukarela: 0,
  });
  const { jwtPayload } = useJWTPayload();
  const { data: topUpData } = useGetAllTopUpByUser({});
  const { data: simpananPokok } = useGetSumSimpananPokok();
  const { data: simpananWajib } = useGetSumSimpananWajib();
  const { data: saldoSukarela } = useGetSaldoUser();

  useMemo(() => {
    if (simpananPokok) {
      setSimpananData((prev) => ({ ...prev, simpananPokok: Number(simpananPokok.total) }));
    }
    if (simpananWajib) {
      setSimpananData((prev) => ({ ...prev, simpananWajib: Number(simpananWajib.total) }));
    }
    if (saldoSukarela) {
      setSimpananData((prev) => ({ ...prev, saldoSukarela: Number(saldoSukarela.total) }));
    }
  }, [simpananPokok, simpananWajib, saldoSukarela]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="font-bold text-2xl tracking-tight">Dompet</h2>
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="h-fit">
            <section className="order-1 max-w-72 space-y-3 xl:order-2">
              <div className="space-y-2 rounded-md bg-white p-6">
                <h4 className="font-semibold text-lg">Saldo Top Up</h4>
                <div className="flex items-center space-x-4">
                  <Icons.moon className="h-6 w-6 text-green-700" />
                  <h2 className="font-bold text-2xl text-green-700">
                    {toRupiah(simpananData.saldoSukarela)}
                  </h2>
                </div>
                {jwtPayload.role === "PLATINUM" && <TopUpModal />}
                {jwtPayload.role === "PLATINUM" && (
                  <Button className="w-full">
                    <Link to="/app/dompet/tarik-saldo/">Tarik Saldo</Link>
                  </Button>
                )}
              </div>
              <div className="space-y-4 rounded-md bg-white p-6">
                <h4 className="font-semibold text-lg">Simpanan Wajib</h4>
                <div className="flex items-center space-x-4">
                  <Coins className="h-6 w-6 text-green-700" />
                  <h2 className="font-bold text-2xl text-green-700">
                    {toRupiah(simpananData.simpananWajib)}
                  </h2>
                </div>
                <Separator />
                <Button className="w-full" asChild>
                  <Link to="/app/dompet/pembayaran-wajib">Bayar</Link>
                </Button>
              </div>
              <div className="space-y-2 rounded-md bg-white p-6">
                <h4 className="font-semibold text-lg">Simpanan Pokok</h4>
                <div className="flex items-center space-x-4">
                  <Icons.moon className="h-6 w-6 text-green-700" />
                  <h2 className="font-bold text-2xl text-green-700">
                    {toRupiah(simpananData.simpananPokok)}{" "}
                  </h2>
                </div>
              </div>
            </section>
          </div>
          <div className="flex-1 space-y-3 overflow-hidden rounded-md bg-white p-5 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl">Riwayat Transaksi</h3>
            </div>
            <ClientOnly fallback={<Spinner />}>
              {() => (
                <DataTable
                  columns={columns}
                  data={topUpData || []}
                  searchKey="topup_created_at"
                  searchLabel="Tanggal"
                />
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
