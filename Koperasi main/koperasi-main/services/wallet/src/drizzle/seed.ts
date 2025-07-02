import { db, connection } from "./db.js";
import {
  TopupTable,
  WalletTable,
} from "./schema.js";
import { topupData } from "./seeder/topup.js";
import { walletData} from "./seeder/wallet.js";
// Define a helper function for type-safe inserts
async function safeInsert<T extends { [key: string]: any }>(table: T, data: Partial<T["_"]["insert"]>[]) {
  if (data.length === 0) return;

  try {
    await db.insert(table as any).values(data as any);
  } catch (error) {
    console.error(`Error inserting into ${table.name}:`, error);
    console.error("Problematic data:", JSON.stringify(data, null, 2));
    throw error;
  }
}

async function seed() {
  try {
    console.log("Menghapus semua data...");
    await db.delete(TopupTable);
    await db.delete(WalletTable);

    console.log("semua data berhasil dihapus 🗑️  🗑️  🗑️");

    console.log("Memulai seeding...");
    const walletSeedData = await walletData();
    await safeInsert(WalletTable, walletSeedData);

    const topupSeedData = await topupData();
    await safeInsert(TopupTable, topupSeedData);

    console.log("Seeding berhasil 🥳🥳🥳");
  } catch (error) {
    console.error("Seeding gagal:", error);
  } finally {
    await connection.end();
  }
}

seed();