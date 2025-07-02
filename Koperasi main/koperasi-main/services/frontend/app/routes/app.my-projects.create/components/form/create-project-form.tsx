import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import DocumentUploader from "~/components/document-uploader";
import { Button } from "~/components/ui/button";
import { Combobox } from "~/components/ui/combobox";
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
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useGetAllCategory } from "~/services/category/get-all";
import { useStoreProject } from "~/services/projects/create";
import { type Proyek, proyekSchema } from "~/types/api/proyek";

export default function CreateProjectForm() {
  const navigate = useNavigate();
  const { data: categories } = useGetAllCategory();
  const { mutateAsync } = useStoreProject();
  const form = useForm<Proyek>({
    resolver: zodResolver(proyekSchema),
    defaultValues: {
      kategori: {
        id: "",
      },
      judul: "",
      deskripsi: "",
      nominal: "",
      asset_jaminan: "",
      nilai_jaminan: "",
      lokasi_usaha: "",
      detail_lokasi: "",
      pendapatan_perbulan: "",
      pengeluaran_perbulan: "",
      limit_siklus: "",
      bagian_pelaksana: "",
      bagian_koperasi: "",
      bagian_pemilik: "",
      bagian_pendana: "",
    },
  });

  const categoriesItems = (categories ?? []).map((category) => ({
    value: category.id ?? "",
    label: category.kategori ?? "",
  }));

  async function onSubmit(data: Proyek) {
    try {
      await mutateAsync(data);
      navigate("/app/my-projects");
      toast.success("Proyek berhasil dibuat.");
    } catch (error) {
      console.log(error);
      toast.error("Gagal membuat pengajuan proyek.");
    }
  }

  function onError(errors: unknown) {
    console.log(errors);
    if (errors instanceof Error) {
      toast.error(errors.message);
    } else {
      toast.error("An unknown error occurred.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col gap-6 rounded-lg bg-white p-5"
      >
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h2 className="mb-2 font-bold text-2xl">Pengajuan Proyek</h2>
            <p className="text-muted-foreground text-sm">Berisi informasi proyek anda.</p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <FormField
              control={form.control}
              name="judul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Judul Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. Ayam Goreng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kategori.id"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>
                    Kategori Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      buttonClassName="!w-full"
                      items={categoriesItems || []}
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deskripsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Deskripsi Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cth. Proyek ayam goreng ini bertujuan untuk ..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dokumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dokumen Pendukung (Foto Toko, NPWP, dsb)
                    <RequiredIcon />
                  </FormLabel>
                  <DocumentUploader
                    maxFiles={4}
                    id="dokumen"
                    files={field.value}
                    setFiles={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <Separator />
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h2 className="mb-2 font-bold text-2xl">Pendanaan</h2>
            <p className="text-muted-foreground text-sm">
              Berisi informasi pengajuan pendanaan anda.
            </p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <FormField
              control={form.control}
              name="nominal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nominal yang dibutuhkan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cth. 1000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="asset_jaminan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Asset Jaminan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. BPKB Motor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nilai_jaminan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nilai Asset Jaminan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cth. 1000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <Separator />
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h2 className="mb-2 font-bold text-2xl">Model dan Rencana Bisnis</h2>
            <p className="text-muted-foreground text-sm">Berisi model dan rencana bisnis anda.</p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <FormField
              control={form.control}
              name="lokasi_usaha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Lokasi Usaha
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detail_lokasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Detail Lokasi
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cth. Jalan Raya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brosur_produk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="brosur_produk">Brosur Produk (opsional)</FormLabel>
                  <DocumentUploader
                    id="brosur_produk"
                    files={field.value}
                    setFiles={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pendapatan_perbulan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pendapatan Perbulan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cth. 1000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pengeluaran_perbulan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pengeluaran Perbulan
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Cth. 1000000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dokumen_proyeksi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dokumen Proyeksi Keuangan Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <DocumentUploader
                    id="dokumen_proyeksi"
                    files={field.value}
                    setFiles={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit_siklus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Siklus (x siklus)
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <Separator />
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <h2 className="mb-2 font-bold text-2xl">Pembagian Hasil</h2>
            <p className="text-muted-foreground text-sm">
              Berisi informasi pembagian hasil antara pengelola dan investor.
            </p>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <span className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Pembagian Hasil (sudah dalam %)
            </span>
            <FormField
              control={form.control}
              name="bagian_pelaksana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pelaksana Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. 20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bagian_koperasi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Koperasi
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bagian_pemilik"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pemilik Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bagian_pendana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Pemodal Proyek
                    <RequiredIcon />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Cth. 40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <Button className="ms-auto w-fit" disabled={form.formState.isSubmitting} type="submit">
          Buat Pengajuan Proyek
        </Button>
      </form>
    </Form>
  );
}
