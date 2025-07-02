import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import type { TopUpResponse } from "~/types/api/top-up";
import { TOPUP_STATUS } from "~/types/constants/status-top-up";
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
    accessorKey: "user.nik",
    header: "NIK",
  },
  {
    accessorKey: "topup.nama",
    header: "NAMA Lengkap",
  },
  {
    accessorKey: "topup.nominal",
    header: "NOMINAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.topup.nominal)}</span>
          <span className="text-gray-400">{row.original.topup.nama_bank}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "topup.jenis",
    header: "JENIS TRANSAKSI",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <span
          className={`min-w-fit rounded-md p-2 font-semibold text-xs ${
            row.original.topup.status === TOPUP_STATUS.SUKSES
              ? "bg-green-100 text-green-600"
              : row.original.topup.status === TOPUP_STATUS.GAGAL
                ? "bg-red-100 text-red-600"
                : row.original.topup.status === TOPUP_STATUS.MENUNGGU_KONFIRMASI
                  ? "bg-gray-100 text-gray-600"
                  : ""
          }`}
        >
          {row.original.topup.status}
        </span>
      );
    },
  },
];
