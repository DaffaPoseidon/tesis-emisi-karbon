import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { CellAction } from "./cell-action";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import toRupiah from "~/utils/to-rupiah";
import type { PemilikPelaksanaResponse } from "~/types/api/pemilik-pelaksana";

export const columns: ColumnDef<PemilikPelaksanaResponse>[] = [
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
    header: "TANGGAL PERMINTAAN",
    cell: ({ row }) => {
      return <span>{toLocaleDateTime(row.original.created_at)}</span>;
    },
  },
  {
    accessorKey: "nama",
    header: "NAMA ANGGOTA",
  },
  {
    accessorKey: "nominal",
    header: "NOMINAL",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span>{toRupiah(row.original.nominal)}</span>
          {/* <span className="text-gray-400">{row.original.nama_bank}</span> */}
        </div>
      );
    },
  },
  {
    accessorKey: "jenis",
    header: "JENIS TRANSAKSI",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      return (
        <span
          className={`min-w-fit rounded-md p-2 font-semibold text-xs ${
            row.original.status === "SUKSES"
              ? "bg-green-100 text-green-600"
              : row.original.status === "GAGAL"
                ? "bg-red-100 text-red-600"
                : row.original.status === "MENUNGGU KONFIRMASI"
                  ? "bg-gray-100 text-gray-600"
                  : ""
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
