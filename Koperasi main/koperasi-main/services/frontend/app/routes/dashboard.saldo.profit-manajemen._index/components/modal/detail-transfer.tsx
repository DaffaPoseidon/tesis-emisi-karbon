import { EyeIcon, FileText } from "lucide-react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Spinner from "~/components/ui/spinner";
import { usePayBagianPemilikPelaksana } from "~/services/top-up/pay-bagian-pemilik-pelaksana";
import type { PemilikPelaksanaResponse } from "~/types/api/pemilik-pelaksana";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import { formatImagePath } from "~/utils/prefix-file-path";
import toRupiah from "~/utils/to-rupiah";

interface DetailTransferManajamenPemilikProps {
  data: PemilikPelaksanaResponse;
}

export default function DetailTransferManajamenPemilik({
  data,
}: DetailTransferManajamenPemilikProps) {
  const { mutateAsync } = usePayBagianPemilikPelaksana(data.id);
  const [selectedBank, setSelectedBank] = useState(data.nama_bank);
  const [nomorRekening, setNomorRekening] = useState(data.no_rekening);
  const [namaPemilikRekening, setNamaPemilikRekening] = useState(data.nama_pemilik_rekening);
  const handleSubmit = async () => {
    try {
      await mutateAsync({
        id: data.id,
        no_rekening: nomorRekening, // Use state value
        nama_pemilik_rekening: namaPemilikRekening,
        nama_bank: selectedBank,
        bukti_pembayaran: Array.from(
          (document.getElementById("bukti") as HTMLInputElement).files || [],
        ),
      });
      toast.success("Status Transfer berhasil diubah");
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
                  value={toLocaleDateTime(data.created_at || "")}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">
                  Nama Anggota
                </Label>
                <Input id="nama" value={data.nama} className="col-span-3" readOnly />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nominal" className="text-right">
                  Nominal Top Up
                </Label>
                <Input
                  id="nominal"
                  value={toRupiah(data.nominal)}
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
                <div className="col-span-3">
                  <Select value={selectedBank} onValueChange={(value) => setSelectedBank(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BCA">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/bca.svg" alt="bca" className="h-6 w-6" />
                          <span>BANK BCA</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="MANDIRI">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/mandiri.svg" alt="mandiri" className="h-6 w-6" />
                          <span>BANK MANDIRI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BNI">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/bni.svg" alt="bni" className="h-6 w-6" />
                          <span>BANK BNI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BRI">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/bri.svg" alt="BRI" className="h-6 w-6" />
                          <span>BANK BRI</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BSI">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/bsi.svg" alt="bsi" className="h-6 w-6" />
                          <span>BANK SYARIAH INDONESIA (BSI)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="BTN">
                        <div className="flex flex-row items-center gap-2">
                          <img src="/img/bank/btn.svg" alt="btn" className="h-6 w-6" />
                          <span>BANK BTN</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomor" className="text-right">
                  Nomor Rekening
                </Label>
                <Input
                  id="nomor"
                  value={nomorRekening}
                  onChange={(e) => setNomorRekening(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rekening" className="text-right">
                  Rekening Atas Nama
                </Label>
                <Input
                  id="rekening"
                  value={namaPemilikRekening}
                  onChange={(e) => setNamaPemilikRekening(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Bukti Pembayaran</Label>
                {data.bukti_pembayaran && data.status === "SUKSES" ? (
                  <a
                    href={formatImagePath(data.bukti_pembayaran)}
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
          <Button onClick={handleSubmit}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
