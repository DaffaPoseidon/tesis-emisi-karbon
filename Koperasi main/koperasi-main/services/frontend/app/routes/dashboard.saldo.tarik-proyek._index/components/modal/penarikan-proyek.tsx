import { EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { useShareProfit } from "~/services/projects/share-profit";
import { useGetTotalProfit } from "~/services/projects/total-profit";
import type { Proyek } from "~/types/api/proyek";
import toRupiah from "~/utils/to-rupiah";

interface DetailPenarikanSaldoProyekProps {
  data: Proyek;
}

export default function DetailPenarikanSaldoProyek({ data }: DetailPenarikanSaldoProyekProps) {
  const { mutateAsync } = useShareProfit();
  const { data: profitData } = useGetTotalProfit(data.id ?? "");

  const handleWithdraw = async () => {
    try {
      await mutateAsync(data.id);
      toast.success("Berhasil melakukan penarikan saldo proyek");
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan penarikan saldo proyek");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <EyeIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Verifikasi Withdraw</DialogTitle>
          <DialogDescription className="sr-only">
            Lihat detail pembayaran top up saldo
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pemilik Proyek</Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-gray-500 text-sm">{data.user?.nama}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Kategori</Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-gray-500 text-sm">{data.kategori?.kategori}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pendapatan Proyek</Label>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-gray-500 text-sm">{toRupiah(profitData?.total ?? 0)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="destructive">Batal</Button>
          </DialogClose>
          <Button onClick={handleWithdraw}>Withdraw</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
