import { desc, eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { HistoryProjectWalletTable, ProjectWalletTable } from "../drizzle/schema.js";

export async function getHistoryProjectWalletByProjectWalletId(id: string) {
    const historyProjectWallet = await db.select().from(HistoryProjectWalletTable).where(eq(HistoryProjectWalletTable.id_project_wallet, id)).orderBy(desc(HistoryProjectWalletTable.created_at)).execute();

    if (historyProjectWallet.length === 0) {
        const error = new Error("History Project Wallet not found");
        (error as any).statusCode = 404;
        throw error;
    }

    return historyProjectWallet;
}

export async function createHistoryProjectWallet(historyProjectWallet: any) {
    const projectWallet = await db.select().from(ProjectWalletTable).where(eq(ProjectWalletTable.id, historyProjectWallet.id_project_wallet)).execute();

    if (!projectWallet || projectWallet.length === 0) {
        const error = new Error("Project Wallet not found");
        (error as any).statusCode = 404;
        throw error;
    }

    if (!historyProjectWallet.nominal || historyProjectWallet.nominal <= 0) {
        const error = new Error("Invalid nominal value");
        (error as any).statusCode = 400; 
        throw error;
    }

    if (!historyProjectWallet.deskripsi || historyProjectWallet.deskripsi.trim() === "") {
        const error = new Error("Description is required");
        (error as any).statusCode = 400; 
        throw error;
    }

    await db.insert(HistoryProjectWalletTable).values({...historyProjectWallet}).execute();

    return { message: "History Project Wallet created successfully" };    
}
