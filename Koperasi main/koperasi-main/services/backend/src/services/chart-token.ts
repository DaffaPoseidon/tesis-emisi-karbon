import { eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { ProjectTable } from "../drizzle/schema.js";
import { getContract } from "../main.js";

export async function getLastChartTokenByUserIdandProjectId(id_user: any, id_projek: any) {
  const contract = await getContract();

  const chartToken = await contract.getLatestChartTokenByUserIdAndProjectId(id_user, id_projek);

  if (!chartToken || !chartToken.nominal) {
    return null;
  }

  const serializedChartToken = {
    id: chartToken.chartTokenId,
    id_user: chartToken.idUser,
    id_projek: chartToken.idProjek,
    nominal: Number(chartToken.nominal),
  };

  console.log("Serialized ChartToken:", serializedChartToken);

  const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, id_projek)).execute();

  if (!project || !project[0].nominal_disetujui) {
    throw new Error("Project not found or nominal not approved");
  }

  const persentase = ((serializedChartToken.nominal / project[0].nominal_disetujui) * 100).toFixed(2);

  return { perubahan: serializedChartToken.nominal, persentase };
}

export async function getChartTokenByUserIdandProjectId(id_user: string, id_projek: string) {
  const contract = await getContract();

  const chartTokens = await contract.getChartTokensByUserIdAndProjectId(id_user, id_projek);
  console.log(chartTokens);

  if (!chartTokens || chartTokens.length === 0) {
    const error = new Error("Chart Token not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const serializedChartTokens = chartTokens.map((token: any) => ({
    id: token.chartTokenId,
    id_user: token.idUser,
    id_projek: token.idProjek,
    nominal: Number(token.nominal),
  }));

  return serializedChartTokens;
}

export async function getAllChartTokenByUserId(id_user: string) {
  const contract = await getContract();

  const chartTokens = await contract.getAllChartTokensByUserId(id_user);

  if (!chartTokens || chartTokens.length === 0) {
    const error = new Error("Chart Token not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const serializedChartTokens = chartTokens.map((token: any) => ({
    created_at: new Date(Number(token.createdAt) * 1000),
    nominal: Number(token.nominal),
    id_projek: token.idProjek,
    id_user: token.idUser,
  }));

  const chartProject = serializedChartTokens.reduce((acc: any[], token: any) => {
    const date = token.created_at;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const existingGroup = acc.find(
      (item) => item.month === month && item.year === year
    );

    if (existingGroup) {
      existingGroup.sum_nominal += token.nominal;
    } else {
      acc.push({
        month,
        year,
        sum_nominal: token.nominal,
      });
    }

    return acc;
  }, []);

  return chartProject;
}
