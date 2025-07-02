export type AuthJwtPayload = {
  id: string;
  role: "BASIC" | "ADMIN" | "PLATINUM";
  status: "AKTIF" | "TIDAK AKTIF" | "OTP TERKIRIM";
  exp: number;
};
