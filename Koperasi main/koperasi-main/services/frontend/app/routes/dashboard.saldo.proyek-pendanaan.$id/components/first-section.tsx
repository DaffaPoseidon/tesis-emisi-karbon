import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DocumentUploader from "~/components/document-uploader";
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
import { Textarea } from "~/components/ui/textarea";
import { useGetProjectWalletByWalletId } from "~/services/project-wallet/get-by-wallet-id";
import { useTransferSaldo } from "~/services/project-wallet/transfer-saldo";
import { type TVerifyPayment, verifyPaymentSchema } from "~/types/api/verify-payment";

interface FirstSectionProps {
  id: string;
}

export default function FirstSection({ id }: FirstSectionProps) {
  const { data } = useGetProjectWalletByWalletId(id);
  const { mutateAsync } = useTransferSaldo();
  const form = useForm<
    Pick<TVerifyPayment, "id_proyek" | "deskripsi" | "nominal" | "bukti_transfer">
  >({
    resolver: zodResolver(
      verifyPaymentSchema.pick({
        id_proyek: true,
        deskripsi: true,
        nominal: true,
        bukti_transfer: true,
      }),
    ),
    defaultValues: {
      id_proyek: id || "",
      deskripsi: "",
      nominal: "",
      bukti_transfer: null,
    },
  });

  const onSubmit = async () => {
    try {
      await mutateAsync({
        id_proyek: form.getValues("id_proyek"),
        deskripsi: form.getValues("deskripsi"),
        nominal: form.getValues("nominal"),
        bukti_transfer: form.getValues("bukti_transfer"),
      });
      toast.success("Berhasil mengirimkan bukti transfer");
    } catch (error) {
      toast.error("Gagal mengirimkan bukti transfer");
      console.log(error);
    }
  };

  const onError = (error: unknown) => {
    toast.error("Gagal mengirimkan bukti transfer");
    console.log(error);
  };

  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-9">
        <h3 className="font-semibold text-lg">Upload Bukti Transfer</h3>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col rounded-md bg-white lg:flex-row"
          onSubmit={form.handleSubmit(onSubmit, onError)}
        >
          <div className="flex-1 space-y-8">
            <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nominal Dana Transfer</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan Nominal Dana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>
                    Deskripsi Penggunaan Dana <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan Deskripsi penggunaan Dana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bukti_transfer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Upload Bukti Transfer
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <DocumentUploader
                      maxFiles={1}
                      id="bukti_Transfer"
                      files={field.value}
                      setFiles={(files) => field.onChange(files)}
                    />
                  </FormControl>
                  <FormMessage />
                  <ul className="ms-3 list-disc">
                    <li className="text-gray-500 text-xs">Upload Bukti Pembayaran.</li>
                    <li className="text-gray-500 text-xs">Maksimum size file 4 MB.</li>
                  </ul>
                </FormItem>
              )}
            />
            <div className="ms-auto flex max-w-md">
              <Button type="submit" className="w-full">
                Simpan
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}
