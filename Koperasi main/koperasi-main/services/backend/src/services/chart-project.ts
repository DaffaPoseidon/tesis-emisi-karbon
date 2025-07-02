import { eq, sql, sum } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { ChartProjectTable, ProjectTable, UserTable } from "../drizzle/schema.js";

export async function getChartProjectById(id: string) {
  let query = db
    .select({chart: ChartProjectTable, project: ProjectTable})
    .from(ChartProjectTable)
    .innerJoin(ProjectTable, eq(ChartProjectTable.id_projek, ProjectTable.id))
    .where(eq(ChartProjectTable.id_projek, id));
  
  const chartProject = await query.execute();

  const groupedChartProject = chartProject.reduce((acc, curr) => {
    const chartId = curr.chart.id;

    if (!acc[chartId]) {
      acc[chartId] = {
        ...curr.chart,
        project: curr.project,
      };
    }

    return acc;
  }, {} as { [key: string]: any });

  return Object.values(groupedChartProject);
}

export async function getAllChartProjectByUserId(id: string) {
  const chartProject = await db
    .select({
      month: sql`extract(month from ${ChartProjectTable.created_at})`.as("month"),
      year: sql`extract(year from ${ChartProjectTable.created_at})`.as("year"),
      sum_nominal: sum(ChartProjectTable.nominal).as("sum_nominal"),
    })
    .from(ChartProjectTable)
    .innerJoin(ProjectTable, eq(ChartProjectTable.id_projek, ProjectTable.id))
    .innerJoin(UserTable, eq(ProjectTable.id_user, UserTable.id))
    .where(eq(UserTable.id, id))
    .groupBy(sql`extract(year from ${ChartProjectTable.created_at})`, sql`extract(month from ${ChartProjectTable.created_at})`)
    .execute();

  return chartProject;
}
