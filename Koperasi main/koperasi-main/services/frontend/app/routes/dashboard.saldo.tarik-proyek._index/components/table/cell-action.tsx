import DetailPenarikanSaldoProyek from "../modal/penarikan-proyek";
import type { Proyek } from "~/types/api/proyek";

interface CellActionProps {
  data: Proyek;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <DetailPenarikanSaldoProyek data={data} />
    </>
  );
}
