import { Link } from "@remix-run/react";
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
import toRupiah from "~/utils/to-rupiah";

export default function TopUpModal() {
  const [nominal, setNominal] = useState(0);

  const handleSetoran = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const nominal = value === "" ? 0 : Number(value);
    setNominal(nominal);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Top Up</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[36rem] w-96 overflow-auto rounded-md md:max-h-[46rem] md:w-full lg:max-h-full">
        <DialogHeader>
          <DialogTitle>Top Up Saldo Simpanan Sukarela</DialogTitle>
          <DialogDescription className="sr-only">
            Top up saldo simpanan sukarela dengan nominal yang diinginkan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col justify-between gap-2">
          <div className="flex w-full flex-col gap-1">
            <Input
              id="setoran"
              className="w-full"
              type="number"
              placeholder="Rp 200.000"
              step="200000"
              min="0"
              onChange={handleSetoran}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex-1 font-medium text-gray-900">Total Pembayaran</span>
          <span className="w-fit font-semibold">{toRupiah(nominal)}</span>
        </div>
        <Button className="w-full" asChild>
          <Link to={`/app/dompet/pembayaran-topup?nominal=${nominal}`}>Lanjutkan Pembayaran</Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
