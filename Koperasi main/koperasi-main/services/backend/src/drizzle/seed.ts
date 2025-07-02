import { db, connection } from "./db.js";
import {
  ProjectCategoryTable,
  UserTable,
  ProjectTable,
  SupportDocumentTable,
  TopupTable,
  WalletTable,
  ProjectMutationReportTable,
  ChartProjectTable,
  HistoryProjectTable,
  ProjectReportTable,
  ProjectWalletTable,
  HistoryProjectWalletTable,
  SignatureAdminTable,
} from "./schema.js";
import { chartProjectData, chartProjectDataFactory } from "./seeder/chart-project.js";
import { historyProjectData, historyProjectDataFactory } from "./seeder/history-project.js";
import { HistoryProjectWalletData } from "./seeder/history-project-wallet.js";
import { projectCategoryData, projectData, projectDataFactory, supportDocumentData, supportDocumentDataFactory } from "./seeder/project.js";
import { projectMutationReportData, projectMutationReportDataFactory } from "./seeder/project-mutation.js";
import { projectReportData, projectReportDataFactory } from "./seeder/project-report.js";
import { ProjectWalletData } from "./seeder/project-wallet.js";
import { topupData, topupDataFactory } from "./seeder/topup.js";
import { userData, userDataFactory } from "./seeder/user.js";
import { walletData, walletDataFactory } from "./seeder/wallet.js";
import { SignatureAdminData } from "./seeder/signature-admin.js";

// Define a helper function for type-safe inserts
async function safeInsert<T extends { [key: string]: any }>(table: T, data: Partial<T["_"]["insert"]>[]) {
  if (data.length === 0) return;

  try {
    await db.insert(table as any).values(data as any);
  } catch (error) {
    console.error(`Error inserting into ${table.name}:`, error);
    console.error("Problematic data:", JSON.stringify(data, null, 2));
    throw error;
  }
}

async function seed() {
  try {
    console.log("Menghapus semua data...");
    await db.delete(HistoryProjectWalletTable);
    await db.delete(ProjectWalletTable);
    await db.delete(SupportDocumentTable);
    await db.delete(ChartProjectTable);
    await db.delete(ProjectReportTable);
    await db.delete(ProjectMutationReportTable);
    await db.delete(HistoryProjectTable);
    await db.delete(ProjectTable);
    await db.delete(TopupTable);
    await db.delete(WalletTable);
    await db.delete(SignatureAdminTable);
    await db.delete(UserTable);
    await db.delete(ProjectCategoryTable);

    console.log("semua data berhasil dihapus 🗑️  🗑️  🗑️");

    console.log("Memulai seeding...");

    const userSeedData = await userData();
    // const userSeedFactory = await userDataFactory(10);
    await safeInsert(UserTable, userSeedData);
    // await safeInsert(UserTable, userSeedFactory);

    const userRecords = await db.select().from(UserTable);
    const userIds = userRecords.map((row) => row.id);

    const projectCategorySeedData = await projectCategoryData();
    await safeInsert(ProjectCategoryTable, projectCategorySeedData);

    // const projectCategoryRecords = await db.select().from(ProjectCategoryTable);
    // const projectCategoryIds = projectCategoryRecords.map((row) => row.id);

    // const projectSeedData = await projectData(userIds, projectCategoryIds);
    // const projectSeedFactory = await projectDataFactory(userIds, projectCategoryIds, 10);
    // await safeInsert(ProjectTable, projectSeedData);
    // await safeInsert(ProjectTable, projectSeedFactory);

    // const projectRecords = await db.select().from(ProjectTable);
    // const projectIds = projectRecords.map((row) => row.id);

    // const supportDocumentSeedData = await supportDocumentData(projectIds);
    // const supportDocumentSeedFactory = await supportDocumentDataFactory(projectIds, 10);
    // await safeInsert(SupportDocumentTable, supportDocumentSeedData);
    // await safeInsert(SupportDocumentTable, supportDocumentSeedFactory);

    const walletSeedData = await walletData(userIds);
    // const walletSeedFactory = await walletDataFactory(userIds, 10, walletSeedData.usedUserIds);
    await safeInsert(WalletTable, walletSeedData.data);
    // await safeInsert(WalletTable, walletSeedFactory);

    const walletRecords = await db.select().from(WalletTable);
    const walletIds = walletRecords.map((row) => row.id);

    const topupSeedData = await topupData(walletIds);
    // const topupSeedFactory = await topupDataFactory(walletIds, 10);
    await safeInsert(TopupTable, topupSeedData);
    // await safeInsert(TopupTable, topupSeedFactory);

    // const projectReportSeedData = await projectReportData(projectIds);
    // const projectReportSeedFactory = await projectReportDataFactory(projectIds, 10);
    // await safeInsert(ProjectReportTable, projectReportSeedData);
    // await safeInsert(ProjectReportTable, projectReportSeedFactory);

    // const projectMutationReportSeedData = await projectMutationReportData(projectIds);
    // const projectMutationReportSeedFactory = await projectMutationReportDataFactory(projectIds, 10);
    // await safeInsert(ProjectMutationReportTable, projectMutationReportSeedData);
    // await safeInsert(ProjectMutationReportTable, projectMutationReportSeedFactory);

    // const chartProjectSeedData = await chartProjectData(projectIds);
    // const chartProjectSeedFactory = await chartProjectDataFactory(projectIds, 10);
    // await safeInsert(ChartProjectTable, chartProjectSeedData);
    // await safeInsert(ChartProjectTable, chartProjectSeedFactory);

    // const historyProjectSeedData = await historyProjectData(projectIds);
    // const historyProjectSeedFactory = await historyProjectDataFactory(projectIds, 10);
    // await safeInsert(HistoryProjectTable, historyProjectSeedData);
    // await safeInsert(HistoryProjectTable, historyProjectSeedFactory);

    // const projectWalletSeedData = await ProjectWalletData(projectIds);
    // await safeInsert(ProjectWalletTable, projectWalletSeedData.data);

    // const projectWalletRecords = await db.select().from(ProjectWalletTable);
    // const projectWalletIds = projectWalletRecords.map((row) => row.id);
    // const historyProjectWalletSeedData = await HistoryProjectWalletData(projectWalletIds);
    // await safeInsert(HistoryProjectWalletTable, historyProjectWalletSeedData.data);

    const signatureAdminSeedData = await SignatureAdminData(userIds);
    await safeInsert(SignatureAdminTable, signatureAdminSeedData);

    console.log("Seeding berhasil 🥳🥳🥳");
  } catch (error) {
    console.error("Seeding gagal:", error);
  } finally {
    await connection.end();
  }
}

seed();