import type { TopUpResponse } from "~/types/api/top-up";
import DetailPenarikanModal from "../modal/detail-penarikan";

interface CellActionProps {
  data: TopUpResponse;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <DetailPenarikanModal data={data} />
    </>
  );
}
