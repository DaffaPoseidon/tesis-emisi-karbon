import { and, desc, eq, like } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import {
  SignatureAdminTable,
  TopupTable,
  UserTable,
  WalletTable,
} from "../drizzle/schema.js";
import { sendTextWA } from "./baileys.js";
import axios from "axios";
import dotenv from "dotenv";
import * as fs from "fs";
import path from 'path';
import { walletServiceUrl } from "../main.js";

export async function getAllUser(
  search?: string,
  filter?: { [key: string]: string | undefined }
) {
  const query = db.select().from(UserTable).orderBy(desc(UserTable.created_at));

  if (filter) {
    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        switch (key) {
          case "status":
            query.where(
              eq(
                UserTable.status,
                filter[key] as
                  | "AKTIF"
                  | "TIDAK AKTIF"
                  | "DITOLAK"
                  | "MENUNGGU KONFIRMASI"
                  | "OTP TERKIRIM"
              )
            );
            break;
          default:
            const error = new Error("No users found");
            (error as any).statusCode = 404;
            throw error;
        }
      }
    });
  }

  if (search) {
    query.where(like(UserTable.nama, `%${search}%`));
  }

  const users = await query.execute();
  if (users.length === 0) {
    const error = new Error("No users found");
    (error as any).statusCode = 404;
    throw error;
  }
  return users;
}

export async function countUser() {
  const users = await db.select().from(UserTable).execute();
  return users.length;
}

export async function getUserById(id: string) {
  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, id))
    .limit(1)
    .execute();

  if (!user[0]) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const responseData = {
    id: user[0].id,
    nama: user[0].nama,
    no_hp: user[0].no_hp,
    role: user[0].role,
    status: user[0].status,
    password: user[0].password,
    tempat_lahir: user[0].tempat_lahir,
    tanggal_lahir: user[0].tanggal_lahir,
    provinsi: user[0].provinsi,
    kota: user[0].kota,
    kecamatan: user[0].kecamatan,
    alamat: user[0].alamat,
    nik: user[0].nik,
    foto_profile: user[0].foto_profile,
    foto_diri: user[0].foto_diri,
    foto_ktp: user[0].foto_ktp,
    created_at: user[0].created_at,
    updated_at: user[0].updated_at,
    otp: user[0].otp,
  };

  if (user[0].role === "ADMIN") {
    const adminSignature = await db
      .select()
      .from(SignatureAdminTable)
      .where(eq(SignatureAdminTable.id_user, id))
      .orderBy(desc(SignatureAdminTable.created_at))
      .limit(1)
      .execute();

    return {
      ...responseData,
      signature: adminSignature[0]?.signature || null,
    };
  }

  return responseData;
}

export async function updateUserById(user: any, id: string) {
  return await db.transaction(async (tx) => {
    const existingUser = await tx
      .select({
        id: UserTable.id,
        role: UserTable.role,
        foto_ktp: UserTable.foto_ktp,
        foto_diri: UserTable.foto_diri,
        foto_profile: UserTable.foto_profile,
      })
      .from(UserTable)
      .where(eq(UserTable.id, id))
      .limit(1)
      .execute();

    if (existingUser.length === 0) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const userData = existingUser[0];
    const isAdmin = userData.role === "ADMIN";

    const { signature, ...restUserData } = user;

    const updatedData = {
      ...restUserData,
      foto_ktp: restUserData.foto_ktp || userData.foto_ktp,
      foto_diri: restUserData.foto_diri || userData.foto_diri,
      foto_profile: restUserData.foto_profile || userData.foto_profile,
    };

    await tx
      .update(UserTable)
      .set(updatedData)
      .where(eq(UserTable.id, id))
      .execute();

    if (isAdmin && signature) {
      await tx
        .insert(SignatureAdminTable)
        .values({
          id_user: id,
          signature,
        })
        .execute();
    }

    return {
      message: "User successfully updated",
      status: "success",
      data: {
        id,
        ...updatedData,
        ...(isAdmin && signature ? { signature } : {}),
      },
    };
  });
}

export async function deleteUserById(id: string) {
  await getUserById(id);
  await db.delete(UserTable).where(eq(UserTable.id, id)).execute();
}

export async function updateUserStatus(id: string, status: any) {
  await getUserById(id);
  await db
    .update(UserTable)
    .set({ status })
    .where(eq(UserTable.id, id))
    .execute();
}

export async function sendOtp(id: string) {
  const user = await getUserById(id);

  const topupData = await db
    .select({
      topup: TopupTable,
      wallet: WalletTable,
    })
    .from(TopupTable)
    .innerJoin(WalletTable, eq(TopupTable.id_wallet, WalletTable.id))
    .where(eq(WalletTable.id_user, id))
    .execute();

  if (topupData.length === 0) {
    const error = new Error("No topup data found for this user");
    (error as any).statusCode = 404;
    throw error;
  }

  for (const { topup, wallet } of topupData) {
    if (!topup || !wallet) {
      const error = new Error("Topup or Wallet data is missing");
      (error as any).statusCode = 500;
      throw error;
    }

    await db
      .update(TopupTable)
      .set({ status: "SUKSES", updated_at: new Date() })
      .where(eq(TopupTable.id, topup.id)) // Update hanya topup ini
      .execute();
    await db
      .update(WalletTable)
      .set({ saldo: wallet.saldo + topup.nominal, updated_at: new Date() })
      .where(eq(WalletTable.id, wallet.id))
      .execute();
  }

  const otp = Math.floor(Math.random() * 9999);
  const otpCode = otp.toString().padStart(4, "0");

  await db
    .update(UserTable)
    .set({ otp: otpCode, updated_at: new Date(), status: "OTP TERKIRIM" })
    .where(eq(UserTable.id, id))
    .execute();

  if (user.no_hp) {
    const message = `*${otpCode}* adalah kode verifikasi Anda. Gunakan kode ini untuk verifikasi akun Koperasi Anda.`;
    await sendTextWA(user.no_hp, message);
  } else {
    console.log("Phone number not available for this user");
  }
}

export async function verifyOtp(id: string, otp: string) {
  await getUserById(id);
  const user = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, id))
    .limit(1)
    .execute();
  if (!user[0]) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }
  if (user[0].otp === otp) {
    await db
      .update(UserTable)
      .set({ status: "AKTIF" })
      .where(eq(UserTable.id, id))
      .execute();
  } else {
    throw new Error("Invalid OTP");
  }
}

export async function rejectUserById(id: string, message: string) {
  const user = await getUserById(id);
  await updateUserStatus(id, "DITOLAK");
  if (user.no_hp) {
    const msg = `Maaf, akun Anda ditolak oleh admin karena ${message}`;
    await sendTextWA(user.no_hp, msg);
  } else {
    console.log("Phone number not available for this user");
  }
}

export async function getPhoneNumberAdmin() {
  const admin = await db
    .select({ no_hp: UserTable.no_hp })
    .from(UserTable)
    .where(eq(UserTable.role, "ADMIN"))
    .limit(1)
    .execute();
  console.log("admin", admin);

  if (!admin[0].no_hp) {
    const error = new Error("Phone number not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return admin[0];
}

export async function upgradeUserToPlatinum(
  id: string,
  nominal: number | undefined,
  topUp: any,
  filePath: string
) {
  try {
    const user = await getUserById(id);
    const walletUrl = process.env.WALLET_URL || "http://localhost:3001";
    let walletSaldo;

    try {
      const response = await axios.get(`${walletUrl}/wallet/user/${id}`);
      walletSaldo = response.data.data.id;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.message?.includes("not found")
      ) {
        console.log("No wallet found, will create new one");
        const response = await axios.post(`${walletUrl}/wallet/create`, {
          id_user: id,
        });
        walletSaldo = response.data.data.id;
      } else {
        throw error;
      }
    }

    const pembayaranWajib = 1000000;
    const nominalSetor =
      pembayaranWajib + (nominal ? parseInt(nominal.toString(), 10) : 0);

    const absoluteFilePath = path.join(__dirname, "../../assets", filePath);
    
    const fileContent = fs.readFileSync(absoluteFilePath);

    const boundary = '--------------------------' + Date.now().toString(16);
    
    let formParts = [];
    
    formParts.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="id_wallet"\r\n\r\n${walletSaldo}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="nama"\r\n\r\n${user.nama}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="nama_bank"\r\n\r\n${topUp.nama_bank}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="no_rekening"\r\n\r\n${topUp.no_rekening}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="nama_pemilik_rekening"\r\n\r\n${topUp.nama_pemilik_rekening}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="nominal"\r\n\r\n${nominalSetor}\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="jenis"\r\n\r\nUPGRADE USER\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="status"\r\n\r\nMENUNGGU KONFIRMASI\r\n`)
    );

    const fileName = path.basename(absoluteFilePath);
    formParts.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="bukti_pembayaran"; filename="${fileName}"\r\nContent-Type: image/png\r\n\r\n`),
      fileContent,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );

    const formData = Buffer.concat(formParts);

    const createTopup = await axios.post(
      `${walletUrl}/topup/create`,
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': formData.length
        }
      }
    );

    console.log("Topup created successfully via API:", createTopup.data);

    return {
      message: "Upgrade user has been created, awaiting payment confirmation",
    };
  } catch (error) {
    console.error("Error upgrading user:", error);
    throw error;
  }
}

export async function accUpgradeUserToPlatinum(id: string) {
  try {
    const topup = await axios.get(`${walletServiceUrl}/topup/${id}`);
    if (!topup) {
      const error = new Error("Topup not found");
      (error as any).statusCode = 404;
      throw error;
    }
    const wallet = await axios.get(`${walletServiceUrl}/wallet/${topup.data.data[0].topup.id_wallet}`);
    if (!wallet) {
      const error = new Error("Wallet not found");
      (error as any).statusCode = 404;
      throw error;
    }

    const response = await axios.put(`${walletServiceUrl}/topup/acc/${id}`);
    if (!response) {
      const error = new Error("Error accepting topup");
      (error as any).statusCode = 500;
      throw error;
    }

    await db
      .update(UserTable)
      .set({ role: "PLATINUM", updated_at: new Date() })
      .where(eq(UserTable.id, wallet.data.data.id_user))
      .execute();

    return { message: "Upgrade user has been confirmed" };
  } catch (error) {
    console.error("Error acc upgrading user:", error);
    throw error;
  }
}
