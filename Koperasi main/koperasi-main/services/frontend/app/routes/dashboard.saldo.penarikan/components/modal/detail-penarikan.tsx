import { EyeIcon, FileText } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Spinner from "~/components/ui/spinner";
import { useUpdateWithdrawal } from "~/services/top-up/acc-withdraw";
import type { TopUpResponse } from "~/types/api/top-up";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import { formatImagePath } from "~/utils/prefix-file-path";
import toRupiah from "~/utils/to-rupiah";

interface DetailTopUpModalProps {
  data: TopUpResponse;
}

export default function DetailPenarikanModal({ data }: DetailTopUpModalProps) {
  const { mutateAsync } = useUpdateWithdrawal(data.topup.id);

  const handleSubmit = async () => {
    try {
      await mutateAsync({
        id: data.topup.id,
        bukti_pembayaran: Array.from(
          (document.getElementById("bukti") as HTMLInputElement).files || [],
        ),
      });
      toast.success("Status penarikan berhasil diubah");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
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
          <DialogTitle>Verifikasi Pembayaran</DialogTitle>
          <DialogDescription className="sr-only">
            Lihat detail pembayaran top up saldo
          </DialogDescription>
        </DialogHeader>
        <ClientOnly fallback={<Spinner />}>
          {() => (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tanggal" className="text-right">
                  Tanggal Pembayaran
                </Label>
                <Input
                  id="tanggal"
                  value={toLocaleDateTime(data.user.created_at || "")}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">
                  Nama Anggota
                </Label>
                <Input id="nama" value={data.user.nama} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nominal" className="text-right">
                  Nominal Top Up
                </Label>
                <Input
                  id="nominal"
                  value={toRupiah(data.topup.nominal)}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kategori" className="text-right">
                  Kategori
                </Label>
                <Input id="kategori" value="Saldo Dompet" className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metode" className="text-right">
                  Metode Pembayaran
                </Label>
                <Input
                  id="metode"
                  value={`Bank ${data.topup.nama_bank}`}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomor" className="text-right">
                  Nomor Rekening
                </Label>
                <Input id="nomor" value={data.topup.no_rekening} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rekening" className="text-right">
                  Rekening Atas Nama
                </Label>
                <Input
                  id="rekening"
                  value={data.topup.nama_pemilik_rekening}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Bukti Pembayaran</Label>
                {data.topup.bukti_pembayaran && data.topup.status === "SUKSES" ? (
                  <a
                    href={formatImagePath(data.topup.bukti_pembayaran)}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-3 flex items-center gap-2"
                  >
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-500 text-sm">Bukti Pembayaran.jpg</span>
                  </a>
                ) : (
                  <Input
                    accept="image/*"
                    type="file"
                    id="bukti"
                    className="col-span-3 cursor-pointer"
                  />
                )}
              </div>
            </div>
          )}
        </ClientOnly>
        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button variant="destructive">Batal</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Terima</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
