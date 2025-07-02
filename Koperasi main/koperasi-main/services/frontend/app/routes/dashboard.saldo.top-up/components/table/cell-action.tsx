import type { TopUpResponse } from "~/types/api/top-up";
import DetailTopUpModal from "../modal/detail-topup";

interface CellActionProps {
  data: TopUpResponse;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <DetailTopUpModal data={data} />
    </>
  );
}
