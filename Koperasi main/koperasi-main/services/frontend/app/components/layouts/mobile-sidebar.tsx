import { MenuIcon } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import type { NavItem } from "~/types/constants/nav-item";
import { DashboardNav } from "./dashboard-nav";

type MobileSidebarProps = {
  navItems: NavItem[];
};

export function MobileSidebar({ navItems }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent className="!px-0" side="left">
        <SheetTitle>
          <span className="sr-only">Menu Navigasi</span>
        </SheetTitle>
        <SheetDescription>
          <span className="mb-2 px-4 font-semibold text-lg tracking-tight">Menu Navigasi</span>
        </SheetDescription>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <DashboardNav isMobileNav={true} items={navItems} setOpen={setOpen} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
