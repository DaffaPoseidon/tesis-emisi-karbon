import { zodResolver } from "@hookform/resolvers/zod";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { jwtDecode } from "jwt-decode";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ClientOnly } from "remix-utils/client-only";
import { toast } from "sonner";
import DocumentUploader from "~/components/document-uploader";
import PageContainer from "~/components/page-container";
import { Button } from "~/components/ui/button";
import { Combobox, type ComboboxItem } from "~/components/ui/combobox";
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
import Spinner from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { httpClient } from "~/lib/http";
import { useGetCities, useGetDistricts, useGetProvinces } from "~/services/indonesia-region";
import { useUpdateUser } from "~/services/user/update";
import { useGetQrCode } from "~/services/whatsapp/get-qr-code";
import { authenticator } from "~/sessions/auth.server";
import { type Anggota, type AnggotaResponse, anggotaSchema } from "~/types/api/anggota";
import type { BaseResponse } from "~/types/constants/base-response";
import type { AuthJwtPayload } from "~/types/constants/jwt-payload";
import { formatInputDate } from "~/utils/format-input-date";
import { formatImagePath } from "~/utils/prefix-file-path";

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await authenticator.isAuthenticated(request);
  const payload = jwtDecode<AuthJwtPayload>(token || "");
  const response = await httpClient.get<BaseResponse<AnggotaResponse>>(`/user/${payload.id}`);
  if (response.data.data === undefined) return {} as AnggotaResponse;
  return response.data.data;
}

export default function DashboardAdminPage() {
  const data = useLoaderData<typeof loader>();
  const { mutateAsync: updateUser } = useUpdateUser(data.id?.toString() || "");
  console.log(data);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const form = useForm<Anggota>({
    resolver: zodResolver(anggotaSchema),
    defaultValues: {
      role: data.role || "",
      nik: data.nik || "",
      nama: data?.nama || "",
      no_hp: data?.no_hp || "",
      tempat_lahir: data?.tempat_lahir || "",
      tanggal_lahir: data?.tanggal_lahir ? formatInputDate(data.tanggal_lahir) : "",
      provinsi: data?.provinsi || "",
      kota: data?.kota || "",
      kecamatan: data?.kecamatan || "",
      alamat: data?.alamat || "",
      status: data?.status || "",
      signature: typeof data?.signature === "string" ? data.signature : undefined,
    },
  });

  const { data: provinces } = useGetProvinces();
  const provincesItems = (provinces?.data ?? []).map((province) => ({
    value: province.code,
    label: province.name,
  })) as ComboboxItem[];

  const selectedProvince = form.watch("provinsi");
  const selectedCity = form.watch("kota");

  const { data: cities } = useGetCities(selectedProvince || "");
  const { data: districts } = useGetDistricts(selectedCity || "");

  const citiesItems = (cities ?? []).map((city) => ({
    value: city.code,
    label: city.name,
  })) as ComboboxItem[];
  const districtsItems = (districts ?? []).map((district) => ({
    value: district.code,
    label: district.name,
  })) as ComboboxItem[];

  const handleProvinceChange = (value: string) => {
    form.setValue("provinsi", value);
    form.setValue("kota", "");
    form.setValue("kecamatan", "");
  };
  const handleCityChange = (value: string) => {
    form.setValue("kota", value);
    form.setValue("kecamatan", "");
  };

  async function onSubmit(data: Anggota) {
    try {
      await updateUser(data);
      toast.success("Data anggota berhasil diubah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah data anggota");
    }
  }

  const { data: qrCodeResponse, refetch: refetchQrCode } = useGetQrCode();

  const handleGenerateQrCode = async () => {
    try {
      await refetchQrCode();
      if (qrCodeResponse?.qr) {
        setQrCodeData(qrCodeResponse.qr);
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  return (
    <PageContainer>
      <div className="space-y-9">
        <div className="flex items-center gap-3">
          <h2 className="~text-base/2xl font-bold tracking-tight">Profil Admin</h2>
        </div>
        <ClientOnly fallback={<Spinner />}>
          {() => (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-10 rounded-md bg-white p-12 lg:flex-row"
              >
                <div className="flex-1 space-y-8">
                  <div className="flex w-full flex-1 flex-col gap-8 lg:flex-row">
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            NIK <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan NIK" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            Nama Lengkap <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan Nama Lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex w-full flex-1 flex-col gap-8 lg:flex-row">
                    <FormField
                      control={form.control}
                      name="tempat_lahir"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            Tempat Lahir <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan Tempat Lahir" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tanggal_lahir"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>
                            Tanggal Lahir <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Input className="!block" type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex w-full flex-1 flex-col gap-8 lg:flex-row">
                    <FormField
                      control={form.control}
                      name="provinsi"
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col gap-2">
                          <FormLabel>
                            Provinsi
                            <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              buttonClassName="w-full flex-1"
                              items={provincesItems}
                              defaultValue={field.value}
                              onValueChange={(value) => handleProvinceChange(value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kota"
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col gap-2">
                          <FormLabel>
                            Kota/Kabupaten
                            <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              buttonClassName="w-full flex-1"
                              items={citiesItems}
                              defaultValue={field.value}
                              onValueChange={(value) => handleCityChange(value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kecamatan"
                      render={({ field }) => (
                        <FormItem className="flex flex-1 flex-col gap-2">
                          <FormLabel>
                            Kecamatan
                            <RequiredIcon />
                          </FormLabel>
                          <FormControl>
                            <Combobox
                              buttonClassName="w-full flex-1"
                              items={districtsItems}
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Detail Alamat <RequiredIcon />
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Masukkan Detail Alamat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          Tanda Tangan Admin <RequiredIcon />
                          {typeof field.value === "string" && (
                            <a
                              href={formatImagePath(data.signature?.toString() ?? "")}
                              target="_blank"
                              rel="noreferrer"
                              className="m-2 text-primary"
                            >
                              Lihat Tanda Tangan Admin
                            </a>
                          )}
                        </FormLabel>
                        <FormControl>
                          <DocumentUploader
                            maxFiles={1}
                            id="signature"
                            files={typeof field.value === "string" ? [field.value] : field.value}
                            setFiles={(files) => field.onChange(files)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="no_hp"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>
                          No. Handphone <RequiredIcon />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan No. Handphone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {qrCodeData && (
                    <div className="mt-4">
                      <h3 className="mb-2 font-semibold">QR Code:</h3>
                      <QRCodeSVG value={qrCodeData} size={256} />
                    </div>
                  )}
                  <div className="ms-auto flex max-w-xl gap-8">
                    <Button
                      type="button"
                      className="w-full bg-orange-500 hover:bg-orange-400"
                      onClick={handleGenerateQrCode}
                    >
                      Scan QR ke WhatsApp
                    </Button>
                    <Button type="submit" className="w-full">
                      Update Profil
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </ClientOnly>
      </div>
    </PageContainer>
  );
}
