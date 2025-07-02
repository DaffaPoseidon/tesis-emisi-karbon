import type { PemilikPelaksanaResponse } from "~/types/api/pemilik-pelaksana";
import DetailTransferManajamenPemilik from "../modal/detail-transfer";

interface CellActionProps {
  data: PemilikPelaksanaResponse;
}

export function CellAction({ data }: CellActionProps) {
  return (
    <>
      <DetailTransferManajamenPemilik data={data} />
    </>
  );
}
