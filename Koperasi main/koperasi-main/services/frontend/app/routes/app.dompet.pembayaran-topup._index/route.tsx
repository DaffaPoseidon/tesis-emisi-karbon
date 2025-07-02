import { Link, useSearchParams } from "@remix-run/react";
import { AlertTriangle, ClipboardCopy } from "lucide-react";
import { useState } from "react";
import BackButton from "~/components/back-button";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import toRupiah from "~/utils/to-rupiah";

export default function RekeningPembayaranTopUpPage() {
  const [searchParams] = useSearchParams();
  const [nominal] = useState(
    searchParams.get("nominal") ? Number(searchParams.get("nominal")) : 120000,
  );

  return (
    <section className="mx-auto my-auto grid w-full max-w-2xl gap-6 overflow-auto px-5">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4">
        <img src="/img/vector/payment.svg" alt="Wallet" className="size-52" />
        <p className="text-center font-semibold text-lg">
          Silahkan transfer ke nomor rekening berikut agar transaksi anda dapat segera kami proses
        </p>
      </div>
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">
            <div className="flex items-center gap-2">
              <BackButton to="/app/dompet" />
              <h2 className="~text-base/2xl font-semibold">Transfer Pembayaran</h2>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="font-bold text-3xl text-blue-700">BRI</div>
            <div>
              <div className="text-gray-500 text-sm">Nomor Rekening</div>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xl">372 178 5022</div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ClipboardCopy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="text-sm">Koperasi Produksi Rejeki Sukses Berkah</div>
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Total Pembayaran</div>
            <div className="font-semibold text-green-500 text-xl">{toRupiah(nominal)}</div>
          </div>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-semibold">Informasi Penting</div>
                  <ul className="list-inside list-disc space-y-1 text-sm">
                    <li>Silakan selesaikan pembayaran di nomer Rekening kami.</li>
                    <li>
                      Mohon transfer <span className="font-semibold">sesuai</span> jumlah pembayaran
                      hingga <span className="font-semibold">3 digit terakhir</span>.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link to={`/app/dompet/pembayaran-topup/verify?nominal=${nominal}`}>
              Konfirmasi Pembayaran
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
