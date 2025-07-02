import { and, desc, eq, like, or } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { TopupTable, UserTable, WalletTable } from "../drizzle/schema.js";
import { getUserById, updateUserStatus } from "./user.js";
import {
  createWallet,
  getWalletById,
  getWalletSaldoByUserId,
  getWalletWajibByUserId,
} from "./wallet.js";
import axios from "axios";
import { walletServiceUrl } from "../main.js";
import path from "path";
import * as fs from "fs";
import Response from 'express';

export async function getAllTopUp(search?: string) {
  const query = db
    .select()
    .from(TopupTable)
    .innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id))
    .innerJoin(UserTable, eq(WalletTable.id_user, UserTable.id))
    .orderBy(desc(TopupTable.created_at));

  if (search) {
    query.where(like(TopupTable.nama, `%${search}%`));
  }

  const topUp = await query.execute();
  if (!topUp || topUp.length === 0) {
    const error = new Error("No topups found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topUp;
}

export async function fetchGetAllTopupWalletService() {
  try {
    const response = await axios.get(`${walletServiceUrl}/topup`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch external topups"
    );
  }
}

export async function formatGetAllTopup(search?: string) {
  try {
    const backendTopup = await getAllTopUp(search);

    const walletDataResponse = await fetchGetAllTopupWalletService();
    const walletData = walletDataResponse.data || [];

    const combinedData = await Promise.all(
      walletData.map(async (walletTopup: any) => {
        const user = await getUserById(walletTopup.wallet.id_user);

        return {
          topup: walletTopup.topup,
          wallet: walletTopup.wallet,
          user: user || null,
        };
      })
    );

    const finalData = [...backendTopup, ...combinedData];

    return finalData;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch topups");
  }
}

export async function getTopupById(id: string) {
  const backendTopup = await db
    .select()
    .from(TopupTable)
    .innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id))
    .innerJoin(UserTable, eq(WalletTable.id_user, UserTable.id))
    .where(eq(TopupTable.id, id))
    .execute();

  if (backendTopup.length > 0) {
    return backendTopup.map((item) => ({
      topup: item.topup,
      wallet: item.wallet,
      user: item.user,
    }));
  }

  try {
    const response = await axios.get(`${walletServiceUrl}/topup/${id}`);
    const walletTopup = response.data.data[0];

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, walletTopup.wallet.id_user))
      .execute();

    if (user.length === 0) {
      throw new Error("User not found for the given wallet ID");
    }

    return [
      {
        topup: walletTopup.topup,
        wallet: walletTopup.wallet,
        user: user[0],
      },
    ];
  } catch (error: any) {
    if (error.response?.status === 404) {
      const notFoundError = new Error("Topup not found");
      (notFoundError as any).statusCode = 404;
      throw notFoundError;
    }
    throw new Error("Failed to fetch data from wallet service");
  }
}

export async function getTopupByUserId(id_user: string) {
  const topup = await db
    .select()
    .from(TopupTable)
    .innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id))
    .innerJoin(UserTable, eq(WalletTable.id_user, UserTable.id))
    .where(eq(UserTable.id, id_user))
    .orderBy(desc(TopupTable.created_at))
    .execute();
  if (!topup || topup.length === 0) {
    const error = new Error("Topup not found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topup;
}
export async function fetchGetTopupByUserIdWalletService(userId: string) {
  try {
    const response = await axios.get(
      `${walletServiceUrl}/topup/user/${userId}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch wallet topups"
    );
  }
}

export async function formatGetTopupByUserId(userId: string) {
  const backendTopup = await getTopupByUserId(userId);

  const walletDataResponse = await fetchGetTopupByUserIdWalletService(userId);
  const walletData = walletDataResponse.data || [];

  const enhancedWalletData = await Promise.all(
    walletData.map(async (walletTopup: any) => {
      const userData = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, walletTopup.wallet.id_user))
        .execute()
        .then((users) => users[0] || null);

      return {
        topup: walletTopup.topup,
        wallet: walletTopup.wallet,
        user: userData || null,
      };
    })
  );

  return [...backendTopup, ...enhancedWalletData];
}

export async function getTotalWalletSimpananPokokByUserId(id_user: string) {
  const result = await db
    .select({
      total: WalletTable.saldo,
    })
    .from(WalletTable)
    .where(
      and(
        eq(WalletTable.id_user, id_user),
        eq(WalletTable.jenis_wallet, "SIMPANAN POKOK")
      )
    )
    .execute();

  const total = result[0]?.total || 0;

  if (total === 0) {
    const error = new Error("No Wallet simpanan pokok found for the user");
    (error as any).statusCode = 404;
    throw error;
  }

  return total;
}

export async function getTotalWalletSimpananWajibByUserId(id_user: string) {
  const result = await db
    .select({
      total: WalletTable.saldo,
    })
    .from(WalletTable)
    .where(
      and(
        eq(WalletTable.id_user, id_user),
        eq(WalletTable.jenis_wallet, "SIMPANAN WAJIB")
      )
    )
    .execute();

  const total = result[0]?.total || 0;
  if (total === 0) {
    const error = new Error("No Wallet simpanan pokok found for the user");
    (error as any).statusCode = 404;
    throw error;
  }

  return total;
}

export async function getKasKoperasi() {
  const userId = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.role, "ADMIN"))
    .execute();
  const result = await db
    .select({
      total: WalletTable.saldo,
    })
    .from(WalletTable)
    .where(
      and(
        eq(WalletTable.id_user, userId[0].id),
        eq(WalletTable.jenis_wallet, "KAS KOPERASI")
      )
    )
    .execute();

  const total = result[0]?.total || 0;

  if (total === 0) {
    const error = new Error("No Wallet kas koperasi found");
    (error as any).statusCode = 404;
    throw error;
  }
  return total;
}

export async function getWithdrawSaldo() {
  const response = await axios.get(`${walletServiceUrl}/topup/withdraw`);

  const formattedData = await Promise.all(
    response.data.data.map(async (data: any) => {
      const walletResponse = await axios.get(
        `${walletServiceUrl}/wallet/${data.id_wallet}`
      );
      const walletData = walletResponse.data.data;

      const userData = await db
        .select()
        .from(UserTable)
        .where(eq(UserTable.id, walletData.id_user))
        .execute();

      return {
        topup: {
          id: data.id,
          id_wallet: data.id_wallet,
          nama: data.nama,
          nama_bank: data.nama_bank,
          no_rekening: data.no_rekening,
          nama_pemilik_rekening: data.nama_pemilik_rekening,
          nominal: data.nominal,
          jenis: data.jenis,
          bukti_pembayaran: data.bukti_pembayaran,
          status: data.status,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        wallet: walletData,
        user: userData[0],
      };
    })
  );

  if (!formattedData || formattedData.length === 0) {
    const error = new Error("No withdraw saldo found");
    (error as any).statusCode = 404;
    throw error;
  }

  return formattedData;
}

export async function payMember(
  id_user: string,
  topUp: any
): Promise<{ message: string }> {
  const user = await getUserById(id_user);

  const walletPokok = await createWallet({
    id_user: id_user,
    jenis_wallet: "SIMPANAN POKOK",
  });

  const walletWajib = await createWallet({
    id_user: id_user,
    jenis_wallet: "SIMPANAN WAJIB",
  });

  await db
    .insert(TopupTable)
    .values({
      id_wallet: walletPokok.id,
      nama: user.nama,
      jenis: "SIMPANAN POKOK",
      nominal: 50000,
      ...topUp,
    })
    .execute();

  await db
    .insert(TopupTable)
    .values({
      id_wallet: walletWajib.id,
      nama: user.nama,
      jenis: "SIMPANAN WAJIB",
      nominal: 120000,
      ...topUp,
    })
    .execute();

  await updateUserStatus(id_user, "MENUNGGU KONFIRMASI");

  return { message: "Topup has been created, awaiting payment confirmation" };
}

// export async function payTopup(id_user: string, topUp: any): Promise<{ message: string }> {
//   const user = await getUserById(id_user);

//   const wallet = await getWalletSaldoByUserId(id_user);

//   console.log(topUp);

//   // await axios.post(`${walletServiceUrl}/topup/create`, {
//   //   id_wallet: wallet.data.id,
//   //   nama: user.nama,
//   //   ...topUp,
//   // });

//   console.log(await axios.post(`${walletServiceUrl}/topup/create`, {
//     id_wallet: wallet.data.id,
//     nama: user.nama,
//     ...topUp,
//   }));

//   return { message: "Topup has been created, awaiting payment confirmation" };
// }

export async function payTopup(
  id_user: string,
  topUp: any
): Promise<{ message: string }> {
  try {
    const user = await getUserById(id_user);
    const wallet = await getWalletSaldoByUserId(id_user);

    if (!wallet || !wallet.data || !wallet.data.id) {
      throw new Error("Wallet not found for the specified user");
    }

    console.log("Wallet Data:", wallet.data);
    console.log("TopUp Data:", topUp);

    const absoluteFilePath = path.join(
      __dirname,
      "../../assets",
      topUp.bukti_pembayaran
    );

    const fileContent = fs.readFileSync(absoluteFilePath);

    const boundary = "--------------------------" + Date.now().toString(16);
    let formParts = [];

    formParts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="id_wallet"\r\n\r\n${wallet.data.id}\r\n`
      ),
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="nama"\r\n\r\n${user.nama}\r\n`
      )
    );

    Object.entries(topUp).forEach(([key, value]) => {
      if (key !== "bukti_pembayaran") {
        formParts.push(
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
          )
        );
      }
    });

    const fileName = path.basename(absoluteFilePath);
    formParts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="bukti_pembayaran"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
      ),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );

    const formData = Buffer.concat(formParts);

    const walletServiceUrl = process.env.WALLET_URL || "http://localhost:3001";
    await axios.post(`${walletServiceUrl}/topup/create`, formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": formData.length,
      },
    });

    return { message: "Topup has been created, awaiting payment confirmation" };
  } catch (error) {
    console.error("Error creating top-up:", error);
    throw error;
  }
}

export async function accTopup(id: string): Promise<{ message: string }> {
    const tes = await axios.get(`${walletServiceUrl}/topup/${id}`);
    console.log(tes);
    const topup = await axios.put(`${walletServiceUrl}/topup/acc/${id}`);
    if (topup.status !== 200) {
      const error = new Error("Failed to update topup status");
      (error as any).statusCode = 500;
      throw error;
    }

  return { message: "Topup has been confirmed" };
}

export async function withdrawSaldo(
  id_user: string,
  topup: any
): Promise<{ message: string }> {
  const user = await getUserById(id_user);

  const topupData = {
    id_user: id_user,
    nama: user.nama,
    ...topup,
  };

  try {
    const response = await axios.post(
      `${walletServiceUrl}/topup/withdraw`,
      topupData
    );

    return {
      message: "Withdraw has been created, awaiting payment confirmation",
    };
  } catch (error: any) {
    console.error("Error sending withdrawSaldo request:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create withdraw request"
    );
  }
}

export async function accWithdrawSaldo(
  id: string,
  body: any
): Promise<{ message: string }> {
  try {
    const absoluteFilePath = path.join(
      __dirname,
      "../../assets",
      body.bukti_pembayaran
    );

    const fileContent = fs.readFileSync(absoluteFilePath);

    const boundary = "--------------------------" + Date.now().toString(16);

    let formParts = [];

    Object.entries(body).forEach(([key, value]) => {
      if (key !== "bukti_pembayaran") {
        formParts.push(
          Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
          )
        );
      }
    });

    const fileName = path.basename(absoluteFilePath);
    formParts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="bukti_pembayaran"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`
      ),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );

    const formData = Buffer.concat(formParts);

    const response = await axios.put(
      `${walletServiceUrl}/topup/withdraw/${id}`,
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": formData.length,
        },
      }
    );

    return { message: "Withdraw has been confirmed" };
  } catch (error) {
    console.error("Error confirming withdraw:", error);
    throw error;
  }
}

export async function paySimpananWajib(
  id_user: string,
  topUp: any
): Promise<{ message: string }> {
  const user = await getUserById(id_user);

  const wallet = await getWalletWajibByUserId(id_user);

  await db
    .insert(TopupTable)
    .values({
      id_wallet: wallet.id,
      nama: user.nama,
      jenis: "SIMPANAN WAJIB",
      status: "MENUNGGU KONFIRMASI",
      ...topUp,
    })
    .execute();

  return {
    message: "Simpanan Wajib has been created, awaiting payment confirmation",
  };
}

export async function accSimpananWajib(
  id: string
): Promise<{ message: string }> {
  const topup = await db
    .update(TopupTable)
    .set({ status: "SUKSES", updated_at: new Date() })
    .where(eq(TopupTable.id, id))
    .returning({ id_wallet: TopupTable.id_wallet, nominal: TopupTable.nominal })
    .execute();
  const wallet = await getWalletById(topup[0].id_wallet);
  await db
    .update(WalletTable)
    .set({ saldo: wallet.saldo + topup[0].nominal, updated_at: new Date() })
    .where(eq(WalletTable.id, topup[0].id_wallet))
    .execute();

  return { message: "Simpanan Wajib has been confirmed" };
}

export async function getBagianPemilikPelaksana(search?: string) {
  const query = db.select().from(TopupTable);

  if (search) {
    query.where(like(TopupTable.nama, `%${search}%`));
  }

  const topUp = await query
    .where(
      or(eq(TopupTable.jenis, "PEMILIK"), eq(TopupTable.jenis, "PELAKSANA"))
    )
    .orderBy(desc(TopupTable.created_at))
    .execute();

  if (!topUp || topUp.length === 0) {
    const error = new Error("No bagian pemilik pengelola found");
    (error as any).statusCode = 404;
    throw error;
  }
  return topUp;
}

export async function payBagianPemilikPelaksana(
  body: any
): Promise<{ message: string }> {
  const topup = getTopupById(body.id);
  if (!topup) {
    const error = new Error("Bagian Pemilik / Pelaksana not found");
    (error as any).statusCode = 404;
    throw error;
  }
  await db
    .update(TopupTable)
    .set({ status: "SUKSES", updated_at: new Date(), ...body })
    .where(eq(TopupTable.id, body.id))
    .execute();
  return { message: "Pembayaran pemilik / pelaksana telah dikonfirmasi" };
}
