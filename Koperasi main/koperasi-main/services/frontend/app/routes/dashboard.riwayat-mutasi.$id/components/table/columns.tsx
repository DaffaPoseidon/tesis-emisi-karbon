import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { TMutasi } from "~/types/api/laporan";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import { formatImagePath } from "~/utils/prefix-file-path";
import toRupiah from "~/utils/to-rupiah";

export const columns: ColumnDef<TMutasi>[] = [
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
    accessorKey: "created_at",
    header: "TANGGAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toLocaleDateTime(row.original.created_at)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "judul",
    header: "JUDUL LAPORAN",
  },
  {
    accessorKey: "pemasukan",
    header: "PEMASUKAN",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.pemasukan)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "pengeluaran",
    header: "PENGELUARAN",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.pengeluaran)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "laporan",
    header: "DOKUMEN LAPORAN",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <a
            href={formatImagePath(row.original.laporan)}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500"
          >
            Lihat Dokumen
          </a>
        </div>
      );
    },
  },
];
