import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { TLaporanResponse } from "~/types/api/laporan";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import toRupiah from "~/utils/to-rupiah";

export const columns: ColumnDef<TLaporanResponse>[] = [
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
    accessorKey: "tanggal",
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
    accessorKey: "jenis_laporan",
    header: "JENIS LAPORAN",
  },
  {
    accessorKey: "modal",
    header: "MODAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.modal)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "nominal",
    header: "NOMINAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.nominal)}</span>
        </div>
      );
    },
  },
];
