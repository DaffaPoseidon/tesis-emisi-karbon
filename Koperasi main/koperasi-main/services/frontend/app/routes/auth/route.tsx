import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, redirect, useLocation } from "@remix-run/react";
import {
  isAdmin,
  isMemberBasic,
  isMemberHasOTP,
  isMemberNotActive,
  isMemberPlatinum,
} from "~/lib/middleware";
import RegisterCarousel from "./components/RegisterCarousel";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserAdmin = await isAdmin(request);
  const isPlatinum = await isMemberPlatinum(request);
  const isMember = await isMemberBasic(request);
  const isNotActive = await isMemberNotActive(request);
  const isMemberOTP = await isMemberHasOTP(request);
  if (isUserAdmin) {
    return redirect("/dashboard");
  }
  if (isPlatinum || isMember) {
    return redirect("/app");
  }
  if (isNotActive) {
    return redirect("/member");
  }
  if (isMemberOTP) {
    return redirect("/otp");
  }
  return null;
}

export default function AuthLayout() {
  const location = useLocation();
  return (
    <main className="max-h-screen min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className={`hidden lg:block ${location.pathname === "/auth/regsiter" ? "xl:p-10" : ""}`}>
        {location.pathname === "/auth/register" ? (
          <div className="relative flex h-full items-center justify-center rounded-md bg-[#F1FFF9]">
            <RegisterCarousel />
          </div>
        ) : (
          <img
            src="/img/auth/hero.png"
            alt="hero"
            loading="lazy"
            className="h-full w-full rounded-r-md object-cover xl:max-h-screen dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
      <div className="flex max-h-screen items-center justify-center overflow-auto py-12">
        <Outlet />
      </div>
    </main>
  );
}
