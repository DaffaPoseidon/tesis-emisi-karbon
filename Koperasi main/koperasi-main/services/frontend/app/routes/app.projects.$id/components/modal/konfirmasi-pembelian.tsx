import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Spinner from "~/components/ui/spinner";
import { useGetSaldoUser } from "~/services/top-up/get-saldo-user";
import toRupiah from "~/utils/to-rupiah";

interface KonfirmasiPembelianModalProps {
  judul: string;
  coin: number;
  isOpen: boolean;
  onClose: () => void;
  handleSubmit: () => void;
}

export default function KonfirmasiPembelianModal({
  judul,
  coin,
  isOpen,
  onClose,
  handleSubmit,
}: KonfirmasiPembelianModalProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: saldoData } = useGetSaldoUser();

  const onSubmitHandler = async () => {
    setIsLoading(true);
    try {
      await handleSubmit();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-semibold text-xl">Konfirmasi Pembelian</DialogTitle>
          <DialogDescription className="text-gray-500 text-sm">
            Pastikan data pembelian Anda sudah benar sebelum melanjutkan transaksi.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-5">
                <AlertTriangle className="size-16 text-orange-500" />
                <p className="font-medium text-sm">
                  Mohon cek kembali data Anda. Pastikan semua data sudah benar sebelum melanjutkan
                  transaksi.
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Proyek</span>
              <span className="font-medium">{judul}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Jumlah Token Dibeli</span>
              <span className="font-medium">{coin} Token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Metode Pembayaran</span>
              <span className="font-medium">Saldo Dompet</span>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="mb-2 font-semibold text-lg">Metode Pembayaran</h3>
            <div className="flex items-center justify-between rounded-lg border border-green-500 p-4">
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Saldo Dompet</p>
                  <p className="text-gray-500 text-sm">Verifikasi Otomatis</p>
                </div>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                Saldo: {toRupiah(saldoData?.total ?? "0")}
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-start">
            <Checkbox
              id="terms"
              checked={isAgreed}
              onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="terms" className="ml-2 text-gray-700 text-sm">
              Saya menyetujui pembelian token di proyek ini dan telah membaca dan menyetujui isi
              prospektus serta memahami risiko atas keputusan investasi yang saya buat.
            </label>
          </div>
          <Button
            className="mt-6 w-full"
            disabled={!isAgreed || isLoading}
            onClick={onSubmitHandler}
          >
            {isLoading ? <Spinner /> : "Bayar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
