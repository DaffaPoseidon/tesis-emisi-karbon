import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import type { Proyek } from "~/types/api/proyek";
import { StatusProject } from "~/types/constants/status-project";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Proyek>[] = [
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
    accessorKey: "judul",
    header: "NAMA PROYEK",
    cell: ({ row }) => {
      return <span className="uppercase">{row.original.judul}</span>;
    },
  },
  {
    accessorKey: "kategori.kategori",
    header: "KATEGORI",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <Badge
          className={`text-white uppercase ${
            row.original.status === StatusProject.APPROVAL ||
            row.original.status === StatusProject.PROSES_VERIFIKASI
              ? "bg-green-500"
              : row.original.status === StatusProject.BERJALAN ||
                  row.original.status === StatusProject.PENDANAAN_DIBUKA ||
                  row.original.status === StatusProject.TTD_KONTRAK ||
                  row.original.status === StatusProject.SELESAI
                ? "bg-blue-500"
                : "bg-red-500"
          }`}
        >
          {row.original.status}
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
