import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { SoundProvider } from "@/components/SoundProvider";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vagaja" },
      { name: "description", content: "Vaga Certa Agora is a job board app connecting job seekers and employers with an accessible, mobile-first design." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Vagaja" },
      { property: "og:description", content: "Vaga Certa Agora is a job board app connecting job seekers and employers with an accessible, mobile-first design." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Vagaja" },
      { name: "twitter:description", content: "Vaga Certa Agora is a job board app connecting job seekers and employers with an accessible, mobile-first design." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6e952237-6fa1-4e09-8597-aff9515424ce/id-preview-cd17920a--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app-1779078886347.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6e952237-6fa1-4e09-8597-aff9515424ce/id-preview-cd17920a--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app-1779078886347.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Figtree:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome =
    pathname.startsWith("/empresa") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/cadastro") ||
    pathname.startsWith("/cv/");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        {!hideChrome && <SiteHeader />}
        <div className="flex-1">
          <Outlet />
        </div>
        {!hideChrome && <SiteFooter />}
      </div>
      <Toaster position="top-right" richColors />
      <CookieConsent />
      <SoundProvider />
    </QueryClientProvider>
  );
}
