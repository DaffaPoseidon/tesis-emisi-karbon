import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { CellAction } from "./cell-action";
import type { ProyekPendanaan } from "~/types/api/proyek-pendanaan";
import toRupiah from "~/utils/to-rupiah";
import { Badge } from "~/components/ui/badge";
import { StatusProject } from "~/types/constants/status-project";

export const columns: ColumnDef<ProyekPendanaan>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "user.nama",
    header: "PEMILIK PROYEK",
    cell: ({ row }) => {
      return (
        <span className="uppercase">
          {row.original.user ? row.original.user.nama : "Unknown User"}
        </span>
      );
    },
  },
  {
    accessorKey: "project.judul",
    header: "NAMA PROYEK",
  },
  {
    accessorKey: "dana_terkumpul",
    header: "DANA TERKUMPUL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.dana_terkumpul)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "saldo",
    header: "DANA TERSISA",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.saldo)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "project.status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <Badge
          className={`text-white uppercase ${
            row.original.project?.status === StatusProject.APPROVAL ||
            row.original.project?.status === StatusProject.PROSES_VERIFIKASI
              ? "bg-green-500"
              : row.original.project?.status === StatusProject.BERJALAN ||
                  row.original.project?.status === StatusProject.PENDANAAN_DIBUKA ||
                  row.original.project?.status === StatusProject.TTD_KONTRAK ||
                  row.original.project?.status === StatusProject.SELESAI
                ? "bg-blue-500"
                : "bg-red-500"
          }`}
        >
          {row.original.project?.status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "AKSI",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
