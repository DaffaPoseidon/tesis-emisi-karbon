import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T]) => React.ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
}

export default function TableComponent<T extends Record<string, unknown>>({
  columns,
  data,
}: TableProps<T>) {
  return (
    <>
      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border md:h-[calc(75dvh-200px)]">
        <Table className="relative">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className="whitespace-nowrap">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/50" : ""}>
                {columns.map((column, cellIndex) => (
                  <TableCell key={cellIndex} className="whitespace-nowrap">
                    {column.cell
                      ? column.cell(row[column.accessor])
                      : (row[column.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Tidak ada data yang tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <p className="border-t py-3 text-center font-semibold text-muted-foreground text-sm">
        Menampilkan {data.length} Data terakhir
      </p>
    </>
  );
}
