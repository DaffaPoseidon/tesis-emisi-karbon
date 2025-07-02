import { Link } from "@remix-run/react";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import toRupiah from "~/utils/to-rupiah";

export default function UpgradeDialog() {
  const [nominal, setNominal] = useState(1000000);

  const handleSetoran = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (value % 500000 === 0) {
      setNominal(value + 1000000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 text-white hover:bg-orange-500">Upgrade Sekarang</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl space-y-3">
        <DialogHeader className="space-y-3">
          <DialogTitle>Detail Pembayaran Member Platinum</DialogTitle>
          <Separator className="w-full" />
          <DialogDescription className="sr-only">
            Detail pembayaran untuk member platinum.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 rounded-md bg-orange-100 px-6 py-2">
          <div className="flex items-center justify-center gap-2 rounded-full border-4 border-white bg-[#fcecbb] p-2 text-[#DC6803]">
            <TriangleAlert />
          </div>
          <p className="">
            Anda terdaftar sebagai Member Reguler. Cukup lakukan Top Up tanpa perlu membayar
            simpanan pokok dan wajib.
          </p>
        </div>
        <div className="space-y-4">
          <span className="font-medium">Informasi Pembayaran Wajib</span>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="flex-1 text-gray-500">Top Up</span>
              <span className="w-fit font-semibold">Rp 1.000.000</span>
            </div>
            <div className="flex flex-col justify-between gap-2">
              <Label htmlFor="setoran" className="flex-1 font-medium text-base">
                Tambahan Setoran (Opsional)
              </Label>
              <div className="flex w-full flex-col gap-1">
                <Input
                  id="setoran"
                  className="w-full"
                  type="number"
                  placeholder="Rp 500.000"
                  step="500000"
                  min="0"
                  onChange={handleSetoran}
                />

                <span className="text-gray-500 text-sm">
                  *Tambahan setoran harus dalam kelipatan Rp 500.000
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex-1 font-medium text-gray-900">Total Pembayaran</span>
              <span className="w-fit font-semibold">{toRupiah(nominal)}</span>
            </div>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link to={`/app/member/upgrade?nominal=${nominal}`}>Lanjutkan Pembayaran</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
