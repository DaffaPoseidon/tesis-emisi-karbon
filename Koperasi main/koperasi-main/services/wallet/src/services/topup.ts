import { TopupTable, WalletTable } from "../drizzle/schema.js";
import { db } from "../drizzle/db.js";
import { and, desc, eq } from "drizzle-orm";
import { getWalletById, getWalletSaldoByUserId, updateWalletById } from "./wallet.js";

export async function getAllTopUp() {
  const topUp = await db.select().from(TopupTable).innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id)).orderBy(desc(TopupTable.created_at)).execute();
  if (!topUp || topUp.length === 0) {
    const error = new Error("No topups found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topUp;
}

export async function getTopupById(id: string) {
  const topup = await db.select().from(TopupTable).innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id)).where(eq(TopupTable.id, id)).orderBy(desc(TopupTable.created_at)).execute();
  if (!topup || topup.length === 0) {
    const error = new Error("Topup not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topup;
}

export async function createTopUp(topup: any) {
  console.log(topup);
  const newTopUp = await db
    .insert(TopupTable)
    .values({ jenis: "TOPUP SALDO", status: "MENUNGGU KONFIRMASI", ...topup })
    .returning({ id: TopupTable.id })
    .execute();
  return newTopUp[0];
}

// export async function updateTopUpById(topup: any, id: string) {
//   const existingTopUp = await getTopupById(id);
//   const updatedData = {
//     ...topup,
//     nominal: topup.nominal ? topup.nominal : existingTopUp.nominal,
//     jenis: topup.jenis ? topup.jenis : existingTopUp.jenis,
//   };
//   await db.update(TopupTable).set(updatedData).where(eq(TopupTable.id, id)).execute();
// }

export async function deleteTopUpById(id: string) {
  await getTopupById(id);
  await db.delete(TopupTable).where(eq(TopupTable.id, id)).execute();
}

export async function getWithdrawSaldo() {
  const topUp = await db.select().from(TopupTable).where(eq(TopupTable.jenis, "PENARIKAN SALDO")).orderBy(desc(TopupTable.created_at)).execute();
  if (!topUp || topUp.length === 0) {
    const error = new Error("No withdraw saldo found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topUp;
}

export async function accTopUp(id: string) {
  const data = await getTopupById(id);
  if (data[0].topup.status === "MENUNGGU KONFIRMASI") {
    await db.update(TopupTable).set({ status: "SUKSES" }).where(eq(TopupTable.id, id)).execute();
    const wallet = await getWalletById(data[0].topup.id_wallet);
    await updateWalletById({ saldo: wallet.saldo + data[0].topup.nominal }, data[0].topup.id_wallet);
  } else {
    const error = new Error("Topup already approved");
    (error as any).statusCode = 400;
    throw error;
  }
}

export async function rejectTopUp(id: string) {
  const data = await getTopupById(id);
  if (data[0].topup.status === "MENUNGGU KONFIRMASI") {
    await db.update(TopupTable).set({ status: "GAGAL" }).where(eq(TopupTable.id, id)).execute();
  } else {
    const error = new Error("Topup already rejected");
    (error as any).statusCode = 400;
    throw error;
  }
}

export async function withdrawSaldo(topup: any): Promise<{ message: string }> {
  const wallet = await getWalletSaldoByUserId(topup.id_user);
  console.log(topup);

  await db
    .insert(TopupTable)
    .values({
      id_wallet: wallet.id,
      nama: topup.nama,
      jenis: "PENARIKAN SALDO",
      status: "MENUNGGU KONFIRMASI",
      nominal: topup.nominal,
      ...topup,
    })
    .execute();

  return {
    message: "Withdraw has been created, awaiting payment confirmation",
  };
}

export async function accWithdrawSaldo(id: string, body: any) {
  const data = await getTopupById(id);
  if (data[0].topup.status === "MENUNGGU KONFIRMASI") {
    await db
      .update(TopupTable)
      .set({ status: "SUKSES", updated_at: new Date(), ...body })
      .where(eq(TopupTable.id, id))
      .execute();
    const wallet = await getWalletById(data[0].topup.id_wallet);
    await db
      .update(WalletTable)
      .set({ saldo: wallet.saldo - data[0].topup.nominal })
      .where(eq(WalletTable.id, data[0].topup.id_wallet))
      .execute();
  } else {
    const error = new Error("Topup already approved");
    (error as any).statusCode = 400;
    throw error;
  }
}

export async function getTopupByUserId(id: string) {
  const topups = await db
    .select()
    .from(TopupTable)
    .innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id))
    .where(eq(WalletTable.id_user, id as string))
    .orderBy(desc(TopupTable.created_at))
    .execute();
  if (!topups || topups.length === 0) {
    const error = new Error("No topups found for this user");
    (error as any).statusCode = 404;
    throw error;
  }
  return topups;
}
