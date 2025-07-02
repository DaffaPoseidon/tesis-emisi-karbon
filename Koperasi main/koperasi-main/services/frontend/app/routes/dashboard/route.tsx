import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Header from "~/components/layouts/header";
import Sidebar from "~/components/layouts/sidebar";
import { isAdmin } from "~/lib/middleware";
import { navItems } from "./constants/nav-items";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserAdmin = await isAdmin(request);
  if (!isUserAdmin) {
    throw json(
      { message: "Unauthorized" },
      { status: 401, statusText: "Anda tidak memiliki akses ke halaman ini" },
    );
  }
  return { isUserAdmin };
}

export default function DashboardLayout() {
  return (
    <div className="flex max-h-dvh min-h-dvh bg-primary/5">
      <Sidebar navItems={navItems} />
      <div className="w-full flex-1 overflow-auto">
        <Header navItems={navItems} profileHref="/dashboard/profile" />
        <main className="py-2.5 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
