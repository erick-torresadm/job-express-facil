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
import { TrendingMenu } from "@/components/TrendingMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/CookieConsent";
import { SoundProvider } from "@/components/SoundProvider";
import { PageViewTracker } from "@/components/PageViewTracker";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PromoLancamentoBanner } from "@/components/PromoLancamentoBanner";

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
      { title: "VagasAgora — Vagas de emprego perto de você, cadastro por áudio em 1 minuto" },
      { name: "description", content: "Ache vagas de emprego CLT, PJ e diária perto de casa. Cadastre seu currículo grátis por áudio em 1 minuto — a IA monta pra você. Empresas verificadas te chamam no WhatsApp." },
      { name: "author", content: "VagasAgora" },
      { name: "theme-color", content: "#0F172A" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "VagasAgora" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "geo.region", content: "BR" },
      { property: "og:site_name", content: "VagasAgora" },
      { property: "og:title", content: "VagasAgora — Emprego perto de você, cadastro por áudio em 1 minuto" },
      { property: "og:description", content: "Vagas CLT, PJ e diária na sua região. Currículo por áudio, contato direto no WhatsApp, empresas verificadas." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VagasAgora — Emprego perto de você" },
      { name: "twitter:description", content: "Vagas CLT, PJ e diária na sua região. Currículo por áudio grátis." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Figtree:wght@400;500;600;700;800&family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "alternate", hrefLang: "pt-BR", href: "https://vagasagora.com.br" },
      { rel: "alternate", hrefLang: "x-default", href: "https://vagasagora.com.br" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/pwa-512.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "VagasAgora",
          url: "https://vagasagora.com.br",
          logo: "https://vagasagora.com.br/favicon.ico",
          sameAs: [],
          areaServed: "BR",
          contactPoint: {
            "@type": "ContactPoint",
            email: "contato@vagasagora.com.br",
            contactType: "customer service",
            areaServed: "BR",
            availableLanguage: ["pt-BR"],
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VagasAgora",
          url: "https://vagasagora.com.br",
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://vagasagora.com.br/vagas/{search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
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
    pathname.startsWith("/cv/") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/candidato") ||
    pathname.startsWith("/u/") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/preview");

  // WhatsApp flutuante: só em áreas de empresa (não candidato)
  const showWhatsApp =
    pathname === "/para-empresas" ||
    pathname === "/planos" ||
    pathname === "/anuncie" ||
    pathname.startsWith("/empresa");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        {!hideChrome && <PromoLancamentoBanner compact />}
        {!hideChrome && <SiteHeader />}
        {!hideChrome && <TrendingMenu />}
        <div className="flex-1">
          <Outlet />
        </div>
        {!hideChrome && <SiteFooter />}
      </div>
      <Toaster position="top-right" richColors />
      <CookieConsent />
      <SoundProvider />
        <PageViewTracker />
        {showWhatsApp && <WhatsAppFloat />}
    </QueryClientProvider>
  );
}
