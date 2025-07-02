import { create } from "zustand";
import type { AuthJwtPayload } from "~/types/constants/jwt-payload";

interface JWTPayloadStore {
  jwtPayload: AuthJwtPayload;
  setJWTPayload: (jwtPayload: AuthJwtPayload) => void;
}

export const useJWTPayload = create<JWTPayloadStore>((set) => ({
  jwtPayload: {} as AuthJwtPayload,
  setJWTPayload: (jwtPayload: AuthJwtPayload) => set({ jwtPayload }),
}));
