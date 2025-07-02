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
import { useReviseProject } from "~/services/projects/revise";
import { type Revisi, revisiSchema } from "~/types/api/proyek";

interface RevisiModalProps {
  id: string;
  disable?: boolean;
}

export default function RevisiModal({ id, disable }: RevisiModalProps) {
  const { mutateAsync: reviseProject } = useReviseProject(id || "");

  const form = useForm<Revisi>({
    resolver: zodResolver(revisiSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(data: Revisi) {
    try {
      await reviseProject(data.description);
      toast.success("Revisi proyek berhasil dikirim");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengirim revisi proyek");
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={disable}
          className="w-full border-orange-300 bg-orange-500 hover:bg-orange-400"
        >
          Revisi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[36rem] w-96 overflow-auto rounded-md md:max-h-[46rem] md:w-full lg:max-h-full">
        <DialogHeader>
          <DialogTitle>Revisi Proyek</DialogTitle>
          <DialogDescription className="sr-only">Unggah laporan revisi proyek</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Input Revisi
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
              <Button disabled={form.formState.isSubmitting} className="w-full" type="submit">
                Kirim
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
