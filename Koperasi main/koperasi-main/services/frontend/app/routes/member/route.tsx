import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, Outlet, json, redirect, useNavigation } from "@remix-run/react";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  isAdmin,
  isMemberBasic,
  isMemberHasOTP,
  isMemberNotActive,
  isMemberPlatinum,
} from "~/lib/middleware";
import RegisterCarousel from "../auth/components/RegisterCarousel";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserAdmin = await isAdmin(request);
  const isPlatinum = await isMemberPlatinum(request);
  const isMember = await isMemberBasic(request);
  const isNonActive = await isMemberNotActive(request);
  const isMemberOTP = await isMemberHasOTP(request);
  if (isUserAdmin) {
    return redirect("/dashboard");
  }
  if (isPlatinum || isMember) {
    return redirect("/app");
  }
  if (isMemberOTP) {
    return redirect("/otp");
  }
  if (!isNonActive) {
    throw json(
      { message: "Anda belum terdaftar sebagai anggota koperasi." },
      { status: 401, statusText: "Anda tidak memiliki akses ke halaman ini" },
    );
  }
  return null;
}

export default function MemberLayout() {
  const navigation = useNavigation();

  return (
    <main className="max-h-screen min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden lg:block xl:p-10}">
        <div className="relative flex h-full items-center justify-center rounded-md bg-[#F1FFF9]">
          <RegisterCarousel />
        </div>
      </div>
      <div className="flex max-h-screen items-center justify-center overflow-auto py-12">
        <Form className="!p-0 absolute top-5 right-10" method="post" action="/action/logout">
          <Button
            className="w-full cursor-pointer justify-between text-start"
            disabled={navigation.state === "submitting"}
            variant="destructive"
            type="submit"
          >
            Keluar <LogOutIcon className="ms-3 size-5" />
          </Button>
        </Form>
        <Outlet />
      </div>
    </main>
  );
}
