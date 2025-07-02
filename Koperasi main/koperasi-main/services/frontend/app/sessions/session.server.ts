import { createCookieSessionStorage } from "@remix-run/node";
import { env } from "~/lib/env";

const key = env.SECRET_COOKIE_PASSWORD;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax", // this helps with CSRF
    path: "/", // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    maxAge: 60 * 60 * 24 * 7,
    secrets: [key],
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
