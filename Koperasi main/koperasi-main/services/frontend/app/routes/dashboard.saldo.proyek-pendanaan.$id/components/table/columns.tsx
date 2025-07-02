import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { HistoryPendanaan } from "~/types/api/proyek-pendanaan";
import { formatImagePath } from "~/utils/prefix-file-path";
import toRupiah from "~/utils/to-rupiah";

export const columns: ColumnDef<HistoryPendanaan>[] = [
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
    accessorKey: "nominal",
    header: "NOMINAL TRANSFER",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.nominal ?? 0)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dana_tersisa",
    header: "DANA TERSISA",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.dana_tersisa ?? 0)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "deskripsi",
    header: "DESKRIPSI",
  },
  {
    accessorKey: "bukti_transfer",
    header: "BUKTI PEMBAYARAN",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <a
            href={formatImagePath(row.original.bukti_transfer?.toString() || "")}
            target="_blank"
            rel="noreferrer"
            className="text-primary"
          >
            Lihat Dokumen
          </a>
        </div>
      );
    },
  },
];
