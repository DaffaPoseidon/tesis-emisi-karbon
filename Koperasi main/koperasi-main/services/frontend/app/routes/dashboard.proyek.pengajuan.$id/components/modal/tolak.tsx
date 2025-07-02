import { zodResolver } from "@hookform/resolvers/zod";
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
import RequiredIcon from "~/components/ui/required-icon";
import { Textarea } from "~/components/ui/textarea";
import { useRejectProject } from "~/services/projects/reject";
import { type Tolak, tolakSchema } from "~/types/api/proyek";

interface TolakModalProps {
  id: string;
  disable?: boolean;
}

export default function TolakModal({ id, disable }: TolakModalProps) {
  const { mutateAsync: rejectProject } = useRejectProject(id || "");

  const form = useForm<Tolak>({
    resolver: zodResolver(tolakSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: Tolak) {
    try {
      await rejectProject(data.description);
      toast.success("Penolakan proyek berhasil dikirim");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengirim penolakan proyek");
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disable} variant="destructive">
          Tolak
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[36rem] w-96 overflow-auto rounded-md md:max-h-[46rem] md:w-full lg:max-h-full">
        <DialogHeader>
          <DialogTitle>Penolakan Proyek</DialogTitle>
          <DialogDescription className="sr-only">Unggah laporan penolakan proyek</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Input Alasan Penolakan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={12} {...field} />
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
              <Button className="w-full" type="submit">
                Kirim
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
