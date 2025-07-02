import { createThemeAction } from "remix-themes";
import { themeSessionResolver } from "~/sessions/themes.server";

export const action = createThemeAction(themeSessionResolver);
