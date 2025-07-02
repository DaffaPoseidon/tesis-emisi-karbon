import { asc, eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { HistoryProjectTable } from "../drizzle/schema.js";

export async function getHistoryProjectByProjectId(id: string) {
    const historyProject = await db.select().from(HistoryProjectTable).where(eq(HistoryProjectTable.id_projek, id)).orderBy(asc(HistoryProjectTable.created_at)).execute();

    if (historyProject.length === 0) {
        const error = new Error("History Project not found");
        (error as any).statusCode = 404;
        throw error;
    }

    return historyProject;
}