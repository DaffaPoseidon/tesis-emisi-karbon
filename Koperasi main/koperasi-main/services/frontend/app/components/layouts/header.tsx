import { useJWTPayload } from "~/hooks/use-jwt-payload";
import { useGetUserById } from "~/services/profile/get-by-id";
import type { NavItem } from "~/types/constants/nav-item";
import { MobileSidebar } from "./mobile-sidebar";
import { UserNav } from "./user-nav";

type HeaderProps = {
  navItems: NavItem[];
  profileHref: string;
};

export default function Header({ navItems, profileHref }: HeaderProps) {
  const { jwtPayload } = useJWTPayload();
  const { data } = useGetUserById(jwtPayload.id);

  return (
    <header className="z-50 w-full bg-white shadow-sm">
      <nav className="flex items-center justify-between px-4 py-2.5 md:justify-end">
        <div className="lg:!hidden flex flex-1 items-center gap-2">
          <MobileSidebar navItems={navItems} />
          <img src="/img/icon.png" alt="Logo" className="w-40" />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-medium text-sm md:block">
            Halo, <span className="uppercase">{data?.nama}</span>
          </span>
          <UserNav
            profileHref={profileHref}
            username={data?.nama || ""}
            phone={data?.no_hp || ""}
          />
        </div>
      </nav>
    </header>
  );
}
