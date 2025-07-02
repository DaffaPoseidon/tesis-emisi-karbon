import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { isMemberPlatinum } from "~/lib/middleware";

export async function loader({ request }: LoaderFunctionArgs) {
  const isPlatinum = await isMemberPlatinum(request);
  if (!isPlatinum) {
    return redirect("/app");
  }
  return { isPlatinum };
}
