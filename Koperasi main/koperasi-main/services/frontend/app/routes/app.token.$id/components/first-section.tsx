import { Paperclip } from "lucide-react";
import type { DokumenResponse } from "~/types/constants/dokumen";
import { formatImagePath } from "~/utils/prefix-file-path";

interface FirstSectionProps {
  deskripsi: string;
  dokumenProyeksi: string;
  brosur: string;
  report_progress: string;
  dokumenTambahan?: DokumenResponse[];
  bagian_pelaksana: string;
  bagian_koperasi: string;
  bagian_pemilik: string;
  bagian_pendana: string;
}

export default function FirstSection({
  deskripsi,
  dokumenProyeksi,
  brosur,
  report_progress,
  dokumenTambahan,
  bagian_pelaksana,
  bagian_koperasi,
  bagian_pemilik,
  bagian_pendana,
}: FirstSectionProps) {
  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 transition-all xl:order-1">
      <div className="space-y-2">
        <h4 className="font-semibold text-lg">Deskripsi Proyek</h4>
        <p className="text-pretty text-justify leading-relaxed">{deskripsi}</p>
      </div>
      <div className="space-y-2">
        <h4 className="font-semibold text-lg">Pembagian Keuntungan</h4>
        <ul className="ms-4 list-disc">
          <li>
            Pencipta Proyek akan menerima {bagian_pemilik ? bagian_pemilik : "-"}% dari hasil
            keseluruhan. Bagian ini diperuntukkan bagi mereka yang bertanggung jawab dalam
            pengembangan dan implementasi proyek.
          </li>
          <li>
            Manajemen berhak atas {bagian_pelaksana ? bagian_pelaksana : "-"}% dari hasil. Ini
            mencakup tim manajemen yang mengelola operasi dan memastikan keberlangsungan proyek.
          </li>
          <li>
            Koperasi akan mendapatkan {bagian_koperasi ? bagian_koperasi : "-"}% dari hasil. Bagian
            ini akan didistribusikan kepada anggota koperasi, baik yang berstatus anggota biasa
            maupun anggota platinum, dalam bentuk Sisa Hasil Usaha (SHU).
          </li>
          <li>
            Investor akan memperoleh {bagian_pendana ? bagian_pendana : "-"}% dari hasil sebagai
            imbalan atas kontribusi modal mereka dalam proyek.
          </li>
        </ul>
      </div>
      <div className="text-pretty font-semibold text-lg">
        <span>Laporan Laba Rugi Diupdate Setiap: </span>
        <span className="text-primary">{report_progress ? report_progress : "-"} Bulan</span>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Lampiran Proyek</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip />
            <span className="text-gray-500">Dokumen Proyeksi</span>
          </div>
          <a
            href={formatImagePath(dokumenProyeksi)}
            target="_blank"
            rel="noreferrer"
            className="text-primary"
          >
            Lihat Dokumen
          </a>
        </div>
        <div className="flex items-center justify-between">
          {brosur && (
            <>
              <div className="flex items-center gap-2">
                <Paperclip />
                <span className="text-gray-500">Brosur Proyek</span>
              </div>
              <a
                href={formatImagePath(brosur)}
                target="_blank"
                rel="noreferrer"
                className="text-primary"
              >
                Lihat Brosur
              </a>
            </>
          )}
        </div>
        {dokumenTambahan?.map((dokumen, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip />
              <span className="max-w-sm text-gray-500">Dokumen Tambahan - {index + 1}</span>
            </div>
            <a
              href={formatImagePath(dokumen.dokumen)}
              target="_blank"
              rel="noreferrer"
              className="text-primary"
            >
              Lihat Dokumen
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
