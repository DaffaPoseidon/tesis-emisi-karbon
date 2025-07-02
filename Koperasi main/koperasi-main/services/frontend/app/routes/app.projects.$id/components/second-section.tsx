import { InvestorListItem } from "~/components/cards/modal-card";
import type { TokenResponse } from "~/types/api/proyek";

interface SecondSectionProps {
  investors: TokenResponse[]; // Changed to accept array of investors
}

export default function SecondSection({ investors }: SecondSectionProps) {
  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <h2 className="font-semibold text-xl">Penanam Modal</h2>
      {investors && investors.length > 0 ? (
        investors.map((investor, index) => <InvestorListItem key={index} investor={investor} />)
      ) : (
        <p className="text-gray-500">Belum ada penanam modal</p>
      )}
    </section>
  );
}
