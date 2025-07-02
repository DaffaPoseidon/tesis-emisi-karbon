import { db } from "../drizzle/db.js";
import {
  ChartProjectTable,
  HistoryProjectTable,
  ProjectCategoryTable,
  ProjectReportTable,
  ProjectTable,
  ProjectWalletTable,
  SupportDocumentTable,
  TopupTable,
  UserTable,
  WalletTable,
} from "../drizzle/schema.js";
import {
  and,
  count,
  desc,
  eq,
  gte,
  inArray,
  like,
  SQL,
  sum,
} from "drizzle-orm";
import cron from "node-cron";
import { getContract } from "../main.js";
import { ethers } from "ethers";
import { getWalletSaldoByUserId, updateWalletById } from "./wallet.js";

const apiUrl: any = process.env.API_URL;
const privateKey: any = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(apiUrl);
const wallet = new ethers.Wallet(privateKey, provider);

export const countProject = async () => {
  const projects = await db.select().from(ProjectTable).execute();
  return projects.length;
};

export const createProject = async (id_user: string, project: any) => {
  const contract = await getContract();
  if (!id_user || typeof id_user !== "string") {
    const error = new Error("Invalid user ID");
    (error as any).statusCode = 400;
    throw error;
  }

  if (!project || typeof project !== "object") {
    const error = new Error("Invalid project data");
    (error as any).statusCode = 400;
    throw error;
  }

  const category = await db
    .select()
    .from(ProjectCategoryTable)
    .where(eq(ProjectCategoryTable.id, project.id_kategori))
    .execute();
  if (!category || category.length === 0) {
    const error = new Error("Invalid project category");
    (error as any).statusCode = 400;
    throw error;
  }

  const [newProject] = await db
    .insert(ProjectTable)
    .values({
      id_user: id_user,
      ...project,
      status: "PROSES VERIFIKASI",
    })
    .returning({ id: ProjectTable.id });

  const dividenProfit = await contract.addDividenProfit(
    newProject.id,
    project.bagian_pelaksana,
    project.bagian_pemilik,
    project.bagian_koperasi,
    project.bagian_pendana
  );
  await dividenProfit.wait();
  console.log(dividenProfit);

  if (!newProject || !newProject.id) {
    const error = new Error("Failed to retrieve new project ID.");
    (error as any).statusCode = 500;
    throw error;
  }

  const dokumenArray = Array.isArray(project.dokumen)
    ? project.dokumen
    : [project.dokumen].filter(Boolean);

  console.log("Document array:", dokumenArray);

  for (const document of dokumenArray) {
    if (typeof document === "string") {
      console.log("Inserting document with path:", document);

      await db
        .insert(SupportDocumentTable)
        .values({
          id_projek: newProject.id,
          dokumen: document,
        })
        .execute();
    } else if (document && document.path) {
      console.log("Inserting document with path:", document.path);

      await db
        .insert(SupportDocumentTable)
        .values({
          id_projek: newProject.id,
          dokumen: document.path,
        })
        .execute();
    } else {
      console.warn("Invalid document entry:", document);
      const error = new Error("Invalid document entry");
      (error as any).statusCode = 400;
      throw error;
    }
  }

  const result = await db
    .insert(HistoryProjectTable)
    .values({
      id_projek: newProject.id,
      history: "Proposal Project Terkirim",
      keterangan:
        "Proposal project Anda berhasil terkirim dan akan diperiksa oleh Tim Kami",
      status: "SUCCESS",
    })
    .execute();

  if (!result) {
    const error = new Error("Failed to insert project history.");
    (error as any).statusCode = 500;
    throw error;
  }

  return { message: "Project created successfully" };
};

export const getAllProject = async (
  search?: string,
  filter?: {
    [key: string]: string | undefined;
  }
) => {
  let query = db
    .select({
      project: ProjectTable,
      user: UserTable,
      kategori: ProjectCategoryTable,
      supportDocument: SupportDocumentTable,
    })
    .from(ProjectTable)
    .innerJoin(UserTable, eq(ProjectTable.id_user, UserTable.id))
    .innerJoin(
      SupportDocumentTable,
      eq(ProjectTable.id, SupportDocumentTable.id_projek)
    )
    .innerJoin(
      ProjectCategoryTable,
      eq(ProjectTable.id_kategori, ProjectCategoryTable.id)
    )
    .orderBy(desc(ProjectTable.created_at));

  if (filter) {
    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        switch (key) {
          case "status":
            query.where(
              eq(
                ProjectTable.status,
                filter[key] as
                  | "DITOLAK"
                  | "DRAFT"
                  | "PROSES VERIFIKASI"
                  | "REVISI"
                  | "APPROVAL"
                  | "TTD KONTRAK"
                  | "PENDANAAN DIBUKA"
                  | "BERJALAN"
                  | "DIBATALKAN"
                  | "SELESAI"
              )
            );
            break;
          // Add more cases for other columns as needed
          default:
            const error = new Error("No projects found");
            (error as any).statusCode = 404;
            throw error;
        }
      }
    });
  }

  if (search) {
    query.where(like(ProjectTable.judul, `%${search}%`));
  }

  const projectsWithDocuments = await query.execute();

  if (!projectsWithDocuments.length) {
    const error = new Error("No projects found");
    (error as any).statusCode = 404;
    throw error;
  }

  const groupedProjects = projectsWithDocuments.reduce((acc, curr) => {
    const projectId = curr.project.id;

    if (!acc[projectId]) {
      acc[projectId] = {
        ...curr.project,
        user: curr.user,
        kategori: curr.kategori,
        dokumenTambahan: [],
      };
    }

    if (curr.supportDocument) {
      acc[projectId].dokumenTambahan.push(curr.supportDocument);
    }

    return acc;
  }, {} as { [key: string]: any });

  return Object.values(groupedProjects);
};

export async function getProjectById(id: string) {
  const contract = await getContract();
  const projectWithDocuments = await db
    .select({
      project: ProjectTable,
      user: UserTable,
      kategori: ProjectCategoryTable,
      supportDocument: SupportDocumentTable,
    })
    .from(ProjectTable)
    .where(eq(ProjectTable.id, id))
    .innerJoin(UserTable, eq(ProjectTable.id_user, UserTable.id))
    .innerJoin(
      SupportDocumentTable,
      eq(ProjectTable.id, SupportDocumentTable.id_projek)
    )
    .innerJoin(
      ProjectCategoryTable,
      eq(ProjectTable.id_kategori, ProjectCategoryTable.id)
    )
    .execute();

  if (!projectWithDocuments.length) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const getDividenProfit = await contract.getDividenProfitByProjectId(id);

  const modifiedDividenProfit = {
    bagian_pelaksana: Number(getDividenProfit[1]),
    bagian_pemilik: Number(getDividenProfit[2]),
    bagian_koperasi: Number(getDividenProfit[3]),
    bagian_pendana: Number(getDividenProfit[4]),
  };

  const { project, user, kategori } = projectWithDocuments[0];

  const dokumenTambahan = projectWithDocuments.map(
    ({ supportDocument }) => supportDocument
  );

  const jumlahReport = await db
    .select({ count: count(ProjectReportTable.id) })
    .from(ProjectReportTable)
    .where(eq(ProjectReportTable.id_projek, id))
    .execute();

  const lastReport = await db
    .select()
    .from(ProjectReportTable)
    .where(eq(ProjectReportTable.id_projek, id))
    .orderBy(desc(ProjectReportTable.created_at))
    .limit(1)
    .execute();

  let modal = project.nominal; // Default ke nominal asli
  if (lastReport.length) {
    modal = lastReport[0].nominal - lastReport[0].modal;
  }

  const status =
    jumlahReport[0].count > 0
      ? `BERJALAN SIKLUS ${jumlahReport[0].count + 1}`
      : project.status;

  const { id_user, id_kategori, ...filteredProject } = project;

  return {
    ...filteredProject,
    nominal: modal,
    status,
    ...modifiedDividenProfit,
    user,
    kategori,
    dokumenTambahan,
  };
}

export async function getProjectByUserId(
  id: any,
  search?: string,
  filter?: {
    [key: string]: string | undefined;
  }
) {
  console.log(id);
  let conditions: SQL[] = [eq(ProjectTable.id_user, id)];

  if (filter) {
    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        switch (key) {
          case "status":
            conditions.push(
              eq(
                ProjectTable.status,
                filter[key] as
                  | "DITOLAK"
                  | "DRAFT"
                  | "PROSES VERIFIKASI"
                  | "REVISI"
                  | "APPROVAL"
                  | "TTD KONTRAK"
                  | "PENDANAAN DIBUKA"
                  | "BERJALAN"
                  | "DIBATALKAN"
                  | "SELESAI"
              )
            );
            break;
          // Add more cases for other columns as needed
          default:
            const error = new Error("No projects found");
            (error as any).statusCode = 404;
            throw error;
        }
      }
    });
  }

  if (search) {
    conditions.push(like(ProjectTable.judul, `%${search}%`));
  }

  const query = db
    .select({
      project: ProjectTable,
      user: UserTable,
      kategori: ProjectCategoryTable,
      supportDocument: SupportDocumentTable,
    })
    .from(ProjectTable)
    .innerJoin(UserTable, eq(ProjectTable.id_user, UserTable.id))
    .innerJoin(
      SupportDocumentTable,
      eq(ProjectTable.id, SupportDocumentTable.id_projek)
    )
    .innerJoin(
      ProjectCategoryTable,
      eq(ProjectTable.id_kategori, ProjectCategoryTable.id)
    )
    .where(and(...conditions))
    .orderBy(desc(ProjectTable.created_at));

  const projectWithDocuments = await query.execute();

  if (!projectWithDocuments.length) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const groupedProjects = projectWithDocuments.reduce<Array<any>>(
    (acc, curr) => {
      const projectId = curr.project.id;

      const existingProject = acc.find((proj) => proj.id === projectId);

      if (existingProject) {
        if (curr.supportDocument) {
          existingProject.dokumenTambahan.push(curr.supportDocument);
        }
      } else {
        acc.push({
          ...curr.project,
          user: curr.user,
          kategori: curr.kategori,
          dokumenTambahan: curr.supportDocument ? [curr.supportDocument] : [],
        });
      }

      return acc;
    },
    []
  );

  return groupedProjects;
}

interface UserTokenSummary {
  nama: string;
  token_created_at: string;
  jumlah_token: number;
  total_nilai_token: number;
}

export async function getUserHaveTokenInProject(id: string) {
  try {
    const contract = await getContract();

    const tokens = await contract.getTokenByProjectId(id);

    const userSummaryMap: Record<string, UserTokenSummary> = {};

    for (const token of tokens) {
      const [tokenId, idProjek, idUser, nilai] = token;

      if (idUser === "0") continue;

      if (!userSummaryMap[idUser]) {
        userSummaryMap[idUser] = {
          nama: "",
          token_created_at: new Date().toISOString(),
          jumlah_token: 0,
          total_nilai_token: 0,
        };
      }

      userSummaryMap[idUser].jumlah_token += 1;
      userSummaryMap[idUser].total_nilai_token += Number(nilai);
    }

    const userIds = Object.keys(userSummaryMap);
    const users = await db
      .select({
        id: UserTable.id,
        nama: UserTable.nama,
      })
      .from(UserTable)
      .where(inArray(UserTable.id, userIds))
      .execute();

    for (const user of users) {
      if (userSummaryMap[user.id]) {
        userSummaryMap[user.id].nama = user.nama;
      }
    }

    const userTokenSummary = Object.values(userSummaryMap);

    if (userTokenSummary.length === 0) {
      const error = new Error("No tokens found for this project");
      (error as any).statusCode = 404;
      throw error;
    }

    return userTokenSummary;
  } catch (error) {
    console.error("Error in getUserHaveTokenInProject:", error);
    throw error;
  }
}

export async function updateStatusProjectById(id: string, status: any) {
  await getProjectById(id);
  await db
    .update(ProjectTable)
    .set({ status })
    .where(eq(ProjectTable.id, id))
    .execute();
}

export async function acceptProjectById(id: string) {
  await getProjectById(id);
  await updateStatusProjectById(id, "APPROVAL");
  await db
    .insert(HistoryProjectTable)
    .values({
      id_projek: id,
      history: "Peninjauan Proposal",
      keterangan:
        "Proposal project Anda telah memenuhi syarat, selanjutnya akan dilakukan proses approval dari komitee koperasi",
      status: "SUCCESS",
    })
    .execute();
  await db
    .insert(HistoryProjectTable)
    .values({
      id_projek: id,
      history: "Proses Approval dari Komitee Koperasi",
      keterangan: "Project sedang dalam proses approval komitee koperasi",
      status: "PENDING",
    })
    .execute();
}

export async function rejectProjectById(id: string, keterangan: string) {
  await getProjectById(id);
  await updateStatusProjectById(id, "DITOLAK");
  await db
    .insert(HistoryProjectTable)
    .values({
      id_projek: id,
      history: "Peninjauan Proposal",
      keterangan: keterangan,
      status: "FAILED",
    })
    .execute();
}

export async function reviseProjectById(id: string, keterangan: string) {
  await getProjectById(id);
  await updateStatusProjectById(id, "REVISI");
  await db.insert(HistoryProjectTable).values({
    id_projek: id,
    history: "Peninjauan Proposal",
    keterangan: keterangan,
    status: "FAILED",
  });
}

export async function getKeteranganReviseProjectById(id: string) {
  const projectHistory = await db
    .select({ keterangan: HistoryProjectTable.keterangan })
    .from(HistoryProjectTable)
    .where(
      and(
        eq(HistoryProjectTable.id_projek, id),
        eq(HistoryProjectTable.history, "Peninjauan Proposal"),
        eq(HistoryProjectTable.status, "FAILED")
      )
    )
    .orderBy(desc(HistoryProjectTable.created_at))
    .limit(1)
    .execute();
  if (projectHistory.length === 0) {
    const error = new Error("History not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return projectHistory[0];
}

export async function updateProjectById(id_user: any, updatedProject: any) {
  const id = updatedProject.id;
  const existingProject = await db
    .select()
    .from(ProjectTable)
    .where(eq(ProjectTable.id, id))
    .execute();
  const contract = await getContract();

  if (existingProject.length === 0) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (existingProject[0].id_user !== id_user) {
    const error = new Error("You are not authorized to update this project");
    (error as any).statusCode = 403;
    throw error;
  }

  const projectUpdateData: any = {
    status: "PROSES VERIFIKASI",
  };

  if (updatedProject.dokumen_proyeksi !== undefined) {
    projectUpdateData.dokumen_proyeksi = updatedProject.dokumen_proyeksi;
  }

  Object.keys(updatedProject).forEach((key) => {
    if (key !== "dokumen_proyeksi" && updatedProject[key] !== undefined) {
      projectUpdateData[key] = updatedProject[key];
    }
  });

  await db
    .update(ProjectTable)
    .set(projectUpdateData)
    .where(eq(ProjectTable.id, id))
    .execute();
  const getDividenProfit = await contract.getDividenProfitByProjectId(id);
  console.log(getDividenProfit);

  const modifiedDividenProfit = {
    bagianPelaksana: Number(getDividenProfit[1]),
    bagianPemilik: Number(getDividenProfit[2]),
    bagianKoperasi: Number(getDividenProfit[3]),
    bagianPendana: Number(getDividenProfit[4]),
  };

  if (updatedProject.bagian_pelaksana) {
    modifiedDividenProfit.bagianPelaksana = updatedProject.bagian_pelaksana;
  }

  if (updatedProject.bagian_pemilik) {
    modifiedDividenProfit.bagianPemilik = updatedProject.bagian_pemilik;
  }

  if (updatedProject.bagian_koperasi) {
    modifiedDividenProfit.bagianKoperasi = updatedProject.bagian_koperasi;
  }

  if (updatedProject.bagian_pendana) {
    modifiedDividenProfit.bagianPendana = updatedProject.bagian_pendana;
  }

  const updateDividenProfit = await contract.updateDividenProfit(
    updatedProject.id,
    modifiedDividenProfit.bagianPelaksana,
    modifiedDividenProfit.bagianPemilik,
    modifiedDividenProfit.bagianKoperasi,
    modifiedDividenProfit.bagianPendana
  );

  const dokumenArray = Array.isArray(updatedProject.dokumen)
    ? updatedProject.dokumen
    : [updatedProject.dokumen].filter(Boolean);

  const existingDocuments = await db
    .select()
    .from(SupportDocumentTable)
    .where(eq(SupportDocumentTable.id_projek, id))
    .execute();

  const existingDocumentPaths = existingDocuments.map((doc) => doc.dokumen);

  for (const existingDocument of existingDocuments) {
    if (!dokumenArray.includes(existingDocument.dokumen)) {
      await db
        .delete(SupportDocumentTable)
        .where(eq(SupportDocumentTable.id, existingDocument.id))
        .execute();
    }
  }

  for (const document of dokumenArray) {
    const documentPath =
      typeof document === "string" ? document : document.path;
    if (documentPath && !existingDocumentPaths.includes(documentPath)) {
      await db
        .insert(SupportDocumentTable)
        .values({
          id_projek: id,
          dokumen: documentPath,
        })
        .execute();
    }
  }

  const historyResult = await db
    .insert(HistoryProjectTable)
    .values({
      id_projek: id,
      history: "Peninjauan Proposal",
      keterangan: "Form pengajuan proyek sudah direvisi",
      status: "PENDING",
    })
    .execute();

  if (!historyResult) {
    const error = new Error("Failed to insert project history.");
    (error as any).statusCode = 500;
    throw error;
  }

  return { message: "Project successfully updated" };
}

const queue: (() => Promise<void>)[] = [];
let processing = false;
let currentNonce = 0;

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const tx = queue.shift();
  try {
    if (tx) {
      await tx(); // Proses transaksi
    }
  } catch (error) {
    console.error("Error processing transaction", error);
  } finally {
    processing = false;
    processQueue();
  }
}

export async function approveProjectById(id: string, detail: any) {
  try {
    await getProjectById(id);
    await updateStatusProjectById(id, "TTD KONTRAK");

    await db
      .update(ProjectTable)
      .set({ ...detail })
      .where(eq(ProjectTable.id, id))
      .execute();

    const contract = await getContract();

    // Dapatkan nonce awal sebelum memasukkan transaksi ke antrean
    currentNonce = await provider.getTransactionCount(wallet.address, "latest");
    console.log("Current nonce:", currentNonce);

    // Tambahkan transaksi createToken ke dalam queue
    for (let i = 0; i < detail.jumlah_koin; i++) {
      queue.push(async () => {
        const tx = await contract.createToken(
          id,
          "0",
          detail.harga_per_unit.toString(),
          { nonce: currentNonce }
        );
        await tx.wait(); // Tunggu hingga transaksi selesai
        console.log(
          "\x1b[42m%s\x1b[0m",
          `Token ${i + 1} created for project ${id}`
        );

        currentNonce++; // Increment nonce setelah transaksi berhasil
        console.log("Current nonce:", currentNonce);
      });
    }

    // Mulai memproses queue
    processQueue();

    await db.insert(HistoryProjectTable).values({
      id_projek: id,
      history: "Proses Approval dari Komitee Koperasi",
      keterangan: `
        Project disetujui oleh komitee dengan catatan sebagai berikut:
        <ul>
            <li><strong>Nominal disetujui:</strong> Rp ${
              detail.nominal_disetujui
            }</li>
            <li><strong>Jumlah Unit:</strong> ${detail.jumlah_koin}</li>
            <li><strong>Maks Pembelian:</strong> ${
              detail.maksimal_pembelian
            } atau Rp ${detail.maksimal_pembelian * detail.harga_per_unit}</li>
        </ul>
      `,
      status: "SUCCESS",
    });

    await db
      .insert(HistoryProjectTable)
      .values({
        id_projek: id,
        history: "Kontrak Perjanjian",
        keterangan: "Menunggu tanda tangan kontrak perjanjian",
        status: "PENDING",
      })
      .execute();

    console.log(`All tokens created for project ${id}`);
  } catch (error) {
    console.error("Error in approveProjectById:", error);
    throw error;
  }
}

export async function deleteProjectById(id: string) {
  await getProjectById(id);
  await db.delete(ProjectTable).where(eq(ProjectTable.id, id)).execute();
}

export async function publishProjectById(penggalangan: any) {
  await getProjectById(penggalangan.id_projek);
  await db.insert(HistoryProjectTable).values({
    id_projek: penggalangan.id_projek,
    history: "Proses Penggalangan Penyertaan Modal",
    keterangan: "Proyek Telah dipublish",
    status: "PENDING",
  });

  await db.insert(HistoryProjectTable).values({
    id_projek: penggalangan.id_projek,
    history: "Proses Penggalangan Penyertaan Modal",
    keterangan: "Proses pendanaan sedang berlangsung",
    status: "SUCCESS",
  });

  await db
    .update(ProjectTable)
    .set({
      status: "PENDANAAN DIBUKA",
      mulai_penggalangan_dana: penggalangan.mulai_penggalangan_dana,
      selesai_penggalangan_dana: penggalangan.selesai_penggalangan_dana,
      dokumen_prospektus: penggalangan.dokumen_prospektus,
      updated_at: new Date(),
    })
    .where(eq(ProjectTable.id, penggalangan.id_projek))
    .execute();

  return { message: "Project published successfully" };
}

interface TokenDetail {
  tokenId: string;
  idUser: string;
  nilai: number;
}

interface UserTokens {
  totalNominal: number;
  tokenIds: string[];
}

// Function to validate UUID
function isValidUUID(uuid: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function checkProjectFundingOpened() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const projects = await db
      .select()
      .from(ProjectTable)
      .innerJoin(
        ProjectWalletTable,
        eq(ProjectTable.id, ProjectWalletTable.id_projek)
      )
      .where(
        and(
          eq(ProjectTable.selesai_penggalangan_dana, today),
          gte(ProjectTable.nilai_jaminan, ProjectWalletTable.saldo)
        )
      )
      .execute();

    if (!projects || projects.length === 0) {
      const error = new Error("Project not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const contract = await getContract();

    for (const project of projects) {
      try {
        const projectTokens = await contract.getTokenByProjectId(
          project.project.id
        );

        console.log("Project tokens:", projectTokens);

        const tokenMap: Record<string, UserTokens> = projectTokens.reduce(
          (map: Record<string, UserTokens>, token: TokenDetail) => {
            const userId = token.idUser;

            // Validate userId before proceeding
            if (!isValidUUID(userId)) {
              console.error(`Invalid userId: ${userId}`);
              return map;
            }

            if (!map[userId]) {
              map[userId] = { totalNominal: 0, tokenIds: [] };
            }

            const tokenNominal =
              typeof token.nilai === "bigint"
                ? Number(token.nilai)
                : token.nilai;

            map[userId].totalNominal += tokenNominal;
            map[userId].tokenIds.push(token.tokenId);

            return map;
          },
          {}
        );

        for (const [userId, { totalNominal, tokenIds }] of Object.entries(
          tokenMap
        )) {
          try {
            // Reset token nominals using smart contract
            for (const tokenId of tokenIds) {
              const tx = await contract.resetTokenNominal(tokenId);
              await tx.wait();
              console.log(
                `Token ${tokenId} nilai has been reset to 0 via smart contract`
              );
            }

            const userWallet = await getWalletSaldoByUserId(userId);
            console.log("User wallet:", userWallet.data.id);

            if (userWallet && userWallet.data) {
              const currentSaldo = userWallet.data.saldo;

              await updateWalletById(
                { saldo: currentSaldo + totalNominal },
                userWallet.data.id
              );

              console.log(
                `Saldo user ${userId} telah ditambahkan sebesar ${totalNominal}`
              );
            } else {
              console.error(
                `Wallet dengan jenis 'SALDO' tidak ditemukan untuk user ${userId}`
              );
            }
          } catch (userError) {
            console.error(`Error processing user ${userId}:`, userError);
          }
        }

        try {
          await db
            .update(ProjectTable)
            .set({ status: "DIBATALKAN", updated_at: new Date() })
            .where(eq(ProjectTable.id, project.project.id))
            .execute();
        } catch (updateProjectError) {
          console.error(
            `Error updating project ${project.project.id} status to 'DIBATALKAN':`,
            updateProjectError
          );
        }

        try {
          await db.insert(HistoryProjectTable).values({
            id_projek: project.project.id,
            history: "Proses Penggalangan Penyertaan Modal",
            keterangan:
              "Proyek telah dibatalkan karena Pendanaan tidak memenuhi target, Dana telah dikembalikan Otomatis ke pembeli proyek",
            status: "FAILED",
          });
        } catch (historyError) {
          console.error(
            `Error inserting history for project ${project.project.id}:`,
            historyError
          );
        }

        try {
          await db
            .update(ProjectWalletTable)
            .set({ dana_terkumpul: 0, saldo: 0, updated_at: new Date() })
            .where(eq(ProjectWalletTable.id_projek, project.project.id))
            .execute();
          console.log(
            `Saldo project ${project.project.id} telah di-reset menjadi 0`
          );
        } catch (updateWalletError) {
          console.error(
            `Error resetting project wallet saldo for project ${project.project.id}:`,
            updateWalletError
          );
        }

        console.log(
          `Project ${project.project.id} funding has been closed and tokens returned to users`
        );
      } catch (projectError) {
        console.error(
          `Error processing project ${project.project.id}:`,
          projectError
        );
      }
    }
  } catch (error) {
    console.error("Error checking project funding:", error);
  }
}

cron.schedule("0 0 * * *", () => {
  console.log("Running project status check...");
  checkProjectFundingOpened();
});

export async function completingProjectById(id: string) {
  const project = await getProjectById(id);

  if (!project) {
    const error = new Error("Project not found.");
    (error as any).statusCode = 404;
    throw error;
    return error;
  }

  await db
    .update(ProjectTable)
    .set({ status: "SELESAI" })
    .where(eq(ProjectTable.id, id))
    .execute();
}

export async function totalProfit(id: string) {
  const totalKomulatif = await db
    .select({ value: sum(ChartProjectTable.nominal) })
    .from(ChartProjectTable)
    .where(eq(ChartProjectTable.id_projek, id))
    .execute();

  if (!totalKomulatif || totalKomulatif.length === 0) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return totalKomulatif[0].value;
}

export async function shareProfit(id: any) {
  let chartTokens;
  const contract = await getContract();
  const project = await getProjectById(id);
  const admin = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.role, "ADMIN"))
    .execute();
  let walletKoperasi = await db
    .select()
    .from(WalletTable)
    .where(
      and(
        eq(WalletTable.id_user, admin[0].id),
        eq(WalletTable.jenis_wallet, "KAS KOPERASI")
      )
    )
    .execute();

  if (!walletKoperasi || walletKoperasi.length === 0) {
    const buatWalletKoperasi = await db
      .insert(WalletTable)
      .values({
        id_user: admin[0].id,
        jenis_wallet: "KAS KOPERASI",
      })
      .returning({ id: WalletTable.id })
      .execute();
    walletKoperasi = await db
      .select()
      .from(WalletTable)
      .where(eq(WalletTable.id, buatWalletKoperasi[0].id))
      .execute();
  }

  const totalKomulatif = await db
    .select({ value: sum(ChartProjectTable.nominal) })
    .from(ChartProjectTable)
    .where(eq(ChartProjectTable.id_projek, id))
    .execute();

  if (!totalKomulatif[0].value) {
    const error = new Error("Failed to calculate total cumulative value");
    (error as any).statusCode = 500;
    throw error;
  }

  const dividenProfit = await contract.getDividenProfitByProjectId(id);
  if (!dividenProfit.pelaksana) {
    const error = new Error("Bagian pelaksana not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  const bagianPelaksana = Math.round(
    (Number(totalKomulatif[0].value) * Number(dividenProfit.pelaksana)) / 100
  );
  await db
    .insert(TopupTable)
    .values({
      id_wallet: walletKoperasi[0].id,
      nama: project.judul,
      nominal: bagianPelaksana,
      jenis: "PELAKSANA",
    })
    .execute();

  if (!dividenProfit.koperasi) {
    const error = new Error("Bagian koperasi not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  const bagianKoperasi = Math.round(
    (Number(totalKomulatif[0].value) * Number(dividenProfit.koperasi)) / 100
  );
  await db
    .update(WalletTable)
    .set({ saldo: walletKoperasi[0].saldo + bagianKoperasi })
    .where(eq(WalletTable.id, walletKoperasi[0].id))
    .execute();

  if (!dividenProfit.pemilik) {
    const error = new Error("Bagian pemilik not found.");
    (error as any).statusCode = 404;
    throw error;
  }

  const bagianPemilik = Math.round(
    (Number(totalKomulatif[0].value) * Number(dividenProfit.pemilik)) / 100
  );
  await db
    .insert(TopupTable)
    .values({
      id_wallet: walletKoperasi[0].id,
      nama: project.judul,
      nominal: bagianPemilik,
      jenis: "PEMILIK",
      created_at: new Date(),
    })
    .execute();

  try {
    chartTokens = await contract.getLatestChartTokensByProjectId(id);
    console.log(chartTokens);
  } catch (err) {
    const error = new Error("Failed to fetch chart tokens.");
    (error as any).statusCode = 500;
    throw error;
  }

  if (!chartTokens || chartTokens.length === 0) {
    const error = new Error("No chart tokens found for the project.");
    (error as any).statusCode = 404;
    throw error;
  }

  for (const token of chartTokens) {
    let historyToken;
    try {
      historyToken = await contract.getHistoryTokenByChartTokenId(
        token.chartTokenId
      );
    } catch (err) {
      const error = new Error(
        `Failed to fetch history tokens for chart token ${token.chartTokenId}.`
      );
      (error as any).statusCode = 500;
      throw error;
    }

    if (!historyToken || historyToken.length === 0) {
      const error = new Error(
        `No history token found for chart token ${token.chartTokenId}.`
      );
      (error as any).statusCode = 404;
      throw error;
    }

    const userId = token.idUser;
    let wallet;
    try {
      wallet = await getWalletSaldoByUserId(userId);
    } catch (err) {
      const error = new Error(`Failed to fetch wallet for user ${userId}.`);
      (error as any).statusCode = 500;
      throw error;
    }

    if (!wallet || wallet.length === 0) {
      const error = new Error(`No wallet found for user ${userId}.`);
      (error as any).statusCode = 404;
      throw error;
    }

    console.log(wallet.data.saldo + "+" + Number(historyToken.totalNilai));
    const updatedBalance = wallet.data.saldo + Number(historyToken.totalNilai);
    console.log(
      `Updating wallet balance for user ${userId} to ${updatedBalance}`
    );
    try {
      await updateWalletById({ saldo: updatedBalance }, wallet.data.id);
    } catch (err) {
      const error = new Error(
        `Failed to update wallet balance for user ${userId}.`
      );
      (error as any).statusCode = 500;
      throw error;
    }
  }

  return { message: "Profit shared" };
}

export async function getDokumenProspektusById(id: any) {
  const project = await db
    .select({ dokumen_prospektus: ProjectTable.dokumen_prospektus })
    .from(ProjectTable)
    .where(eq(ProjectTable.id, id))
    .execute();
  if (!project || project.length === 0) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return project[0].dokumen_prospektus;
}
