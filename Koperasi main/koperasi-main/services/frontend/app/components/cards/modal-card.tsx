import type { TokenResponse } from "~/types/api/proyek";
import { toLocaleDateTime } from "~/utils/format-to-locale-time";
import toRupiah from "~/utils/to-rupiah";

export function InvestorListItem({ investor }: { investor: TokenResponse }) {
  return (
    <div className="flex items-center justify-between border-gray-200 border-b py-4 last:border-b-0">
      <div className="flex items-center">
        <div className="ml-4">
          <p className="font-medium text-gray-900 text-sm">{investor.nama}</p>
          <p className="text-gray-500 text-sm">{toLocaleDateTime(investor.token_created_at)}</p>
        </div>
      </div>
      <div className="text-right">
        {/* <p className="font-medium text-gray-900 text-sm">Jumlah Modal</p> */}
        <p className="text-gray-500 text-sm">{investor.jumlah_token} Token</p>
        <p className="text-green-600 text-sm">{toRupiah(investor.total_nilai_token)}</p>
      </div>
    </div>
  );
}
