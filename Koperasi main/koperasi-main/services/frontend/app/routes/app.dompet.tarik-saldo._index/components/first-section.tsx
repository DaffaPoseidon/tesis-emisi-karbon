import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import RequiredIcon from "~/components/ui/required-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useWithdrawSaldo } from "~/services/top-up/withdraw-saldo";
import { type TVerifyPayment, verifyPaymentSchema } from "~/types/api/verify-payment";

export default function FirstSection() {
  const form = useForm<TVerifyPayment>({
    resolver: zodResolver(verifyPaymentSchema),
    defaultValues: {
      nama_bank: "",
      nama_pemilik_rekening: "",
      no_rekening: "",
      nominal: "",
    },
  });
  const { mutateAsync } = useWithdrawSaldo();

  const handleSubmit = async (data: TVerifyPayment) => {
    try {
      await mutateAsync(data);
      form.reset();
      toast.success("Berhasil melakukan request penarikan saldo");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-9">
        <h3 className="font-semibold text-lg">Tarik Saldo</h3>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col rounded-md bg-white lg:flex-row"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="flex-1 space-y-8">
            <FormField
              control={form.control}
              name="nama_pemilik_rekening"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nama Pemilik Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama Pemilik Rekening" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="no_rekening"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    No. Rekening <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="No. Rekening" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama_bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pilih Bank
                    <RequiredIcon />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Bank" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Penarikan</FormLabel>
                  <FormControl>
                    <Input placeholder="200000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="ms-auto flex max-w-md">
              <Button type="submit" className="w-full">
                Ajukan Penarikan
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
