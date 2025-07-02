import { and, eq } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { HistoryProjectTable, ProjectTable, ProjectWalletTable, UserTable, WalletTable } from "../drizzle/schema.js";
import { getProjectById, updateStatusProjectById } from "./project.js";
import { getContract } from "../main.js";
import { ethers } from "ethers";
import { getWalletSaldoByUserId, updateWalletById } from "./wallet.js";

const apiUrl: any = process.env.API_URL;
const privateKey: any = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider(apiUrl);
const wallet = new ethers.Wallet(privateKey, provider);

export async function getAllToken() {
  try {
    const contract = await getContract();

    const allTokens = await contract.getAllTokens();
    console.log("Fetched tokens from blockchain:", allTokens);

    const formattedTokens = [];

    for (const token of allTokens) {
      const tokenId = token[0];
      const idProjek = token[1];
      const idUser = token[2];
      const nilai = token[3].toString();

      let user = null;
      let project = null;

      if (idUser !== "0") {
        try {
          const userResult = await db.select().from(UserTable).where(eq(UserTable.id, idUser)).limit(1);
          user = userResult[0] || null;
        } catch (userError) {
          console.error(`Error fetching user with ID ${idUser}:`, userError);
        }
      }

      try {
        const projectResult = await db.select().from(ProjectTable).where(eq(ProjectTable.id, idProjek)).limit(1);
        project = projectResult[0] || null;
      } catch (projectError) {
        console.error(`Error fetching project with ID ${idProjek}:`, projectError);
      }

      formattedTokens.push({
        tokenId,
        idProjek,
        idUser,
        nilai,
        user,
        project,
      });
    }

    return formattedTokens;
  } catch (error) {
    console.error("Error in fetching tokens from blockchain and database:", error);
    throw error;
  }
}

export async function getTotalToken() {
  try {
    const contract = await getContract();
    const totalToken = await contract.getTotalTokens();

    console.log("Fetched total token count from blockchain:", totalToken);

    if (totalToken === null || totalToken === undefined || totalToken.toString() === "0") {
      return "0";
    }

    return totalToken.toString();
  } catch (error) {
    console.error("Error in fetching total token count from blockchain:", error);
    throw error;
  }
}

export async function getTokenByIdProject(id: string) {
  try {
    const contract = await getContract();

    const tokens = await contract.getTokenByProjectId(id);

    const serializedTokens = tokens.map((token: any) => {
      return {
        tokenId: token[0],
        idProjek: token[1],
        idUser: token[2],
        nilai: token[3].toString(),
      };
    });

    console.log("Fetched token by project ID from blockchain:", serializedTokens);

    return serializedTokens;
  } catch (error) {
    console.error("Error in fetching token by project ID from blockchain:", error);
    throw error;
  }
}

export async function getTotalTokenTerbeliByIdProject(id: string) {
  try {
    const contract = await getContract();
    const tokens = await contract.getTokenByProjectId(id);

    const tokenCount = tokens.reduce((count: number, token: any) => {
      if (token[2].toString() !== "0") {
        return count + 1;
      }
      return count;
    }, 0);

    console.log("Number of tokens for non-zero users:", tokenCount);
    return tokenCount;
  } catch (error) {
    console.error("Error in counting tokens for non-zero users:", error);
    throw error;
  }
}

export async function getTokenProjectByUser(id_user: string, id_projek: string) {
  try {
    console.log(id_user, id_projek);
    const contract = await getContract();

    const tokens = await contract.getTokenByUserAndProject(id_user, id_projek);

    const serializedTokens = tokens.map((token: any) => {
      return {
        tokenId: token[0],
        idProjek: token[1],
        idUser: token[2],
        nilai: token[3].toString(),
      };
    });

    console.log("Fetched token by project ID from blockchain:", serializedTokens);

    return serializedTokens;
  } catch (error) {
    console.error("Error in fetching token by project ID from blockchain:", error);
    throw error;
  }
}

const updateTokenQueue: ((nonce: number) => Promise<void>)[] = [];
let processingUpdate = false;
let currentNonce: number | null = null;

async function processUpdateQueue() {
  if (processingUpdate || updateTokenQueue.length === 0) return;
  processingUpdate = true;

  try {
    if (currentNonce === null) {
      // Ambil nonce terbaru dari provider hanya jika currentNonce belum diinisialisasi
      currentNonce = await provider.getTransactionCount(wallet.address, "latest");
    }

    console.log("Processing token update transaction with nonce", currentNonce);

    while (updateTokenQueue.length > 0) {
      console.log("Processing token update transaction with nonce", currentNonce);

      const tx = updateTokenQueue.shift();
      if (tx && currentNonce !== null) {
        try {
          await tx(currentNonce);
          console.log(`Transaction completed with nonce: ${currentNonce}`);
          currentNonce++; // Increment nonce setelah transaksi berhasil
        } catch (error: any) {
          console.error("Error processing token update transaction", error);
          // Jika error adalah NONCE_EXPIRED, reset currentNonce ke nonce terbaru
          if (error.code === "NONCE_EXPIRED") {
            currentNonce = await provider.getTransactionCount(wallet.address, "latest");
            // Jika ada transaksi yang tertunda, lanjutkan dengan yang tersisa
            updateTokenQueue.unshift(tx); // Masukkan kembali transaksi yang gagal
            break; // Keluar dari loop untuk menghindari pengolahan lebih lanjut
          } else {
            throw error; // Jika bukan NONCE_EXPIRED, lempar kembali error
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Error processing token update transaction", error);
    // Jika error adalah NONCE_EXPIRED, reset currentNonce ke nonce terbaru
    if (error.code === "NONCE_EXPIRED") {
      currentNonce = await provider.getTransactionCount(wallet.address, "latest");
    }
  } finally {
    processingUpdate = false;
    processUpdateQueue(); // Proses transaksi berikutnya
  }
}

export async function buyTokenProject(id_user: string, id_projek: string, jumlah_token: number) {
  const contract = await getContract();
  const allTokens = await contract.getTokenByProjectId(id_projek);
  const availableTokens = allTokens.filter((token: any) => token.idUser === "0");
  console.log(availableTokens);

  if (availableTokens.length === 0) {
    const error = new Error("Available tokens not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Cek user, project, wallet, dll. seperti pada kode Anda
  if (availableTokens.length < jumlah_token) {
    const error = new Error("Insufficient tokens available for purchase");
    (error as any).statusCode = 400;
    throw error;
  }

  const user = await db.select().from(UserTable).where(eq(UserTable.id, id_user)).execute();
  if (user.length === 0) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, id_projek)).execute();
  if (project.length === 0) {
    const error = new Error("Project not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const ownerProject = await db.select().from(UserTable).where(eq(UserTable.id, project[0].id_user)).execute();
  if (ownerProject.length === 0) {
    const error = new Error("Project owner not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // const walletUser = await db
  //   .select()
  //   .from(WalletTable)
  //   .where(and(eq(WalletTable.id_user, id_user), eq(WalletTable.jenis_wallet, "SALDO")))
  //   .execute();
  const walletUser = await getWalletSaldoByUserId(id_user);
  console.log(walletUser);
  if (walletUser.length === 0) {
    const error = new Error("User wallet not found");
    (error as any).statusCode = 404;
    throw error;
  }
  const saldo = walletUser.data.saldo;
  const totalHargaToken = Number(availableTokens[0].nilai) * jumlah_token;

  if (saldo < totalHargaToken) {
    const error = new Error("Insufficient balance");
    (error as any).statusCode = 400;
    throw error;
  }

  // Tambahkan setiap panggilan updateTokenUser ke dalam queue dengan nonce
  for (let i = 0; i < jumlah_token; i++) {
    const tokenId = availableTokens[i].tokenId;

    updateTokenQueue.push(async (nonce: number) => {
      const tx = await contract.updateTokenUser(tokenId, id_user, { nonce });
      await tx.wait(); // Tunggu hingga transaksi selesai
      console.log(`Token ${i + 1} purchased and updated for user ${id_user}`);
    });
  }

  // Mulai proses antrean pembaruan token
  processUpdateQueue();

  // Pembaruan saldo dan project wallet seperti sebelumnya
  const saldoSekarang = saldo - totalHargaToken;
  // await db
  //   .update(WalletTable)
  //   .set({ saldo: saldoSekarang })
  //   .where(and(eq(WalletTable.id_user, id_user), eq(WalletTable.jenis_wallet, "SALDO")))
  //   .execute();
  // console.log(walletUser.data.id);
  // console.log("Updating wallet ", walletUser.id, "to", saldoSekarang);
  await updateWalletById({ saldo: saldoSekarang }, walletUser.data.id);

  const project_wallet = await db.select().from(ProjectWalletTable).where(eq(ProjectWalletTable.id_projek, id_projek)).execute();
  if (project_wallet.length === 0) {
    await db.insert(ProjectWalletTable).values({ id_projek, saldo: totalHargaToken, dana_terkumpul: totalHargaToken }).execute();
  } else {
    await db
      .update(ProjectWalletTable)
      .set({ saldo: project_wallet[0].saldo + totalHargaToken, dana_terkumpul: project_wallet[0].dana_terkumpul + totalHargaToken })
      .where(eq(ProjectWalletTable.id_projek, id_projek))
      .execute();
  }

  const projectTokens = await contract.getTokenByProjectId(id_projek);
  console.log("Checking project tokens status:", {
    projectId: id_projek,
    totalTokens: projectTokens.length,
    unsoldTokens: projectTokens.filter((token: any) => token.idUser === "0").length,
    tokens: projectTokens,
  });

  // Important: Wait for all token updates in the queue to complete
  while (updateTokenQueue.length > 0 || processingUpdate) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
  }

  // Recheck tokens after all updates are complete
  const finalProjectTokens = await contract.getTokenByProjectId(id_projek);
  const unsoldTokensCount = finalProjectTokens.filter((token: any) => token.idUser === "0").length;
  console.log("Final token status check:", {
    unsoldTokensCount,
    totalTokens: finalProjectTokens.length,
  });

  if (unsoldTokensCount === 0) {
    console.log("All tokens sold, updating project status to BERJALAN");
    await updateStatusProjectById(id_projek, "BERJALAN");
    await db
      .insert(HistoryProjectTable)
      .values({
        id_projek,
        history: "Proses Penggalangan Penyertaan Modal",
        keterangan: "Penggalangan penyertaan modal untuk proyek anda berhasil memenuhi target dan sedang berjalan.",
        status: "SUCCESS",
      })
      .execute();

    const transaction = await contract.addTransaction(id_user, user[0].nama, id_projek, project[0].judul, ownerProject[0].nama, jumlah_token, totalHargaToken);
    await transaction.wait();
  }

  return {
    message: unsoldTokensCount === 0 ? "Token successfully purchased and project is now running" : "Token successfully purchased",
  };
}

// Utility function to check and update project status
async function checkAndUpdateProjectStatus(id_projek: string) {
  const contract = await getContract();
  const projectTokens = await contract.getTokenByProjectId(id_projek);
  const unsoldTokensCount = projectTokens.filter((token: any) => token.idUser === "0").length;

  if (unsoldTokensCount === 0) {
    const project = await getProjectById(id_projek);
    if (project.status !== "BERJALAN") {
      await updateStatusProjectById(id_projek, "BERJALAN");
      await db
        .insert(HistoryProjectTable)
        .values({
          id_projek,
          history: "Proses Penggalangan Penyertaan Modal",
          keterangan: "Penggalangan penyertaan modal untuk proyek anda berhasil memenuhi target dan sedang berjalan.",
          status: "SUCCESS",
        })
        .execute();
    }
    return true;
  }
  return false;
}

export async function tokenUsageDetailsByIdUser(id_user: string) {
  try {
    const contract = await getContract();

    // Get all tokens and filter by user ID
    const allTokens = await contract.getAllTokens();
    const userTokens = allTokens.filter((token: any) => token.idUser === id_user);
    
    // Get all chart tokens for the user
    const chartTokens = await contract.getAllChartTokensByUserId(id_user);
    
    const projectTokenMap = new Map();

    // Process each project that the user has tokens for
    for (const token of userTokens) {
      const projectId = token.idProjek;

      if (!projectTokenMap.has(projectId)) {
        // Get project and owner details
        const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, projectId)).execute();

        if (project.length > 0) {
          const owner = await db.select().from(UserTable).where(eq(UserTable.id, project[0].id_user)).execute();
          
          // Get project tokens count by filtering all tokens
          const projectTokens = allTokens.filter((token: any) => 
            token.idUser === id_user && token.idProjek === projectId
          );
          
          // Check if this project has chart tokens
          const projectChartTokens = chartTokens.filter((token: any) => token.idProjek === projectId);
          
          let nominal = "0";
          let percentage = 0;

          // If project has chart tokens, get the token details
          if (projectChartTokens.length > 0) {
            const latestChartToken = await contract.getLatestChartTokenByUserIdAndProjectId(id_user, projectId);
            const totalNominalTokens = await contract.getTotalNominalToken(id_user, projectId);
            
            nominal = latestChartToken.nominal.toString();
            percentage = totalNominalTokens.toString() === "0" ? 0 : 
              (Number(latestChartToken.nominal) / Number(totalNominalTokens)) * 100;
          }

          // Add project to map with all details
          projectTokenMap.set(projectId, {
            ...project[0],
            user: owner[0],
            token_count: projectTokens.length.toString(),
            total_nominal: nominal,
            persentase: percentage.toFixed(2),
          });
        }
      }
    }

    return Array.from(projectTokenMap.values());
  } catch (error) {
    console.error("Error fetching token usage details:", error);
    throw error;
  }
}

export async function getTotalTokenRupiahByUser(id_user: string) {
  try {
    const contract = await getContract();

    const allTokens = await contract.getAllTokens();
    console.log("Fetched tokens from blockchain:", allTokens);

    let totalValue = 0;

    for (const token of allTokens) {
      const idUser = token[2];
      const nilai = parseFloat(token[3].toString());

      if (idUser === id_user) {
        totalValue += nilai;
      }
    }

    console.log("Id User:", id_user);
    console.log("Total token value for user:", totalValue);
    return totalValue;
  } catch (error) {
    console.error("Error in fetching tokens and summing values:", error);
    throw error;
  }
}
