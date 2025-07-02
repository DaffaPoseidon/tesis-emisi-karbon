import { WalletTable } from "../drizzle/schema.js";
import { db } from "../drizzle/db.js";
import { and, eq, sum } from "drizzle-orm";

export async function getWalletById(id: string) {
  const wallet = await db.select().from(WalletTable).where(eq(WalletTable.id, id)).limit(1).execute();
  if (!wallet[0]) {
    const error = new Error("Wallet not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function getWalletSaldoByUserId(id_user: string) {
  const wallet = await db
    .select()
    .from(WalletTable)
    .where(and(eq(WalletTable.id_user, id_user)))
    .limit(1)
    .execute();
  if (!wallet[0]) {
    const error = new Error("Wallet saldo not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function getTotalWalletSaldoByUserId(id_user: string) {
  const wallet = await db
    .select({ saldo: WalletTable.saldo })
    .from(WalletTable)
    .where(and(eq(WalletTable.id_user, id_user)))
    .execute();
  if (!wallet[0]) {
    const error = new Error("Wallet saldo not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function createWallet(wallet: any) {
  const newWallet = await db.insert(WalletTable).values(wallet).returning({ id: WalletTable.id }).execute();
  return newWallet[0];
}

export async function updateWalletById(wallet: any, id: string) {
  const existingWallet = await getWalletById(id);
  const updatedData = {
    ...wallet,
    saldo: wallet.saldo ? wallet.saldo : existingWallet.saldo,
  };
  await db.update(WalletTable).set(updatedData).where(eq(WalletTable.id, id)).execute();
}

export async function deleteWalletById(id: string) {
  await getWalletById(id);
  await db.delete(WalletTable).where(eq(WalletTable.id, id)).execute();
}
