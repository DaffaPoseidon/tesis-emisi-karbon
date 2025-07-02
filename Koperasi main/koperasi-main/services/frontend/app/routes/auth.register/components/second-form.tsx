import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import DocumentUploader from "~/components/document-uploader";
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
import { Textarea } from "~/components/ui/textarea";
import { useGetCities, useGetDistricts, useGetProvinces } from "~/services/indonesia-region";
import { type TSecondForm, secondFormSchema } from "~/types/api/auth";

interface SecondFormProps {
  onSubmit: (data: TSecondForm) => void;
  id: string;
  defaultValues: Partial<TSecondForm>;
}

export default function SecondForm({ onSubmit, id, defaultValues }: SecondFormProps) {
  const form = useForm<z.infer<typeof secondFormSchema>>({
    resolver: zodResolver(secondFormSchema),
    defaultValues: defaultValues,
  });

  const { data: provinces } = useGetProvinces();
  const provincesItems = (provinces?.data ?? []).map((province) => ({
    value: province.code,
    label: province.name,
  })) as ComboboxItem[];

  const selectedProvince = form.watch("provinsi");
  const selectedCity = form.watch("kota");

  const { data: cities } = useGetCities(selectedProvince);
  const { data: districts } = useGetDistricts(selectedCity);

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

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nik"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                NIK
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <Input placeholder="Nomor Induk Kependudukan" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="tempat_lahir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tempat Lahir
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Tempat Lahir Anda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tanggal_lahir"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tanggal Lahir
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Input className="!block" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="provinsi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Provinsi
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Combobox
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
              <FormItem>
                <FormLabel>
                  Kota/Kabupaten
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Combobox
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
              <FormItem>
                <FormLabel>
                  Kecamatan
                  <RequiredIcon />
                </FormLabel>
                <FormControl>
                  <Combobox
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
                Alamat
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Cth. Jalan Mawar ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="foto_diri"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Foto Diri
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <DocumentUploader
                  maxFiles={2}
                  id="foto_diri"
                  files={field.value}
                  setFiles={(files) => field.onChange(files)}
                />
              </FormControl>
              <FormMessage />
              <ul className="ms-3 list-disc">
                <li className="text-gray-500 text-xs">
                  Unggah foto diri anda dengan format JPG, PNG, atau JPEG.
                </li>
                <li className="text-gray-500 text-xs">Maksimum size file 4 MB.</li>
              </ul>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="foto_ktp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Foto KTP
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <DocumentUploader
                  maxFiles={2}
                  id="foto_ktp"
                  files={field.value}
                  setFiles={(files) => field.onChange(files)}
                />
              </FormControl>
              <FormMessage />
              <ul className="ms-3 list-disc">
                <li className="text-gray-500 text-xs">
                  Unggah dokumen pendukung seperti KTP dengan format JPG, PNG, atau JPEG.
                </li>
                <li className="text-gray-500 text-xs">Maksimum size file 4 MB.</li>
              </ul>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
