import { eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import {
  ProjectTable,
} from "../drizzle/schema.js";
import { getContract } from "../main.js";

export async function getHistoryTokenByUserIdAndProjectId(
  id_user: string,
  id_projek: string
) {
  const contract = await getContract();

  const project = await db
    .select({
      nominal_disetujui: ProjectTable.nominal_disetujui,
    })
    .from(ProjectTable)
    .where(eq(ProjectTable.id, id_projek))
    .execute();

  if (project.length === 0 || !project[0].nominal_disetujui) {
    const error = new Error("Project not found or nominal not approved");
    (error as any).statusCode = 404;
    throw error;
  }

  const nominalDisetujui = project[0].nominal_disetujui;

  const chartTokens = await contract.getChartTokensByUserIdAndProjectId(
    id_user,
    id_projek
  );

  if (chartTokens.length === 0) {
    const error = new Error("Chart Tokens not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const results = [];

  for (const chartToken of chartTokens) {
    const historyToken = await contract.getHistoryTokenByChartTokenId(chartToken.chartTokenId);

    if (!historyToken) {
      throw new Error(`No history token found for chartTokenId: ${chartToken.chartTokenId}`);
    }

    const persentase = ((Number(chartToken.nominal) / nominalDisetujui) * 100).toFixed(2);

    results.push({
      nilai: Number(historyToken.totalNilai), 
      perubahan: Number(chartToken.nominal),   
      persentase,                   
      totalNominalToken: Number(await contract.getTotalNominalToken(id_user, id_projek)), 
      created_at: new Date(Number(historyToken.createdAt) * 1000), 
    });

    // console.log(results);
  }

  return results;
}
