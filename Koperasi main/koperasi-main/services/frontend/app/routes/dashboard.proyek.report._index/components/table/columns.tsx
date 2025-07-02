import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { Proyek } from "~/types/api/proyek";
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
    id: "actions",
    header: "AKSI",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
