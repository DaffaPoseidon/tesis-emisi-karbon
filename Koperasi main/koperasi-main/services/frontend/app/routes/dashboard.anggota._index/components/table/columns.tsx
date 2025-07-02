import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { Anggota } from "~/types/api/anggota";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Anggota>[] = [
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
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "nama",
    header: "NAMA LENGKAP",
    cell: ({ row }) => {
      return (
        <span className="uppercase">{row.original.nama ? row.original.nama : "Unknown User"}</span>
      );
    },
  },
  {
    accessorKey: "no_hp",
    header: "NO HP",
  },
  {
    accessorKey: "role",
    header: "MEMBER",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <span
          className={`min-w-fit rounded-md p-2 font-semibold text-xs ${
            row.original.status === "AKTIF"
              ? "bg-green-100 text-green-600"
              : row.original.status === "TIDAK AKTIF"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {row.original.status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "AKSI",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
