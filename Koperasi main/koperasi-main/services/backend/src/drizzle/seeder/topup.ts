import { faker } from "@faker-js/faker/locale/id_ID";
import { db } from "../db.js"; // Sesuaikan dengan path instance database Anda
import { UserTable, WalletTable } from "../schema.js"; // Sesuaikan dengan path schema yang digunakan
import { eq, inArray } from "drizzle-orm"; // Pastikan `inArray` di-import

// Fungsi untuk mengambil nama pengguna berdasarkan wallet ID
type UserWalletRecord = {
  walletId: string;
  nama: string | null;
};

const getUserNamesByWallets = async (walletIds: string[]): Promise<Map<string, string>> => {
  // Query untuk mengambil data wallet dan nama pengguna terkait
  const userWalletRecords = await db
    .select({
      walletId: WalletTable.id,
      nama: UserTable.nama,
    })
    .from(WalletTable)
    .leftJoin(UserTable, eq(UserTable.id, WalletTable.id_user))
    .where(inArray(WalletTable.id, walletIds)) as UserWalletRecord[];

  // Mapping hasil query ke dalam Map dengan key wallet ID dan value nama pengguna
  const walletUserMap = new Map<string, string>();
  userWalletRecords.forEach((record) => {
    walletUserMap.set(record.walletId, record.nama || 'Unknown User');
  });

  return walletUserMap;
};

// Fungsi untuk membuat data top-up dengan nama pengguna yang diambil berdasarkan wallet ID
export const topupData = async (walletIds: string[]) => {
  const walletUserMap = await getUserNamesByWallets(walletIds);

  return [
    {
      id: faker.string.uuid(),
      id_wallet: walletIds[2],
      nama: walletUserMap.get(walletIds[2]) || "Unknown User",
      nama_bank: "BRI",
      no_rekening: "1234567890",
      nama_pemilik_rekening: walletUserMap.get(walletIds[2]) || "Unknown User",
      nominal: 50000,
      jenis: "SIMPANAN POKOK",
      status: "SUKSES",
      bukti_pembayaran: "https://example.com/bukti-pembayaran.jpg",
      created_at: new Date(),
    },
    {
      id: faker.string.uuid(),
      id_wallet: walletIds[3],
      nama: walletUserMap.get(walletIds[3]) || "Unknown User",
      nama_bank: "BCA",
      no_rekening: "0987654321",
      nama_pemilik_rekening: walletUserMap.get(walletIds[3]) || "Unknown User",
      nominal: 120000,
      jenis: "SIMPANAN WAJIB",
      status: "SUKSES",
      bukti_pembayaran: "https://example.com/bukti-pembayaran.jpg",
      created_at: new Date(),
    },
  ];
};

// Fungsi factory untuk menghasilkan beberapa data top-up dengan nama pengguna berdasarkan wallet ID
export const topupDataFactory = async (walletIds: string[], count: number) => {
  const walletUserMap = await getUserNamesByWallets(walletIds);

  const promises = Array.from({ length: count }).map(async () => {
    const selectedWalletId = faker.helpers.arrayElement(walletIds);
    const jenis = faker.helpers.arrayElement(["SIMPANAN WAJIB", "SIMPANAN POKOK", "TOPUP SALDO"]);

    // Menentukan nominal berdasarkan jenis simpanan
    let nominal;
    if (jenis === "SIMPANAN WAJIB") {
      nominal = 50000;
    } else if (jenis === "SIMPANAN POKOK") {
      nominal = 120000;
    } else {
      // Jika jenis adalah "TOPUP SALDO", gunakan nominal acak
      nominal = parseInt(faker.string.numeric({ length: 6 }));
    }

    return {
      id: faker.string.uuid(),
      id_wallet: selectedWalletId,
      nama: walletUserMap.get(selectedWalletId) || "Unknown User",
      nama_bank: "MANDIRI",
      no_rekening: faker.finance.accountNumber(),
      nama_pemilik_rekening: walletUserMap.get(selectedWalletId) || "Unknown User",
      nominal,
      jenis,
      status: faker.helpers.arrayElement(["SUKSES", "GAGAL", "MENUNGGU KONFIRMASI"]),
      bukti_pembayaran: faker.image.avatar(),
      created_at: new Date(),
    };
  });

  return Promise.all(promises);
};
