import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeSessionResolver } from "remix-themes";
import { env } from "~/lib/env";

const key = env.SECRET_COOKIE_PASSWORD;

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [key],
  },
});

export const themeSessionResolver = createThemeSessionResolver(themeStorage);
