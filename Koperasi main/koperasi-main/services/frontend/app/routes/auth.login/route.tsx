import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, json, redirect, useActionData, useNavigation } from "@remix-run/react";
import { useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef } from "react";
import { AuthorizationError } from "remix-auth";
import { toast } from "sonner";
import PasswordObscure from "~/components/input/PasswordObscure";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator } from "~/sessions/auth.server";
import { commitSession, getSession } from "~/sessions/session.server";
import type { AuthJwtPayload } from "~/types/constants/jwt-payload";

export async function action({ request }: ActionFunctionArgs) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const user = await authenticator.authenticate("user-pass", request, {
      throwOnError: true,
    });
    const session = await getSession(request.headers.get("Cookie"));
    session.set(authenticator.sessionKey, user);
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    const decoded = jwtDecode<AuthJwtPayload>(user);
    if (decoded.status === "OTP TERKIRIM") {
      return redirect("/otp", { headers });
    }
    if (decoded.role === "ADMIN" && decoded.status === "AKTIF") {
      return redirect("/dashboard", { headers });
    }
    if (decoded.role === "BASIC" && decoded.status === "TIDAK AKTIF") {
      return redirect("/member", { headers });
    }
    return redirect("/app", { headers });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof AuthorizationError) {
      return json({ message: "No Hp atau password salah, silahkan coba lagi!" });
    }
  }
}

export default function LoginPage() {
  const data = useActionData<typeof action>();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const toastShown = useRef(false);

  useEffect(() => {
    if (data && data.message === "No Hp atau password salah, silahkan coba lagi!") {
      toast.error(data.message);
      toastShown.current = true;
    }

    return () => {
      queryClient.invalidateQueries();
    };
  }, [data, queryClient]);

  return (
    <section className="mx-auto my-auto grid w-full max-w-2xl gap-6 px-5">
      <div className="grid gap-2">
        <img src="/img/icon.png" alt="Logo" className="w-56" />
        <h1 className="font-bold text-3xl">Selamat Datang!</h1>
        <p className="text-balance text-muted-foreground">
          Silahkan masukkan nomor handphone dan password anda.
        </p>
      </div>
      <Form className="grid gap-4" method="POST">
        <div className="grid gap-2">
          <Label htmlFor="no_hp">Nomor Handphone</Label>
          <Input
            autoComplete="tel"
            autoFocus
            name="no_hp"
            id="no_hp"
            type="tel"
            placeholder="Nomor Handphone Anda"
            required
          />
        </div>
        <div className="grid gap-2">
          <PasswordObscure
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="Kata Sandi"
            minLength={8}
            required
          />
        </div>
        <Button
          disabled={navigation.state === "submitting"}
          type="submit"
          className="w-full font-semibold"
        >
          {navigation.state === "submitting" ? "Memproses..." : "Masuk"}
        </Button>
      </Form>
      <div className="text-center text-sm">
        Belum punya akun?{" "}
        <Link to="/auth/register" className="text-primary underline hover:text-primary/80">
          Daftar disini
        </Link>
      </div>
    </section>
  );
}
