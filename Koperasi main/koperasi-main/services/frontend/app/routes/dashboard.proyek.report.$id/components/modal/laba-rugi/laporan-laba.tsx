import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useStoreReport } from "~/services/project-report/create";
import { type TLaporan, laporanSchema } from "~/types/api/laporan";
import type { Proyek } from "~/types/api/proyek";
import toRupiah from "~/utils/to-rupiah";

interface LaporanLabaModalProps {
  data: Proyek;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LaporanLabaModal({ data, open, onOpenChange }: LaporanLabaModalProps) {
  const form = useForm<TLaporan>({
    resolver: zodResolver(laporanSchema),
    defaultValues: {
      id: data.id ?? "",
      judul: `Laporan Keuntungan ${data.judul ?? ""}`,
      jenis_laporan: "UNTUNG",
      nominal: "0",
      modal: "0",
    },
  });

  const { mutateAsync } = useStoreReport();

  async function onSubmit(payload: TLaporan) {
    try {
      await mutateAsync(payload);
      onOpenChange(false);
      toast.success("Laporan berhasil diunggah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah laporan");
    }
  }

  const nominal = Number(form.getValues("nominal")) - Number(form.getValues("modal"));

  const bagianPemilik = nominal * (Number(data.bagian_pemilik) / 100);
  const bagianPelaksana = nominal * (Number(data.bagian_pelaksana) / 100);
  const bagianKoperasi = nominal * (Number(data.bagian_koperasi) / 100);
  const bagianPendana = nominal * (Number(data.bagian_pendana) / 100);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[36rem] w-96 overflow-auto rounded-md md:max-h-[46rem] md:w-full lg:max-h-full">
        <DialogHeader>
          <DialogTitle>Detail Keuntungan</DialogTitle>
          <DialogDescription className="sr-only">
            Unggah laporan keuntungan proyek
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Laporan</FormLabel>
                  <FormControl>
                    <Input readOnly placeholder="Judul Laporan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Realisasi Modal Kerja</FormLabel>
                  <FormControl>
                    <Input placeholder="Rp 100000" inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal Harga Jual</FormLabel>
                  <FormControl>
                    <Input placeholder="Rp 100000" inputMode="numeric" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2 text-gray-600">
              <p className="font-semibold text-lg">Detail Pelaporan Untung:</p>
              <p>Dengan nominal keuntungan sebesar {toRupiah(nominal)}</p>
              <ul className="ms-6 list-disc">
                <li>
                  Pencipta proyek akan menerima {data.bagian_pemilik ? data.bagian_pemilik : "-"}%
                  yaitu senilai <span className="font-semibold">{toRupiah(bagianPemilik)}</span>
                </li>
                <li>
                  Manajemen akan menerima {data.bagian_pelaksana ? data.bagian_pelaksana : "-"}%
                  yaitu senilai <span className="font-semibold">{toRupiah(bagianPelaksana)}</span>
                </li>
                <li>
                  Koperasi akan menerima {data.bagian_koperasi ? data.bagian_koperasi : "-"}% yaitu
                  senilai <span className="font-semibold">{toRupiah(bagianKoperasi)}</span>
                </li>
                <li>
                  Investor akan menerima {data.bagian_pendana ? data.bagian_pendana : "-"}% yaitu
                  senilai <span className="font-semibold">{toRupiah(bagianPendana)}</span>
                </li>
              </ul>
            </div>
            <Button className="w-full" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
