import { Link } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { useSidebar } from "~/hooks/use-sidebar";
import { cn } from "~/lib/clsx";
import type { NavItem } from "~/types/constants/nav-item";
import { DashboardNav } from "./dashboard-nav";

type SidebarProps = {
  className?: string;
  navItems: NavItem[];
};

export default function Sidebar({ className, navItems }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();

  const handleToggle = () => {
    toggle();
  };

  return (
    <aside
      className={cn(
        "relative hidden h-full min-h-screen flex-none border-r bg-card bg-white transition-[width] duration-500 lg:block",
        !isMinimized ? "w-72" : "w-[72px]",
        className,
      )}
    >
      <div className="hidden p-5 pt-10 lg:block">
        <Link to="#">
          {isMinimized ? (
            <img src="/favicon.ico" alt="Logo" className="w-10" />
          ) : (
            <img src="/img/icon.png" alt="Logo" className="w-40" />
          )}
        </Link>
      </div>
      <ChevronLeft
        className={cn(
          "-right-3 absolute top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-primary",
          isMinimized && "rotate-180",
        )}
        onClick={handleToggle}
      />
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </aside>
  );
}
