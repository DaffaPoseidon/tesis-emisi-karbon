import { Link } from "@remix-run/react";
import { TriangleAlert } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function BayarMemberPage() {
  return (
    <section className="mx-auto my-auto grid w-full max-w-2xl gap-6 px-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="~text-base/2xl font-semibold">Detail Pembayaran Setoran Awal</h2>
        </div>
        <Separator />
      </div>
      <div className="flex items-center gap-4 rounded-md bg-orange-100 px-6 py-2">
        <div className="flex items-center justify-center gap-2 rounded-full border-4 border-white bg-[#fcecbb] p-2 text-[#DC6803]">
          <TriangleAlert />
        </div>
        <p className="font-medium text-black">
          Lakukan pembayaran untuk menyelesaikan pendaftaran Anda sebagai anggota koperasi.
        </p>
      </div>
      <div className="space-y-4">
        <span className="font-medium">Informasi Pembayaran</span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="w-3/4 text-gray-500">Simpanan Pokok</span>
            <span className="w-24 font-semibold">Rp 50.000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="w-3/4 text-gray-500">Simpanan Wajib 1 Tahun Member UMKM</span>
            <span className="w-24 font-semibold">Rp 120.000</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="w-3/4 font-medium text-gray-900">Total Pembayaran</span>
            <span className="w-24 font-semibold">Rp 170.000</span>
          </div>
        </div>
      </div>
      <Button className="w-full" asChild>
        <Link to="/member/pembayaran">Bayar Sekarang</Link>
      </Button>
    </section>
  );
}
