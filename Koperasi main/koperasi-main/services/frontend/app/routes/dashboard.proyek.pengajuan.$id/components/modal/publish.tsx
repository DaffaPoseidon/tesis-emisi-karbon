import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import RequiredIcon from "~/components/ui/required-icon";
import { usePublishProject } from "~/services/projects/publish";
import { type Proyek, type Publish, publishSchema } from "~/types/api/proyek";
import toRupiah from "~/utils/to-rupiah";

interface PublishModalProps {
  id: string;
  data: Proyek;
  disable?: boolean;
}

export default function PublishModal({ id, disable, data }: PublishModalProps) {
  const { mutateAsync } = usePublishProject(id || "");
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<Publish>({
    resolver: zodResolver(publishSchema),
    defaultValues: {
      id_proyek: id,
      mulai_penggalangan_dana: "",
      selesai_penggalangan_dana: "",
      dokumen_prospektus: undefined,
    },
  });

  async function onSubmit(data: Publish) {
    console.log(data);
    try {
      await mutateAsync(data);
      toast.success("Revisi proyek berhasil dikirim");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengirim revisi proyek");
    }
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disable} className="col-span-2 w-full bg-blue-700 hover:bg-blue-600">
          Publish Projek
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95dvh] w-96 overflow-auto rounded-md md:w-full">
        <DialogHeader>
          <DialogTitle>Publish Proyek</DialogTitle>
          <DialogDescription className="sr-only">
            Unggah dokumen prospektus proyek yang akan dipublikasikan.
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
              Nominal Disetujui
            </Label>
            <Input
              id="dana"
              value={toRupiah(data.nominal_disetujui ?? 0)}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dana" className="text-left leading-relaxed">
              Jumlah Token Ditawarkan
            </Label>
            <Input
              id="dana"
              value={data.jumlah_koin ?? 0}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dana" className="text-left leading-relaxed">
              Harga per Koin
            </Label>
            <Input
              id="dana"
              value={data.harga_per_unit ?? 0}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dana" className="text-left leading-relaxed">
              Min Beli
            </Label>
            <Input
              id="dana"
              value={data.minimal_pembelian ?? 0}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dana" className="text-left leading-relaxed">
              Maks Beli
            </Label>
            <Input
              id="dana"
              value={data.maksimal_pembelian ?? 0}
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-left leading-relaxed">
              Status Proyek
            </Label>
            <Input
              id="status"
              value="Proses Penggalangan Modal"
              className="col-span-3 uppercase"
              readOnly
            />
          </div>
        </div>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="mulai_penggalangan_dana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mulai Penggalangan Dana
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="!block" type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="selesai_penggalangan_dana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Selesai Penggalangan Dana
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="!block" type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dokumen_prospektus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dokumen Prospektus
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-4">
              <DialogClose asChild>
                <Button className="w-full" variant="destructive">
                  Batal
                </Button>
              </DialogClose>
              <Button disabled={form.formState.isSubmitting} className="w-full" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
