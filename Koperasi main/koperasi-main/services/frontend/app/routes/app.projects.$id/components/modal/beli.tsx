import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useBuyProject } from "~/services/token/buy-project";
import { type TProyekBeli, proyekBeliSchema } from "~/types/api/proyek-beli";
import KonfirmasiPembelianModal from "./konfirmasi-pembelian";

interface BeliModalProps {
  id: string;
  judul: string;
  totalTokens: number;
  purchasedTokens: number;
}

export default function BeliModal({ id, judul, totalTokens, purchasedTokens }: BeliModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutateAsync } = useBuyProject(id);

  const remainingTokens = totalTokens - purchasedTokens;

  const form = useForm<TProyekBeli>({
    resolver: zodResolver(proyekBeliSchema),
    defaultValues: {
      nominal: 0,
    },
  });

  const handleQuantityChange = (delta: number) => {
    const currentValue = form.getValues("nominal");
    const newValue = Math.max(0, currentValue + delta);
    form.setValue("nominal", newValue, { shouldValidate: true });
  };

  function onSubmit() {
    setIsOpen(false);
    setIsConfirmOpen(true);
  }

  async function handlePembelian() {
    try {
      await mutateAsync(form.getValues());
      toast.success("Pembelian berhasil");
    } catch (error) {
      console.error(error);
      toast.error("Pembelian gagal");
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="!w-full" onClick={() => setIsOpen(true)}>
            Beli
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[36rem] w-96 overflow-auto rounded-md md:max-h-[46rem] md:w-full lg:max-h-full">
          <DialogHeader>
            <DialogTitle>Beli Token</DialogTitle>
            <DialogDescription className="font font-semibold text-green-600">
              Sisa Token Untuk Dibeli : {remainingTokens}{" "}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="nominal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal Token</FormLabel>
                    <div className="flex gap-2">
                      <Button type="button" onClick={() => handleQuantityChange(-1)}>
                        -
                      </Button>
                      <FormControl>
                        <Input className="!text-center" placeholder="0" {...field} />
                      </FormControl>
                      <Button type="button" onClick={() => handleQuantityChange(1)}>
                        +
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? <Spinner /> : "Beli Sekarang"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <KonfirmasiPembelianModal
        judul={judul}
        coin={form.getValues("nominal")}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        handleSubmit={handlePembelian}
      />
    </>
  );
}
