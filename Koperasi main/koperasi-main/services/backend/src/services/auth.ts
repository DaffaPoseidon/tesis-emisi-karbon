import { db } from "../drizzle/db.js";
import { UserTable } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const register = async (user: any): Promise<{ success: boolean; message: string; statusCode: number }> => {
  try {
    const tanggalLahir = typeof user.tanggal_lahir === "string" ? user.tanggal_lahir : user.tanggal_lahir.toISOString().split('T')[0];

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const userData = {
      ...user,
      password: hashedPassword,
      tanggal_lahir: tanggalLahir,
    };

    await db.insert(UserTable).values(userData).execute();

    return { success: true, message: "User successfully registered", statusCode: 201 };
  } catch (e: any) {
    console.error(e);

    if (e.code === "23505" && e.detail.includes("Key (no_hp)")) {
      return { success: false, message: "Phone number is already in use by another user", statusCode: 409 };
    }

    return { success: false, message: "User unsuccessfully registered", statusCode: 400 };
  }
};

export async function login(no_hp: string, password: string): Promise<any> {
  try {
    const user = await db.select().from(UserTable).where(eq(UserTable.no_hp, no_hp)).limit(1).execute();

    if (!user[0] || !(await bcrypt.compare(password, user[0].password))) {
      const error = new Error("Invalid username or password");
      (error as any).statusCode = 401;
      throw error;
    }

    return user[0];
  } catch (error) {
    console.error(error);
    if ((error as any).statusCode) {
      throw error;
    }
    const e = new Error("Login failed due to server error");
    (e as any).statusCode = 500;
    throw e;
  }
}
