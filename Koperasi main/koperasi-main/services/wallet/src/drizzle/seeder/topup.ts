import { faker } from "@faker-js/faker/locale/id_ID";

export const topupData = async () => [
  {
    id: faker.string.uuid(),
    id_wallet: "d11bc330-b9b4-4074-b832-abc9580201fb",
    nama: "Budiono Siregar",
    nama_bank: "BRI",
    no_rekening: "1234567890",
    nama_pemilik_rekening: "Budiono Siregar",
    nominal: 5000000,
    jenis: "TOPUP SALDO",
    status: "SUKSES",
    bukti_pembayaran: "https://example.com/bukti-pembayaran.jpg",
    created_at: new Date(),
  },
  {
    id: faker.string.uuid(),
    id_wallet: "e7786150-64dc-44d8-a918-864bc54e72a5",
    nama: "Siti Nurhaliza",
    nama_bank: "BCA",
    no_rekening: "0987654321",
    nama_pemilik_rekening: "Siti Nurhaliza",
    nominal: 1200000,
    jenis: "TOPUP SALDO",
    status: "SUKSES",
    bukti_pembayaran: "https://example.com/bukti-pembayaran.jpg",
    created_at: new Date(),
  },
];
