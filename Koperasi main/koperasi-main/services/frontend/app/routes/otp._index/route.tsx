import { zodResolver } from "@hookform/resolvers/zod";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useNavigate } from "@remix-run/react";
import { jwtDecode } from "jwt-decode";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/components/ui/input-otp";
import { httpClient } from "~/lib/http";
import { useVerifyOtp } from "~/services/user/verify-otp";
import { authenticator } from "~/sessions/auth.server";
import type { AnggotaResponse } from "~/types/api/anggota";
import type { BaseResponse } from "~/types/constants/base-response";
import type { AuthJwtPayload } from "~/types/constants/jwt-payload";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw json(
      {
        message: "Anda belum terdaftar sebagai anggota koperasi.",
      },
      { status: 401, statusText: "Anda tidak memiliki akses ke halaman ini" },
    );
  }
  const decoded = jwtDecode<AuthJwtPayload>(user);
  const userData = await httpClient.get<BaseResponse<AnggotaResponse>>(`/user/${decoded.id}`);
  if (userData.data.data?.status !== "OTP TERKIRIM") {
    throw json(
      {
        message: "Anda belum terdaftar sebagai anggota koperasi.",
      },
      { status: 401, statusText: "Anda tidak memiliki akses ke halaman ini" },
    );
  }
  return json({ data: userData.data.data });
}

const FormSchema = z.object({
  otp: z.string().min(4, {
    message: "Kode OTP harus terdiri dari 4 karakter.",
  }),
});

export default function MemberOtpPage() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { mutateAsync } = useVerifyOtp();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await mutateAsync(data.otp);
      toast.success("OTP berhasil diverifikasi, Silahkan Login Kembali");
      fetcher.submit({}, { method: "post", action: "/action/logout" });
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Terjadi kesalahan saat memverifikasi OTP, silahkan coba lagi.");
      }
    }
  }

  return (
    <Card className="mx-auto my-auto grid w-full max-w-2xl gap-2 overflow-auto px-5">
      <CardHeader>
        <CardTitle className="text-center font-semibold text-xl">
          Silahkan Masukkan Kode OTP
        </CardTitle>
      </CardHeader>
      <CardContent className="mx-auto flex w-full flex-col items-center justify-center gap-6">
        <div className="flex justify-center">
          <img src="/img/vector/payment.svg" alt="Wallet" className="size-52" />
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex max-w-2xl flex-col items-center justify-center space-y-6"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup className="gap-6">
                        <InputOTPSlot className="size-16 rounded-md border-2 text-xl" index={0} />
                        <InputOTPSlot className="size-16 rounded-md border-2 text-xl" index={1} />
                        <InputOTPSlot className="size-16 rounded-md border-2 text-xl" index={2} />
                        <InputOTPSlot className="size-16 rounded-md border-2 text-xl" index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={form.formState.isSubmitting} className="w-full" type="submit">
              {form.formState.isSubmitting ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-gray-500 text-sm">
          OTP error atau tidak menerima OTP?{" "}
          <Link to="#" className="text-emerald-500 hover:underline">
            Chat Admin
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
