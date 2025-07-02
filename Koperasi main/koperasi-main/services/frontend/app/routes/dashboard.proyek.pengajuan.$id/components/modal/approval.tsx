import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import RequiredIcon from "~/components/ui/required-icon";
import { useApproveProject } from "~/services/projects/approve";
import { type Approve, type Proyek, approveSchema } from "~/types/api/proyek";

interface ApproveModalProps {
  data: Proyek;
}

export default function ApproveModal({ data }: ApproveModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutateAsync: approveProject } = useApproveProject(data.id || "");
  const form = useForm<Approve>({
    resolver: zodResolver(approveSchema),
    defaultValues: {
      harga_per_unit: "0",
      jumlah_koin: "0",
      minimal_pembelian: "0",
      maksimal_pembelian: "0",
      nominal_disetujui: "0",
      report_progress: "1",
    },
  });

  const watchNominalDisetujui = form.watch("nominal_disetujui");
  const watchHargaPerUnit = form.watch("harga_per_unit");

  useEffect(() => {
    const nominalDisetujui = Number.parseFloat(watchNominalDisetujui);
    const hargaPerUnit = Number.parseFloat(watchHargaPerUnit);

    if (nominalDisetujui && hargaPerUnit && hargaPerUnit > 0) {
      const jumlahKoin = Math.floor(nominalDisetujui / hargaPerUnit);
      form.setValue("jumlah_koin", jumlahKoin.toString());
    } else {
      form.setValue("jumlah_koin", "0");
    }
  }, [watchNominalDisetujui, watchHargaPerUnit, form]);

  async function onSubmit(values: Approve) {
    try {
      setLoading(true);
      await approveProject(values);
      toast.success("Proyek berhasil disetujui");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="col-span-2 w-full">Approval</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] overflow-auto sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Approval Komite</DialogTitle>
          <DialogDescription className="sr-only">
            Enter the project details for committee approval.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-left leading-relaxed">
              Nama Proyek
            </Label>
            <Input id="nama" value={data.judul} className="col-span-3 uppercase" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pemilik" className="text-left leading-relaxed">
              Pemilik Proyek
            </Label>
            <Input id="pemilik" value={data.user?.nama} className="col-span-3 uppercase" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kategori" className="text-left leading-relaxed">
              Kategori
            </Label>
            <Input
              id="kategori"
              value={data.kategori?.kategori}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dana" className="text-left leading-relaxed">
              Dana yang dibutuhkan
            </Label>
            <Input id="dana" value={data.nominal} className="col-span-3 uppercase" readOnly />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-left leading-relaxed">
              Status Proyek
            </Label>
            <Input id="status" value="Disetujui Komite" className="col-span-3 uppercase" readOnly />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="report_progress"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>
                    Upload Laporan Laba Rugi (Setiap)
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal">1 Bulan</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="font-normal">3 Bulan</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="6" />
                        </FormControl>
                        <FormLabel className="font-normal">6 Bulan</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="12" />
                        </FormControl>
                        <FormLabel className="font-normal">1 Tahun</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nominal_disetujui"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nominal Disetujui
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="250000000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="harga_per_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Harga Per Token
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlah_koin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Token Ditawarkan</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2500" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimal_pembelian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Minimal Pembelian Token
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maksimal_pembelian"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Maximal Pembelian Token
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="800"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" disabled={loading} variant="destructive">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
