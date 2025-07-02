import { type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import { httpClient } from "~/lib/http";
import { authenticator } from "~/sessions/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/auth/login");
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  try {
    await httpClient.post("/auth/logout");
    httpClient.defaults.headers.common.Authorization = undefined;
  } catch (error) {
    console.error("Error during API logout:", error);
  }

  await authenticator.logout(request, { redirectTo: "/auth/login" });

  return redirect("/auth/login");
};
