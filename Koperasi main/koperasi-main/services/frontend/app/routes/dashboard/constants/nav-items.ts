import type { NavItem } from "~/types/constants/nav-item";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Anggota",
    href: "/dashboard/anggota",
    icon: "users",
    label: "anggota",
  },
  {
    title: "Proyek",
    icon: "projects",
    label: "proyek",
    subItems: [
      {
        title: "Pengajuan Proyek",
        href: "/dashboard/proyek/pengajuan",
        label: "pengajuan",
        subTitle: "PP",
      },
      {
        title: "Laporan",
        href: "/dashboard/proyek/report",
        label: "laporan",
        subTitle: "L",
      },
    ],
  },
  {
    title: "Saldo",
    icon: "saldo",
    label: "saldo",
    subItems: [
      {
        title: "Top Up",
        href: "/dashboard/saldo/top-up",
        label: "top-up",
        subTitle: "TU",
      },
      {
        title: "Penarikan Saldo",
        href: "/dashboard/saldo/penarikan",
        label: "penarikan",
        subTitle: "PS",
      },
      {
        title: "Proyek Pendanaan",
        href: "/dashboard/saldo/proyek-pendanaan",
        label: "proyek-pendanaan",
        subTitle: "PP",
      },
      {
        title: "Penarikan Saldo Proyek",
        href: "/dashboard/saldo/tarik-proyek",
        label: "penarikan-proyek",
        subTitle: "PSP",
      },
      {
        title: "Profit Sharing Manajemen Proyek",
        href: "/dashboard/saldo/profit-manajemen",
        label: "penarikan-proyek",
        subTitle: "PSM",
      },
    ],
  },
  {
    title: "Profil",
    href: "/dashboard/profile",
    icon: "user",
    label: "profile",
  },
];
