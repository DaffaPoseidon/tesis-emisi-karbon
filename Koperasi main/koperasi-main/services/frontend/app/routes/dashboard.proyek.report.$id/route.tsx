import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { User2 } from "lucide-react";
import { useState } from "react";
import BackButton from "~/components/back-button";
import PageContainer from "~/components/page-container";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { httpClient } from "~/lib/http";
import type { Proyek, TokenResponse } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";
import { StatusProject } from "~/types/constants/status-project";
import toRupiah from "~/utils/to-rupiah";
import FirstSection from "./components/first-section";
import LaporanModal from "./components/modal/laba-rugi/laporan";
import MutasiModal from "./components/modal/mutasi/mutasi";
import SecondSection from "./components/second-section";

type LoaderData = {
  data: Proyek;
  investors: TokenResponse[];
};

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const [projectResponse, investorsResponse] = await Promise.all([
      httpClient.get<BaseResponse<Proyek>>(`/project/${params.id}`),
      httpClient.get<BaseResponse<TokenResponse[]>>(`/project/${params.id}/user`),
    ]);

    return {
      data: projectResponse.data.data || {},
      investors: investorsResponse.data.data || [],
    } as LoaderData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      data: {} as Proyek,
      investors: [],
    };
  }
}

export default function DetailPengajuanProyekPage() {
  const { data, investors } = useLoaderData<typeof loader>();
  const [phase, setPhase] = useState(1);

  function handleChangePhase() {
    setPhase((prev) => (prev === 1 ? 2 : 1));
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard/proyek/report" />
          <h2 className="~text-base/2xl font-bold tracking-tight">Detail Proyek</h2>
        </div>
        <div className="flex">
          <button
            type="button"
            className="group flex cursor-pointer flex-col gap-2"
            onClick={handleChangePhase}
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
            onClick={handleChangePhase}
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
        </div>
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="h-fit w-full flex-1">
            {phase === 1 ? (
              <FirstSection
                report_progress={data.report_progress || ""}
                brosur={data.brosur_produk?.toString() || ""}
                deskripsi={data.deskripsi}
                dokumenProyeksi={data.dokumen_proyeksi?.toString() || ""}
                bagian_pelaksana={data.bagian_pelaksana || ""}
                bagian_koperasi={data.bagian_koperasi || ""}
                bagian_pemilik={data.bagian_pemilik || ""}
                bagian_pendana={data.bagian_pendana || ""}
              />
            ) : (
              <SecondSection investors={investors} />
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
                    <Link to={`/dashboard/riwayat-laporan/${data.id}`}>Riwayat Laporan</Link>
                  </span>
                </div>
              </div>
              <LaporanModal data={JSON.parse(JSON.stringify(data))} />
            </div>
            <div className="space-y-4 rounded-md bg-white p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="rounded-md bg-primary/15 p-2">
                  <img alt="vector-1" className="h-14" src="/img/vector/mutasi.svg" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Rekap Laba Rugi</h4>
                  <span className="font-semibold text-primary">
                    <Link to={`/dashboard/riwayat-mutasi/${data.id}`}>Riwayat Laporan</Link>
                  </span>
                </div>
              </div>
              <MutasiModal id={data.id ?? ""} />
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
