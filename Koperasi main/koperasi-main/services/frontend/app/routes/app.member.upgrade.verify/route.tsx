import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "@remix-run/react";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { useUpgradePlatinum } from "~/services/user/upgrade-platinum";
import { type TVerifyPayment, verifyPaymentSchema } from "~/types/api/verify-payment";
import VerifyDialog from "./components/verify-dialog";

export default function VerifikasiDompetPembayaranPage() {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [nominal] = useState(
    searchParams.get("nominal") ? Number(searchParams.get("nominal")) : 1000000,
  );
  const form = useForm<TVerifyPayment>({
    resolver: zodResolver(verifyPaymentSchema),
    defaultValues: {
      bukti_pembayaran: null,
      no_rekening: "",
      nama_pemilik_rekening: "",
      nama_bank: "",
      nominal: nominal.toString(),
    },
  });

  const { mutateAsync } = useUpgradePlatinum();

  async function onSubmit(data: TVerifyPayment) {
    try {
      await mutateAsync(data);
      setOpen(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <section className="mx-auto my-auto grid w-full max-w-2xl gap-6 overflow-auto rounded-md bg-white p-5 shadow-md">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="~text-base/2xl font-semibold">Konfirmasi Pembayaran</h2>
        </div>
        <Separator />
      </div>
      <Form {...form}>
        <form
          id="verifikasi-pembayaran"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="nama_pemilik_rekening"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nama Pemilik Rekening
                  <RequiredIcon />
                </FormLabel>
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
              <FormItem>
                <FormLabel>
                  No. Rekening
                  <RequiredIcon />
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
                <FormLabel>
                  Nominal
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Input {...field} readOnly value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bukti_pembayaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Upload Bukti Pembayaran
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <DocumentUploader
                    maxFiles={1}
                    id="bukti_pembayaran"
                    files={field.value}
                    setFiles={(files) => field.onChange(files)}
                  />
                </FormControl>
                <FormMessage />
                <ul className="ms-3 list-disc">
                  <li className="text-gray-500 text-xs">
                    Unggah foto bukti pembayaran anda dengan format JPG, PNG, atau JPEG.
                  </li>
                  <li className="text-gray-500 text-xs">Maksimum size file 4 MB.</li>
                </ul>
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full ">
            Kirim
          </Button>
        </form>
      </Form>
      <VerifyDialog open={open} onOpenChange={(open) => setOpen(open)} />
    </section>
  );
}
