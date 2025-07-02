import { WalletTable } from "../drizzle/schema.js";
import { db } from "../drizzle/db.js";
import { and, eq } from "drizzle-orm";
import axios from "axios";
import { walletServiceUrl } from "../main.js";

export async function getWalletById(id: string) {
  const wallet = await db.select().from(WalletTable).where(eq(WalletTable.id, id)).limit(1).execute();
  if (!wallet[0]) {
    const error = new Error("Wallet not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function getWalletPokokByUserId(id_user: string) {
  const wallet = await db
    .select()
    .from(WalletTable)
    .where(and(eq(WalletTable.id_user, id_user), eq(WalletTable.jenis_wallet, "SIMPANAN POKOK")))
    .execute();
  if (!wallet[0]) {
    const error = new Error("Wallet not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function getWalletWajibByUserId(id_user: string) {
  const wallet = await db
    .select()
    .from(WalletTable)
    .where(and(eq(WalletTable.id_user, id_user), eq(WalletTable.jenis_wallet, "SIMPANAN WAJIB")))
    .limit(1)
    .execute();
  if (!wallet[0]) {
    const error = new Error("Wallet wajib not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return wallet[0];
}

export async function getWalletSaldoByUserId(id_user: string) {
  try {
    const response = await axios.get(`${walletServiceUrl}/wallet/user/${id_user}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch wallet saldo");
  }
}

export async function createWallet(wallet: any) {
  const newWallet = await db.insert(WalletTable).values(wallet).returning({ id: WalletTable.id }).execute();
  return newWallet[0];
}

export async function updateWalletById(wallet: any, id: string) {
  try {
    const response = await axios.put(`${walletServiceUrl}/wallet/${id}`, wallet, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200 || response.status === 204) {
      console.log(`Wallet updated successfully for ID: ${id}`);
    } else {
      console.error(`Failed to update wallet: ${response.statusText}`);
      throw new Error(`Failed to update wallet: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error updating wallet via wallet service:", error);
    throw error;
  }
}


export async function deleteWalletById(id: string) {
  await getWalletById(id);
  await db.delete(WalletTable).where(eq(WalletTable.id, id)).execute();
}
