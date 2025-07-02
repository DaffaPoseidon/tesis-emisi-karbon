import type { TEnv } from "./env";

function isBrowser() {
  return typeof window !== "undefined";
}

function getEnv() {
  return isBrowser()
    ? // biome-ignore lint/suspicious/noExplicitAny: to get .env from window
      ((window as any).ENV as TEnv)
    : process.env;
}

export default getEnv;
