import { Link } from "@remix-run/react";
import { PackageOpen, User2 } from "lucide-react";
import { useMemo, useState } from "react";
import BorderedCard from "~/components/cards/bordered-card";
import { DataTable } from "~/components/table/data-table";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { useGetAllTopUpByUser } from "~/services/top-up/get-by-user";
import { useGetSumSimpananPokok } from "~/services/top-up/get-sum-simpanan-pokok";
import { useGetSumSimpananWajib } from "~/services/top-up/get-sum-simpanan-wajib";
import type { Anggota } from "~/types/api/anggota";
import toRupiah from "~/utils/to-rupiah";
import { columns } from "../table/columns";
import UpgradeDialog from "../upgrade-dialog";

interface BasicDashboardProps {
  data: Anggota;
}

export default function BasicDashboard({ data }: BasicDashboardProps) {
  const [simpananData, setSimpananData] = useState({
    simpananPokok: 0,
    simpananWajib: 0,
  });
  const { data: topUpData } = useGetAllTopUpByUser({ isDashboard: true });
  const { data: simpananPokok } = useGetSumSimpananPokok();
  const { data: simpananWajib } = useGetSumSimpananWajib();

  useMemo(() => {
    if (simpananPokok) {
      setSimpananData((prev) => ({ ...prev, simpananPokok: Number(simpananPokok.total) }));
    }
    if (simpananWajib) {
      setSimpananData((prev) => ({ ...prev, simpananWajib: Number(simpananWajib.total) }));
    }
  }, [simpananPokok, simpananWajib]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-2xl tracking-tight">Dashboard</h2>
      </div>
      <section className="flex flex-col gap-6 xl:flex-row">
        <div className="flex h-fit min-w-64 flex-col gap-6 rounded-md bg-white p-8 shadow-md">
          <div className="mx-auto flex flex-col items-center gap-3">
            <div className="w-fit rounded-full bg-primary px-4 py-4">
              <User2 className="mx-auto size-16 text-center text-white" />
            </div>
            <h3 className="font-bold text-lg uppercase">{data?.nama}</h3>
            <span className="min-w-fit rounded-md bg-orange-100 p-2 text-center font-semibold text-orange-600 text-xs">
              Member {data?.role}
            </span>
          </div>
          <Separator className="w-full" />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Detail Profil</h3>
            <div>
              <span className="font-medium">NIK</span>
              <h4>{data?.nik}</h4>
            </div>
            <div>
              <span className="font-medium">No. Whatsapp</span>
              <h4>{data?.no_hp}</h4>
            </div>
            <div>
              <span className="font-medium">Tempat Lahir</span>
              <h4>{data?.tempat_lahir}</h4>
            </div>
            <div>
              <span className="font-medium">Tanggal Lahir</span>
              <h4>{data?.tanggal_lahir}</h4>
            </div>
            <div>
              <span className="font-medium">Alamat</span>
              <h4>{data?.alamat}</h4>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center gap-6 rounded-md bg-white p-8 shadow-md">
            <span className="rounded-md bg-orange-100 p-4 text-orange-600">
              <PackageOpen size={24} />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-medium">Menjadi Member Platinum</p>
              <p className="font-medium">Nikmati Keistimewaan Hanya dengan Rp 1.000.000</p>
            </div>
            {data?.role !== "Platinum" && <UpgradeDialog />}
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-md bg-white p-8 shadow-md">
            <BorderedCard title="Simpanan Pokok" value={toRupiah(simpananData.simpananPokok)} />
            <BorderedCard title="Simpanan Wajib" value={toRupiah(simpananData.simpananWajib)} />
            <BorderedCard title="Sisa Hasil Usaha" value="Rp 0" />
          </div>
          <div className="space-y-4 rounded-md bg-white p-8 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Riwayat Transaksi</h3>
              <Button>
                <Link to="/app/dompet">Bayar Simpanan Wajib</Link>
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={topUpData || []}
              searchKey="topup_nama"
              searchLabel="Nama User"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
