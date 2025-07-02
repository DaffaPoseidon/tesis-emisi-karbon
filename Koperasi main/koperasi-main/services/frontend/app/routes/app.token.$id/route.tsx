import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { User2 } from "lucide-react";
import { useState } from "react";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import { httpClient } from "~/lib/http";
import type { Proyek, TokenResponse } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";
import { StatusProject } from "~/types/constants/status-project";
import toRupiah from "~/utils/to-rupiah";
import FirstSection from "./components/first-section";
import SecondSection from "./components/second-section";
import ThirdSection from "./components/third-section";

type LoaderData = {
  data: Proyek;
  investors: TokenResponse[];
};

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Error("Project ID is required");
  }

  try {
    const projectResponse = await httpClient.get<BaseResponse<Proyek>>(`/project/${params.id}`);

    let investors: TokenResponse[] = [];
    try {
      const investorsResponse = await httpClient.get<BaseResponse<TokenResponse[]>>(
        `/project/${params.id}/user`,
      );
      investors = investorsResponse.data.data || [];
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      if (error.response?.status === 404) {
        investors = [];
      } else {
        throw error;
      }
    }

    if (!projectResponse.data?.data) {
      throw new Error("Project data not found");
    }

    return {
      data: projectResponse.data.data,
      investors: investors,
    } as LoaderData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

const getTotalTokens = (investors: TokenResponse[]) => {
  return investors.reduce((total, investor) => total + Number(investor.jumlah_token), 0);
};

export default function DetailPengajuanProyekPage() {
  const { data, investors } = useLoaderData<typeof loader>();
  const [phase, setPhase] = useState(1);

  function handleChangePhase(newPhase?: number) {
    if (newPhase) {
      setPhase(newPhase);
    } else {
      setPhase((prev) => {
        if (prev >= 3) return 1;
        return prev + 1;
      });
    }
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BackButton to="/app/" />
          <h2 className="~text-base/2xl font-bold tracking-tight">Detail Proyek Yang Didanai</h2>
        </div>
        <div className="flex">
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={() => handleChangePhase(1)}
          >
            <span
              className={`px-5 font-medium ${
                phase === 1 ? "text-primary" : "text-gray-600 group-hover:text-primary"
              }`}
            >
              Informasi Proyek
            </span>
            <Separator className={`${phase === 1 ? "h-[2px] bg-primary" : "hidden"}`} />
          </button>
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={() => handleChangePhase(2)}
          >
            <span
              className={`px-5 font-medium ${
                phase === 2 ? "text-primary" : "text-gray-600 group-hover:text-primary"
              }`}
            >
              Penanam Modal
            </span>
            <Separator className={`${phase === 2 ? "h-[2px] bg-primary" : "hidden"}`} />
          </button>
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={() => handleChangePhase(3)}
          >
            <span
              className={`px-5 font-medium ${
                phase === 3 ? "text-primary" : "text-gray-600 group-hover:text-primary"
              }`}
            >
              History
            </span>
            <Separator className={`${phase === 3 ? "h-[2px] bg-primary" : "hidden"}`} />
          </button>
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="h-fit w-full flex-1">
            {phase === 1 ? (
              <FirstSection
                report_progress={data.report_progress || ""}
                brosur={data.brosur_produk?.toString() || ""}
                deskripsi={data.deskripsi}
                dokumenProyeksi={data.dokumen_proyeksi?.toString() || ""}
                dokumenTambahan={data.dokumenTambahan || []}
                bagian_pelaksana={data.bagian_pelaksana || ""}
                bagian_koperasi={data.bagian_koperasi || ""}
                bagian_pemilik={data.bagian_pemilik || ""}
                bagian_pendana={data.bagian_pendana || ""}
              />
            ) : phase === 2 ? (
              <SecondSection investors={investors} />
            ) : (
              <ThirdSection />
            )}
          </div>
          <section className="order-1 w-96 space-y-3 xl:order-2">
            <div className="space-y-6 rounded-md bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-full bg-gray-200 p-2">
                  <User2 size={24} className="text-primary" />
                </div>
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
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-lg">{data.judul}</h4>
                <h4 className="font-semibold text-gray-500 uppercase">{data.user?.nama}</h4>
              </div>
              <div className="space-y-2">
                <Progress
                  value={(getTotalTokens(investors) / Number(data?.jumlah_koin || 0)) * 100}
                />
                <div className="flex flex-wrap items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-500">Terkumpul</h3>
                    <h4 className="font-medium text-lg">{getTotalTokens(investors)}</h4>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-500">Sisa Hari</h3>
                    <h4 className="font-medium text-lg">10</h4>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-gray-500">Modal Kerja</span>
                    <span className="w-fit">{toRupiah(data.nominal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-gray-500">Aset Jaminan</span>
                    <span className="w-fit">{data.asset_jaminan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-gray-500">Nominal Jaminan</span>
                    <span className="w-fit">{toRupiah(data.nilai_jaminan)}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Model dan Rencana Bisnis</h4>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-gray-500">
                      Pendapatan/{data.report_progress} bulan
                    </span>
                    <span className="w-fit">{toRupiah(data.pendapatan_perbulan)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex-1 text-gray-500">
                      Pengeluaran/{data.report_progress} bulan
                    </span>
                    <span className="w-fit">{toRupiah(data.pengeluaran_perbulan)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 rounded-md bg-white p-6">
              <h4 className="font-semibold text-lg">Kontak Pemilik Proyek</h4>
              <div className="flex items-center justify-between">
                <span className="flex-1 text-gray-500">No.Whatsapp</span>
                <span className="w-fit text-primary">{data.user?.no_hp}</span>
              </div>
            </div>
            <div className="space-y-4 rounded-md bg-white p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="rounded-md bg-primary/15 p-2">
                  <img alt="vector-1" className="h-14" src="/img/vector/laba-rugi.svg" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Laba Rugi Persiklus</h4>
                  <span className="font-semibold text-primary">
                    <Link to={`/app/riwayat-laporan/${data.id}`}>Riwayat Laporan</Link>
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-md bg-white p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="rounded-md bg-primary/15 p-2">
                  <img alt="vector-1" className="h-14" src="/img/vector/mutasi.svg" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Rekap Laba Rugi</h4>
                  <span className="font-semibold text-primary">
                    <Link to={`/app/riwayat-mutasi/${data.id}`}>Riwayat Laporan</Link>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
