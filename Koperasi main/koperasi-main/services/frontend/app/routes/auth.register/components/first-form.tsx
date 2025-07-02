import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import PasswordObscure from "~/components/input/PasswordObscure";
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
import { type TFirstForm, firstFormSchema } from "~/types/api/auth";

interface FirstFormProps {
  onSubmit: (data: TFirstForm) => void;
  id: string;
  defaultValues: Partial<TFirstForm>;
}

export default function FirstForm({ onSubmit, id, defaultValues }: FirstFormProps) {
  const form = useForm<z.infer<typeof firstFormSchema>>({
    resolver: zodResolver(firstFormSchema),
    defaultValues: {
      ...defaultValues,
      confirm_password: "",
    },
  });

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama (Sesuai KTP)
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <Input placeholder="Nama anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="no_hp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                No. Handphone
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <Input placeholder="62 xxxxx" inputMode="numeric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Kata Sandi
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <PasswordObscure placeholder="Kata Sandi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Konfirmasi Kata Sandi
                <RequiredIcon />
              </FormLabel>
              <FormControl>
                <PasswordObscure placeholder="Kata Sandi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
