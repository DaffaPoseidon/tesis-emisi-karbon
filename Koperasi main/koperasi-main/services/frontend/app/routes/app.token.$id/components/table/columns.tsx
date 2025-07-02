import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { HistoryTokenResponse } from "~/types/api/history-token";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import toPercentage from "~/utils/to-presentase";
import toRupiah from "~/utils/to-rupiah";

export const columns: ColumnDef<HistoryTokenResponse>[] = [
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
      return <span>{toLocaleDateTime(row.original.created_at)}</span>;
    },
  },
  {
    accessorKey: "totalNominalToken",
    header: "MODAL AWAL",
    cell: ({ row }) => {
      return <span className="w-fit">{toRupiah(row.original.totalNominalToken)}</span>;
    },
  },
  {
    accessorKey: "persentase",
    header: "RETURN",
    cell: ({ row }) => {
      return <span className="w-fit">{row ? toPercentage(row.original.persentase) : "0.00"}</span>;
    },
  },
  {
    accessorKey: "perubahan",
    header: "UNTUNG/RUGI",
    cell: ({ row }) => {
      return <span className="w-fit">{toRupiah(row.original.perubahan)}</span>;
    },
  },
  {
    accessorKey: "nilai",
    header: "NOMINAL TOKEN SAAT INI DALAM RUPIAH",
    cell: ({ row }) => {
      return <span className="w-fit">{toRupiah(row.original.nilai)}</span>;
    },
  },
];
