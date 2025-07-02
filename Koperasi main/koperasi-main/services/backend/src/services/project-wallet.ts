import { desc, eq, like } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { ProjectTable, ProjectWalletTable, UserTable } from "../drizzle/schema.js";
import { createHistoryProjectWallet } from "./history-project-wallet.js";

export async function getAllProjectWallet(search?: string) {
  const query = db.select().from(ProjectWalletTable).innerJoin(ProjectTable, eq(ProjectWalletTable.id_projek, ProjectTable.id)).innerJoin(UserTable, eq(ProjectTable.id_user, UserTable.id)).orderBy(desc(ProjectWalletTable.created_at));

  if (search) {
    query.where(like(ProjectTable.judul, `%${search}%`));
  }

  const projectsWallet = await query.execute();

  if (!projectsWallet.length) {
    const error = new Error("No project wallet found");
    (error as any).statusCode = 404;
    throw error;
  }

  const groupedProjectWallets = projectsWallet.reduce((acc, curr) => {
    const projectWalletId = curr.project_wallet.id;

    if (!acc[projectWalletId]) {
      acc[projectWalletId] = {
        ...curr.project_wallet,
        project: curr.project,
        user: curr.user,
      };
    }

    return acc;
  }, {} as { [key: string]: any });

  return Object.values(groupedProjectWallets);
}

export async function getProjectWalletByProjectId(id_projek: string) {
  const wallet = await db.select().from(ProjectWalletTable).where(eq(ProjectWalletTable.id_projek, id_projek)).execute();

  if (wallet.length === 0) {
    const error = new Error("Project Wallet not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return wallet;
}

export async function transferSaldoProject(transfer: any) {
  try {
    const wallet = await getProjectWalletByProjectId(transfer.id_projek);
    if (!wallet || wallet.length === 0) {
      const error = new Error(`Wallet for project ID ${transfer.id_projek} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    if (wallet[0].saldo < transfer.nominal) {
      const error = new Error("Insufficient balance in project wallet");
      (error as any).statusCode = 400;
      throw error;
    }

    await db
      .update(ProjectWalletTable)
      .set({ saldo: wallet[0].saldo - transfer.nominal })
      .where(eq(ProjectWalletTable.id_projek, transfer.id_projek))
      .execute();

    await createHistoryProjectWallet({
      id_project_wallet: wallet[0].id,
      nominal: transfer.nominal,
      dana_tersisa: wallet[0].saldo - transfer.nominal,
      deskripsi: transfer.deskripsi,
      bukti_transfer: transfer.bukti_transfer,
    });

    return { message: "Balance transferred successfully" };
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error("An unexpected error occurred during balance transfer");
      (error as any).statusCode = 500;
    }
    throw error;
  }
}
