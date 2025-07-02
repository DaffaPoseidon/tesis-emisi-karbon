import { jwtDecode } from "jwt-decode";
import { authenticator } from "~/sessions/auth.server";
import type { AuthJwtPayload } from "~/types/constants/jwt-payload";

export async function isAdmin(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return false;
  const decoded = jwtDecode<AuthJwtPayload>(user);
  return decoded?.role === "ADMIN" && decoded?.status === "AKTIF";
}

export async function isMemberNotActive(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return false;
  const decoded = jwtDecode<AuthJwtPayload>(user);
  return decoded?.role === "BASIC" && decoded?.status === "TIDAK AKTIF";
}

export async function isMemberBasic(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return false;
  const decoded = jwtDecode<AuthJwtPayload>(user);
  return decoded?.role === "BASIC" && decoded?.status === "AKTIF";
}

export async function isMemberPlatinum(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return false;
  const decoded = jwtDecode<AuthJwtPayload>(user);
  return decoded?.role === "PLATINUM" && decoded?.status === "AKTIF";
}

export async function isMemberHasOTP(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return false;
  const decoded = jwtDecode<AuthJwtPayload>(user);
  return decoded?.role === "BASIC" && decoded?.status === "OTP TERKIRIM";
}
