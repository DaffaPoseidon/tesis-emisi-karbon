import { Link, type LinkProps } from "@remix-run/react";
import { User2 } from "lucide-react";
import { forwardRef } from "react";
import type { Proyek } from "~/types/api/proyek";
import { StatusProject } from "~/types/constants/status-project";
import { Badge } from "../ui/badge";
import BorderedCard from "./bordered-card";
import toRupiah from "~/utils/to-rupiah";
import { Button } from "../ui/button";
import toPercentage from "~/utils/to-presentase";

export interface ProjectUseTokenCardProps extends LinkProps {
  data: Proyek | undefined;
}

const ProjectUseTokenCard = forwardRef<HTMLAnchorElement, ProjectUseTokenCardProps>(
  ({ data, to, ...props }, ref) => {
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
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <BorderedCard title="Jumlah Token Dibeli" value={data?.token_count ?? "0"} />
          <div className="rounded-md border border-gray-400 border-dashed p-3">
            <h3 className="font-bold text-blue-500">{toRupiah(data?.total_nominal ?? "0")}</h3>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-500">Return :</h4>
              <h4 className="font-medium text-blue-500">
                {data?.persentase ? toPercentage(data.persentase) : "0.00"}
              </h4>
            </div>
          </div>
        </div>
        <div>
          <Button className="w-full items-center">Detail</Button>
        </div>
      </Link>
    );
  },
);

ProjectUseTokenCard.displayName = "ProjectUseTokenCard";

export default ProjectUseTokenCard;
