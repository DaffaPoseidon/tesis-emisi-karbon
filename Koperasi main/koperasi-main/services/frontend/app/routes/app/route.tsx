import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, json, redirect, useLoaderData } from "@remix-run/react";
import Header from "~/components/layouts/header";
import Sidebar from "~/components/layouts/sidebar";
import { isAdmin, isMemberBasic, isMemberNotActive, isMemberPlatinum } from "~/lib/middleware";
import { platinumNavItems, regularNavItems } from "./constants/nav-items";

export async function loader({ request }: LoaderFunctionArgs) {
  const [isUserAdmin, isPlatinum, isMember, isNotActive] = await Promise.all([
    isAdmin(request),
    isMemberPlatinum(request),
    isMemberBasic(request),
    isMemberNotActive(request),
  ]);

  if (isUserAdmin) {
    return redirect("/dashboard");
  }
  if (!isPlatinum && !isMember) {
    throw json(
      { message: "Unauthorized" },
      {
        status: 401,
        statusText: "Anda tidak memiliki akses ke halaman ini",
      },
    );
  }
  if (isNotActive) {
    return redirect("/member");
  }
  return { isPlatinum, isMember };
}

export default function AppLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex max-h-dvh min-h-dvh bg-primary/5">
      <Sidebar navItems={data.isPlatinum ? platinumNavItems : regularNavItems} />
      <div className="w-full flex-1 overflow-auto">
        <Header
          navItems={data.isPlatinum ? platinumNavItems : regularNavItems}
          profileHref="/app/profile"
        />
        <main className="py-2.5 md:p-5" id="main-layout">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
