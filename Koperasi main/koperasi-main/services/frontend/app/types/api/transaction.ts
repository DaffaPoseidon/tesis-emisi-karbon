import type { Anggota } from "./anggota";

export type TransactionResponse = {
  transaction: {
    id: string;
    id_user: string;
    nama_user: string;
    id_projek: string;
    judul_projek: string;
    owner_projek: string;
    jumlah_token: number;
    total_nominal: number;
    created_at: string;
  };
  user: Anggota;
};
