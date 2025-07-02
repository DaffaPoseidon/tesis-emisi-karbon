import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { httpClient } from "~/lib/http";
import { sessionStorage } from "./session.server";

export const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const no_hp = form.get("no_hp");
    const password = form.get("password");

    const response = await httpClient.post("/auth/login", {
      no_hp,
      password,
    });

    if (response.status !== 200) {
      throw new Error("Invalid login credentials");
    }

    const { token } = response.data;
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;

    return token;
  }),
  "user-pass",
);
