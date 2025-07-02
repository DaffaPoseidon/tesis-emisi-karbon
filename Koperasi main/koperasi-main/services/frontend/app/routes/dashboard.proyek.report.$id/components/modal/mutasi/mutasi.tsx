import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DocumentUploader from "~/components/document-uploader";
import { Button } from "~/components/ui/button";
import {
  Dialog,
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
import Spinner from "~/components/ui/spinner";
import { useStoreMutation } from "~/services/mutation/create";
import { type TLaporanMutasi, laporanMutasiSchema } from "~/types/api/laporan";

interface MutasiModalProps {
  id: string | number;
}

export default function MutasiModal({ id }: MutasiModalProps) {
  const form = useForm<TLaporanMutasi>({
    resolver: zodResolver(laporanMutasiSchema),
    defaultValues: {
      title: "",
      amount_profit: "0",
      amount_loss: "0",
      document: undefined,
    },
  });

  const { mutateAsync } = useStoreMutation(id);

  async function onSubmit(data: TLaporanMutasi) {
    try {
      await mutateAsync(data);
      toast.success("Laporan berhasil diunggah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunggah laporan");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Unggah Laporan</Button>
      </DialogTrigger>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Laporan</FormLabel>
                  <FormControl>
                    <Input placeholder="Judul Laporan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <FormField
                control={form.control}
                name="amount_profit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal Keuntungan</FormLabel>
                    <FormControl>
                      <Input placeholder="Rp 100000" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount_loss"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal Kerugian</FormLabel>
                    <FormControl>
                      <Input placeholder="Rp 100000" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dokumen Laporan Keuangan</FormLabel>
                  <FormControl>
                    <DocumentUploader
                      maxFiles={2}
                      id="document"
                      files={field.value}
                      setFiles={(files) => field.onChange(files)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Spinner /> : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
