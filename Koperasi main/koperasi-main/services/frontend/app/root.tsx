import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PreventFlashOnWrongTheme, Theme, ThemeProvider, useTheme } from "remix-themes";
import { Toaster } from "sonner";
import { Button } from "./components/ui/button";
import { useJWTPayload } from "./hooks/use-jwt-payload";
import { cn } from "./lib/clsx";
import { httpClient } from "./lib/http";
import { queryClientConfig } from "./lib/react-query";
import { authenticator } from "./sessions/auth.server";
import type { AuthJwtPayload } from "./types/constants/jwt-payload";
import "./tailwind.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Koperasi Produksi RSB" },
    {
      name: "description",
      content:
        "Koperasi Produksi Rejeki Berkah adalah koperasi yang bergerak dalam bidang produksi dan distribusi hasil pertanian. Kami berkomitmen untuk memberikan kesejahteraan bagi anggota koperasi dan masyarakat sekitar melalui prinsip-prinsip koperasi.",
    },
    {
      name: "keywords",
      content: "koperasi, produksi, pertanian, distribusi, kesejahteraan, kesehatan, masyarakat",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // const { getTheme } = await themeSessionResolver(request);
  const token = await authenticator.isAuthenticated(request);

  return {
    theme: Theme.LIGHT,
    ENV: {
      API_BASE_URL: process.env.API_BASE_URL,
      WALLET_BASE_URL: process.env.WALLET_BASE_URL,
    },
    token: token,
  };
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));
  const { setJWTPayload } = useJWTPayload();
  const authHeader = data.token ? `Bearer ${data.token}` : undefined;
  const navigate = useNavigate();
  const fetcher = useFetcher();

  useMemo(() => {
    httpClient.defaults.headers.common.Authorization = authHeader;
    return () => {
      httpClient.defaults.headers.common.Authorization = undefined;
    };
  }, [authHeader]);

  const handleUnauthorized = useCallback(() => {
    fetcher.submit({}, { method: "POST", action: "/action/logout" });
    setJWTPayload({} as AuthJwtPayload);
    httpClient.defaults.headers.common.Authorization = undefined;
    navigate("/auth/login");
  }, [setJWTPayload, navigate, fetcher]);

  useEffect(() => {
    if (authHeader) {
      const jwtPayload = jwtDecode<AuthJwtPayload>(authHeader);
      setJWTPayload(jwtPayload);
    }
    window.addEventListener("UNAUTHORIZED", handleUnauthorized);
    return () => {
      setJWTPayload({} as AuthJwtPayload);
      window.removeEventListener("UNAUTHORIZED", handleUnauthorized);
    };
  }, [handleUnauthorized, authHeader, setJWTPayload]);

  return (
    <html
      lang="en"
      className={cn("!antialiased scroll-smooth", cn(theme))}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Toaster closeButton position="top-right" richColors />
          <Outlet />
          <ReactQueryDevtools initialIsOpen={false} />
          <ScrollRestoration />
          <Scripts />
          <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: to set ENV from loader
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}

export default function AppWithThemeProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html suppressHydrationWarning lang="en" className={cn("!antialiased scroll-smooth")}>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-primary/10">
          <img src="/img/404.svg" alt="error-avatar" className="mb-5 size-96" />
          <h1 className="mb-3 font-extrabold text-6xl text-primary">
            Oops! Telah terjadi kesalahan
          </h1>
          {isRouteErrorResponse(error) ? (
            <p className="mb-3 font-extrabold text-6xl text-primary">Error {error.status}</p>
          ) : null}
          <p className="mb-5 font-bold text-3xl text-primary">
            {isRouteErrorResponse(error) ? error.statusText : "Silahkan coba kembali."}
          </p>
          <Button className="~text-lg/2xl !py-6" asChild>
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
