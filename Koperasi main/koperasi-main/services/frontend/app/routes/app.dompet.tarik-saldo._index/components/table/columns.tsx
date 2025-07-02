import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { TopUpResponse } from "~/types/api/top-up";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import { formatWalletImage } from "~/utils/prefix-wallet-path";
import toRupiah from "~/utils/to-rupiah";
export const columns: ColumnDef<TopUpResponse>[] = [
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
    accessorKey: "topup.created_at",
    header: "TANGGAL",
    cell: ({ row }) => {
      return <span>{toLocaleDateTime(row.original.topup.created_at)}</span>;
    },
  },
  {
    accessorKey: "topup.nama",
    header: "NAMA",
  },
  {
    accessorKey: "topup.nominal",
    header: "NOMINAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.topup.nominal)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "topup.jenis",
    header: "JENIS",
  },
  {
    accessorKey: "topup.status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <span
          className={`min-w-fit rounded-md p-2 font-semibold text-xs ${
            row.original.topup.status === "SUKSES"
              ? "bg-green-100 text-green-600"
              : row.original.topup.status === "GAGAL"
                ? "bg-red-100 text-red-600"
                : row.original.topup.status === "MENUNGGU KONFIRMASI"
                  ? "bg-gray-100 text-gray-600"
                  : ""
          }`}
        >
          {row.original.topup.status}
        </span>
      );
    },
  },
  {
    accessorKey: "bukti_pembayaran",
    header: "BUKTI PEMBAYARAN ADMIN",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          {row.original.topup.bukti_pembayaran ? (
            <a
              href={formatWalletImage(row.original.topup.bukti_pembayaran)}
              target="_blank"
              rel="noreferrer"
              className="text-primary"
            >
              Lihat Dokumen
            </a>
          ) : (
            <span className="text-gray-500">Dokumen belum Tersedia</span>
          )}
        </div>
      );
    },
  },
];
