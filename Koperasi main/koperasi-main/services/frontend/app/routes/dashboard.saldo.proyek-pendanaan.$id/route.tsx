import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import { Separator } from "~/components/ui/separator";
import FirstSection from "./components/first-section";
import SecondSection from "./components/second-section";

export function loader({ params }: LoaderFunctionArgs) {
  return { id: params.id };
}

export default function DetailProyekPendanaanPage() {
  const data = useLoaderData<typeof loader>();
  const [phase, setPhase] = useState(1);
  function handleChangePhase() {
    setPhase((prev) => (prev === 1 ? 2 : 1));
  }
  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard/saldo/proyek-pendanaan" />
          <h2 className="~text-base/2xl font-bold tracking-tight">
            Detail Dompet Proyek Pendanaan
          </h2>
        </div>
        <div className="flex">
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={handleChangePhase}
          >
            <span
              className={`px-5 font-medium ${phase === 1 ? "text-primary" : "text-gray-600 group-hover:text-primary"}`}
            >
              Upload Bukti Transfer
            </span>
            <Separator className={`${phase === 1 ? "h-[2px] bg-primary" : "hidden"}`} />
          </button>
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={handleChangePhase}
          >
            <span
              className={`px-5 font-medium ${phase === 2 ? "text-primary" : "text-gray-600 group-hover:text-primary"}`}
            >
              Riwayat Transfer
            </span>
            <Separator className={`${phase === 2 ? "h-[2px] bg-primary" : "hidden"}`} />
          </button>
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="h-fit flex-1">
            {phase === 1 ? (
              <FirstSection id={data.id || "1"} />
            ) : (
              <SecondSection id={data.id || ""} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
