import { desc, eq, like, or, sql, sum } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { differenceInMonths } from "date-fns";
import {
  ChartProjectTable,
  ProjectMutationReportTable,
  ProjectTable,
} from "../drizzle/schema.js";
import { getProjectById } from "./project.js";
import { getContract } from "../main.js";

export async function createMutation(mutation: any) {
  try {
    const project = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.id, mutation.id_projek))
      .execute();

    if (project.length === 0) {
      const error = new Error("Project not found");
      (error as any).statusCode = 404;
      throw error;
    }

    if (!project[0].report_progress) {
      const error = new Error("Report Progress not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const chartProjectValue = mutation.pemasukan - mutation.pengeluaran;
    // const reportFrequency = parseInt(project[0].report_progress);

    // const lastMutation = await db
    //   .select()
    //   .from(ProjectMutationReportTable)
    //   .where(eq(ProjectMutationReportTable.id_projek, mutation.id_projek))
    //   .orderBy(desc(ProjectMutationReportTable.created_at))
    //   .limit(1)
    //   .execute();

    // const monthsSinceLastReport =
    //   lastMutation.length === 0
    //     ? differenceInMonths(new Date(), project[0].created_at)
    //     : differenceInMonths(new Date(), new Date(lastMutation[0].created_at));

    // if (monthsSinceLastReport < reportFrequency) {
    //   const error = new Error(
    //     `You can upload the next report after ${
    //       reportFrequency - monthsSinceLastReport
    //     } months.`
    //   );
    //   (error as any).statusCode = 400;
    //   throw error;
    // }

    await insertProjectMutationAndChart(mutation, chartProjectValue);

    return {
      message:
        // lastMutation.length === 0
          // ? "First report uploaded successfully."
          // : "Report uploaded successfully.",
        "Report uploaded successfully."
    };
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error(
        "An unexpected error occurred during mutation creation"
      );
      (error as any).statusCode = 500;
    }
    throw error;
  }
}

async function insertProjectMutationAndChart(
  mutation: any,
  chartProjectValue: number
) {
  try {
    const contract = await getContract();

    const tokens = await contract.getTokenByProjectId(mutation.id_projek);

    const mutationResult = await db
      .insert(ProjectMutationReportTable)
      .values(mutation)
      .execute();
    if (!mutationResult) {
      const error = new Error("Failed to insert project mutation report");
      (error as any).statusCode = 500;
      throw error;
    }

    const chartResult = await db
      .insert(ChartProjectTable)
      .values({ id_projek: mutation.id_projek, nominal: chartProjectValue })
      .execute();
    if (!chartResult) {
      const error = new Error("Failed to insert into chart project table");
      (error as any).statusCode = 500;
      throw error;
    }

    const totalKomulatif = await db
      .select({ value: sum(ChartProjectTable.nominal) })
      .from(ChartProjectTable)
      .where(eq(ChartProjectTable.id_projek, mutation.id_projek))
      .execute();

    if (totalKomulatif.length === 0) {
      const error = new Error("Failed to calculate total cumulative value");
      (error as any).statusCode = 500;
      throw error;
    }

    const modalProject = await db
      .select({ modal: ProjectTable.nominal_disetujui })
      .from(ProjectTable)
      .where(eq(ProjectTable.id, mutation.id_projek))
      .execute();

    if (modalProject.length === 0) {
      const error = new Error("Project modal not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const project = await getProjectById(mutation.id_projek);
    interface GroupedToken {
      id_user: string;
      totalNilai: number;
      totalNominal: number;
    }

    // const groupedTokens: Record<string, GroupedToken> = {};
    const dividenProfit = await contract.getDividenProfitByProjectId(mutation.id_projek);
    console.log("Dividen Profit:", dividenProfit);

    const groupedTokens = tokens.reduce(
      (acc: Record<string, GroupedToken>, token: any) => {
        console.log(token);
        const id_user = token.idUser;
        const nilai = parseFloat(token.nilai);

        if (!totalKomulatif[0].value) {
          const error = new Error("Failed to calculate total cumulative value");
          (error as any).statusCode = 500;
          throw error;
        }

        if (!modalProject[0].modal) {
          const error = new Error("Failed to calculate modal project value");
          (error as any).statusCode = 500;
          throw error;
        }

        if (!dividenProfit.pendana) {
          const error = new Error("Project not found");
          (error as any).statusCode = 404;
          throw error;
        }

        const totalNilai =
          (Number(totalKomulatif[0].value) / modalProject[0].modal) *
            nilai *
            (project.bagian_pendana / 100) +
          nilai;
        const totalNominal =
          (Number(totalKomulatif[0].value) / modalProject[0].modal) *
          nilai *
          (project.bagian_pendana / 100);

        if (acc[id_user]) {
          acc[id_user].totalNilai += Math.round(totalNilai);
          acc[id_user].totalNominal += Math.round(totalNominal);
        } else {
          acc[id_user] = {
            id_user: id_user,
            totalNilai: Math.round(totalNilai),
            totalNominal: Math.round(totalNominal),
          };
        }

        return acc;
      },
      {}
    );

    const groupedTokensArray: GroupedToken[] = Object.values(groupedTokens);

    if (!groupedTokens) {
      const error = new Error("No tokens found for the project");
      (error as any).statusCode = 404;
      throw error;
    }

    for (const group of groupedTokensArray) {
      console.log("Processing group:", group);
      try {
        console.log("Before addChartToken for user:", group.id_user);
        const chartTokenTx = await contract.addChartToken(
          group.id_user,
          mutation.id_projek,
          group.totalNominal,
          group.totalNilai
        );
        console.log("Transaction hash:", chartTokenTx.hash);
        const chartTokenReceipt = await chartTokenTx.wait();
        console.log("Transaction confirmed:", chartTokenReceipt);
      } catch (error) {
        console.error(
          "Error during contract transaction for user:",
          group.id_user,
          error
        );
      }
    }
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error("An unexpected error occurred during insertion");
      (error as any).statusCode = 500;
    }
    throw error;
  }
}

export async function getAllMutation(search?: string) {
  try {
    const query = db
      .select({
        mutation: ProjectMutationReportTable,
        project: ProjectTable,
      })
      .from(ProjectMutationReportTable)
      .innerJoin(
        ProjectTable,
        eq(ProjectTable.id, ProjectMutationReportTable.id_projek)
      )
      .orderBy(desc(ProjectMutationReportTable.created_at));

    if (search) {
      query.where(
        or(
          like(ProjectTable.judul, `%${search}%`),
          like(ProjectMutationReportTable.judul, `%${search}%`)
        )
      );
    }

    const mutationResult = await query.execute();
    console.log(mutationResult);

    if (!mutationResult || mutationResult.length === 0) {
      const error = new Error("No mutations found");
      (error as any).statusCode = 404;
      throw error;
    }

    const groupedMutations = mutationResult.reduce((acc, curr) => {
      const mutationId = curr.mutation.id;

      if (!acc[mutationId]) {
        acc[mutationId] = {
          ...curr.mutation,
          project: curr.project,
        };
      }

      return acc;
    }, {} as { [key: string]: any });
    return Object.values(groupedMutations);
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error(
        "An unexpected error occurred while fetching all mutations"
      );
      (error as any).statusCode = 500;
    }
    throw error;
  }
}

export async function getMutationById(id: string) {
  try {
    const mutation = await db
      .select()
      .from(ProjectMutationReportTable)
      .where(eq(ProjectMutationReportTable.id, id))
      .execute();

    if (!mutation || mutation.length === 0) {
      const error = new Error(`Mutation with ID ${id} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    return mutation;
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error(
        `An unexpected error occurred while fetching mutation with ID ${id}`
      );
      (error as any).statusCode = 500;
    }
    throw error;
  }
}

export async function getMutationByProjectId(id: string) {
  try {
    const project = await db
      .select()
      .from(ProjectTable)
      .where(eq(ProjectTable.id, id))
      .execute();

    if (!project || project.length === 0) {
      const error = new Error(`Project with ID ${id} not found`);
      (error as any).statusCode = 404;
      throw error;
    }

    const mutation = await db
      .select()
      .from(ProjectMutationReportTable)
      .where(eq(ProjectMutationReportTable.id_projek, id))
      .orderBy(desc(ProjectMutationReportTable.created_at))
      .execute();

    const lastMutation = await db
      .select()
      .from(ProjectMutationReportTable)
      .where(eq(ProjectMutationReportTable.id_projek, id))
      .orderBy(desc(ProjectMutationReportTable.created_at))
      .limit(1)
      .execute();

    if (lastMutation.length === 0) {
      const error = new Error("No reports yet, you can upload the first report.");
      (error as any).statusCode = 404;
      (error as any).canUploadReport = true;
      throw error;
    }
      

    const lastReportDate = new Date(lastMutation[0].created_at);
    if (!project[0].report_progress) {
      const error = new Error("Report Progress not found");
      (error as any).statusCode = 404;
      throw error;
    }
    const reportFrequency = parseInt(project[0].report_progress);

    const monthsSinceProjectCreated = differenceInMonths(
      new Date(),
      new Date(project[0].created_at)
    );
    const monthsSinceLastReport = differenceInMonths(
      new Date(),
      lastReportDate
    );

    if (
      monthsSinceProjectCreated < reportFrequency ||
      monthsSinceLastReport < reportFrequency
    ) {
      return {
        mutation,
        canUploadReport: false,
        message: `You can upload the next report after ${
          reportFrequency - monthsSinceLastReport
        } months.`,
      };
    }

    return {
      mutation,
      canUploadReport: true,
      message: "You can upload the report now.",
    };
  } catch (error: any) {
    if (!error.statusCode) {
      error = new Error(
        `An unexpected error occurred while fetching mutation for project with ID ${id}`
      );
      (error as any).statusCode = 500;
    }
    throw error;
  }
}
