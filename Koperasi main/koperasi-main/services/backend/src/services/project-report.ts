import { and, desc, eq, like, or, SQL } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { ProjectCategoryTable, ProjectReportTable, ProjectTable, SupportDocumentTable, UserTable } from "../drizzle/schema.js";
import { differenceInMonths } from "date-fns";

export async function createProjectReport(projectReport: any) {
  const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, projectReport.id_projek)).execute();

  if (project.length === 0) {
    throw new Error("Project not found");
  }

  // const lastProjectReport = await db.select().from(ProjectReportTable).where(eq(ProjectReportTable.id_projek, projectReport.id_projek)).orderBy(desc(ProjectReportTable.created_at)).limit(1).execute();

  // if (!project[0].report_progress) {
  //   const error = new Error("Report Progress not found");
  //   (error as any).statusCode = 404;
  //   throw error;
  // }
  // const reportFrequency = parseInt(project[0].report_progress);

  // if (lastProjectReport.length === 0) {
  //   const monthsSinceProjectCreated = differenceInMonths(new Date(), project[0].created_at);
  //   if (monthsSinceProjectCreated < reportFrequency) {
  //     throw new Error(`You can upload the report after ${reportFrequency - monthsSinceProjectCreated} months.`);
  //   }
  //   await db.insert(ProjectReportTable).values(projectReport).execute();
  //   return { canUploadReport: true, message: "First report uploaded successfully." };
  // }

  // if (!lastProjectReport[0].created_at) {
  //   const error = new Error("Last Project Report not found");
  //   (error as any).statusCode = 404;
  //   throw error;
  // }
  
  // const lastReportDate = new Date(lastProjectReport[0].created_at);

  // const monthsSinceLastReport = differenceInMonths(new Date(), lastReportDate);

  // if (monthsSinceLastReport < reportFrequency) {
  //   throw new Error(`You can upload the next report after ${reportFrequency - monthsSinceLastReport} months.`);
  // }

  await db.insert(ProjectReportTable).values(projectReport).execute();

  const status = [
    "BERJALAN",
    "BERJALAN SIKLUS 2",
    "BERJALAN SIKLUS 3",
    "BERJALAN SIKLUS 4",
    "BERJALAN SIKLUS 5",
    "BERJALAN SIKLUS 6",
    "BERJALAN SIKLUS 7",
    "BERJALAN SIKLUS 8",
    "BERJALAN SIKLUS 9",
    "BERJALAN SIKLUS 10",
    "BERJALAN SIKLUS 11",
    "BERJALAN SIKLUS 12",
    "BERJALAN SIKLUS 13",
    "BERJALAN SIKLUS 14",
    "BERJALAN SIKLUS 15",
    "BERJALAN SIKLUS 16",
    "BERJALAN SIKLUS 17",
    "BERJALAN SIKLUS 18",
    "BERJALAN SIKLUS 19",
    "BERJALAN SIKLUS 20"
  ];

  const currentStatusIndex = status.indexOf(project[0].status);
  
  if (currentStatusIndex !== -1 && currentStatusIndex < status.length - 1) {
    const nextStatus = status[currentStatusIndex + 1] as "BERJALAN" | "BERJALAN SIKLUS 2" | "BERJALAN SIKLUS 3" | "BERJALAN SIKLUS 4" | "BERJALAN SIKLUS 5" | "BERJALAN SIKLUS 6" | "BERJALAN SIKLUS 7" | "BERJALAN SIKLUS 8" | "BERJALAN SIKLUS 9" | "BERJALAN SIKLUS 10" | "BERJALAN SIKLUS 11" | "BERJALAN SIKLUS 12" | "BERJALAN SIKLUS 13" | "BERJALAN SIKLUS 14" | "BERJALAN SIKLUS 15" | "BERJALAN SIKLUS 16" | "BERJALAN SIKLUS 17" | "BERJALAN SIKLUS 18" | "BERJALAN SIKLUS 19" | "BERJALAN SIKLUS 20";
    await db.update(ProjectTable)
      .set({ status: nextStatus })
      .where(eq(ProjectTable.id, projectReport.id_projek))
      .execute();
  }

  return { canUploadReport: true, message: "Report uploaded successfully." };
}

export async function getAllProjectReport(
  search?: string
) {
  try {
    const query = db
      .select({
        user: UserTable, 
        project: ProjectTable,
        kategori: ProjectCategoryTable,
        supportDocument: SupportDocumentTable,
        projectReport: ProjectReportTable,
      })
      .from(ProjectReportTable)
      .innerJoin(ProjectTable, eq(ProjectTable.id, ProjectReportTable.id_projek))
      .innerJoin(UserTable, eq(UserTable.id, ProjectTable.id_user))
      .innerJoin(ProjectCategoryTable, eq(ProjectTable.id_kategori, ProjectCategoryTable.id))
      .innerJoin(SupportDocumentTable, eq(ProjectTable.id, SupportDocumentTable.id_projek))
      .orderBy(desc(ProjectReportTable.created_at));

    if (search) {
      query.where(
        or(
          like(UserTable.nama, `%${search}%`), 
          like(ProjectTable.judul, `%${search}%`),
          like(ProjectReportTable.judul, `%${search}%`)
        )
      );
    }

    const queryResult = await query.execute();

    const groupedProjectReports = queryResult.reduce((acc, curr) => {
      const reportId = curr.projectReport.id; 

      if (!acc[reportId]) {
        acc[reportId] = {
          ...curr.projectReport, 
          project: {
            ...curr.project,
            user: curr.user,
            kategori: curr.kategori, 
            dokumenTambahan: curr.supportDocument ? [curr.supportDocument] : [], 
          },
        };
      } else {
        if (curr.supportDocument) {
          acc[reportId].project.dokumenTambahan.push(curr.supportDocument);
        }
      }

      return acc;
    }, {} as { [key: string]: any });

    return Object.values(groupedProjectReports);
  } catch (error) {
    console.error("Error fetching project reports:", error);
    throw new Error("Could not retrieve project reports. Please try again later.");
  }
}

export async function getProjectReportById(id: string) {
  const projectReport = await db.select().from(ProjectReportTable).where(eq(ProjectReportTable.id, id)).execute();
  return projectReport;
}

export async function getProjectReportByProjectId(id: string, jenis?: any) {
  const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, id)).execute();

  if (project.length === 0) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Build the conditions array
  const conditions: SQL[] = [eq(ProjectReportTable.id_projek, id)];
  if (jenis) {
    conditions.push(eq(ProjectReportTable.jenis_laporan, jenis));
  }

  // Use the conditions in both queries
  const projectReport = await db
    .select()
    .from(ProjectReportTable)
    .where(and(...conditions))
    .orderBy(desc(ProjectReportTable.created_at))
    .execute();

  // const lastProjectReport = await db
  //   .select()
  //   .from(ProjectReportTable)
  //   .where(and(...conditions))
  //   .orderBy(desc(ProjectReportTable.created_at))
  //   .limit(1)
  //   .execute();

  // if (lastProjectReport.length === 0) {
  //   return { canUploadReport: true, message: "No reports yet, you can upload the first report." };
  // }

  // if (!lastProjectReport[0].created_at) {
  //   const error = new Error("Last Project Report not found");
  //   (error as any).statusCode = 404;
  //   throw error;
  // }
  // const lastReportDate = new Date(lastProjectReport[0].created_at);

  // if (!project[0].report_progress) {
  //   const error = new Error("Report Progress not found");
  //   (error as any).statusCode = 404;
  //   throw error;
  // }
  // const reportFrequency = parseInt(project[0].report_progress);

  // const monthsSinceProjectCreated = differenceInMonths(new Date(), new Date(project[0].created_at));
  // const monthsSinceLastReport = differenceInMonths(new Date(), lastReportDate);

  // if (monthsSinceProjectCreated < reportFrequency || monthsSinceLastReport < reportFrequency) {
  //   return { 
  //     projectReport, 
  //     canUploadReport: false, 
  //     message: `You can upload the next report after ${reportFrequency - monthsSinceLastReport} months.` 
  //   };
  // }

  return { projectReport, canUploadReport: true, message: "You can upload the report now." };
}