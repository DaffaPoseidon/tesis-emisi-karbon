import { Link, type LinkProps } from "@remix-run/react";
import { BadgeDollarSign, User2 } from "lucide-react";
import { forwardRef } from "react";
import { useGetProjectToken } from "~/services/projects/get-user-token";
import type { Proyek } from "~/types/api/proyek";
import { StatusProject } from "~/types/constants/status-project";
import toRupiah from "~/utils/to-rupiah";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import BorderedCard from "./bordered-card";

export interface ProjectCardProps extends LinkProps {
  data: Proyek | undefined;
}

const ProjectCard = forwardRef<HTMLAnchorElement, ProjectCardProps>(
  ({ data, to, ...props }, ref) => {
    const { data: tokenData } = useGetProjectToken(data?.id);

    const tokenValue = () => {
      const collectedTokens = tokenData?.jumlah_token ?? 0;
      const totalTokens = data?.jumlah_koin ? Number.parseInt(data.jumlah_koin, 10) : 0;

      if (totalTokens === 0) return 0;

      const percentage = (collectedTokens / totalTokens) * 100;

      return Math.min(100, Math.max(0, percentage));
    };

    const getTokenPriceTier = (price: number) => {
      if (price >= 10000000) return "text-blue-500 font-bold";
      if (price >= 5000000) return "text-green-500 font-bold";
      if (price >= 1000000) return "text-yellow-500 font-bold";
      if (price >= 100000) return "text-gray-400 font-bold";
      return "text-gray-500";
    };

    const getTokenPriceLabel = (price: number) => {
      if (price >= 10000000)
        return (
          <div className="flex items-center">
            <img src="/img/card/diamond.png" alt="Diamond Tier" className="mr-1 h-6 w-6" />
          </div>
        );
      if (price >= 5000000)
        return (
          <div className="flex items-center">
            <img src="/img/card/emerald.png" alt="Emerald Tier" className="mr-1 h-5 w-6" />
          </div>
        );
      if (price >= 1000000)
        return (
          <div className="flex items-center">
            <img src="/img/card/gold-bars.png" alt="Gold Tier" className="mr-1 h-7 w-8" />
          </div>
        );
      if (price >= 100000)
        return (
          <div className="flex items-center">
            <BadgeDollarSign className="size-6 border text-gray-600" />
          </div>
        );
      return "";
    };

    return (
      <Link
        ref={ref}
        to={to}
        className="w-full space-y-6 rounded-md bg-white p-8 shadow-md"
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-primary p-1.5">
            <User2 className="text-white" />
          </div>
          {data && (
            <Badge
              className={`text-white uppercase ${
                data.status === StatusProject.APPROVAL ||
                data.status === StatusProject.PROSES_VERIFIKASI
                  ? "bg-green-500"
                  : data.status === StatusProject.BERJALAN ||
                      data.status === StatusProject.PENDANAAN_DIBUKA ||
                      data.status === StatusProject.TTD_KONTRAK ||
                      data.status === StatusProject.SELESAI
                    ? "bg-blue-500"
                    : "bg-red-500"
              }`}
            >
              {data.status}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          {data && (
            <>
              <h4 className="font-semibold text-lg uppercase">{data.judul}</h4>
              <p className="font-medium text-gray-500">{data.user?.nama}</p>
              <div className="flex items-center space-x-2">
                <p className={getTokenPriceTier(Number(data.harga_per_unit))}>
                  Harga PerToken: {toRupiah(data.harga_per_unit?.toString() ?? "0")}
                </p>
                <span className="font-medium">
                  {getTokenPriceLabel(Number(data.harga_per_unit))}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <BorderedCard title="Token Ditawarkan" value={data?.jumlah_koin ?? "0"} />
          <BorderedCard title="Min. Beli" value={data?.minimal_pembelian ?? "0"} />
        </div>
        <Progress value={tokenValue()} />
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-500">Terkumpul</h3>
            <h4 className="font-medium text-lg">{tokenData?.jumlah_token ?? 0} Token</h4>
          </div>
          <div>
            <h3 className="font-bold text-gray-500">Sisa Hari</h3>
            <h4 className="font-medium text-lg">{0} Hari</h4>
          </div>
        </div>
      </Link>
    );
  },
);

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
