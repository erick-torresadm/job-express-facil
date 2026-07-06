import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  Send,
  Heart,
  Bell,
  FileText,
  User as UserIcon,
  LogOut,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Counts = { candidaturas: number; salvas: number; alertas: number };

interface Props {
  perfilNome: string;
  perfilInicial: string;
  avatarUrl?: string | null;
  counts: Counts;
}

type NavItem = {
  to: "/candidato" | "/candidato/vagas" | "/candidato/candidaturas" | "/candidato/salvas" | "/candidato/alertas" | "/candidato/curriculo" | "/perfil";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  key: string;
};

const nav: NavItem[] = [
  { to: "/candidato", label: "Painel", icon: LayoutDashboard, exact: true, key: "painel" },
  { to: "/candidato/vagas", label: "Vagas pra você", icon: Search, key: "vagas" },
  { to: "/candidato/candidaturas", label: "Candidaturas", icon: Send, key: "candidaturas" },
  { to: "/candidato/salvas", label: "Salvas", icon: Heart, key: "salvas" },
  { to: "/candidato/alertas", label: "Alertas", icon: Bell, key: "alertas" },
  { to: "/candidato/curriculo", label: "Currículo", icon: FileText, key: "curriculo" },
  { to: "/perfil", label: "Perfil", icon: UserIcon, key: "perfil" },
];

export function AppSidebarCandidato({ perfilNome, perfilInicial, avatarUrl, counts }: Props) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const badgeFor = (key: string) => {
    if (key === "candidaturas") return counts.candidaturas || null;
    if (key === "salvas") return counts.salvas || null;
    if (key === "alertas") return counts.alertas || null;
    return null;
  };

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const sair = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu");
    navigate({ to: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/candidato"
          className="flex items-center gap-2 px-2 py-2 text-sidebar-foreground"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold leading-none">VagasAgora</p>
            <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Área do candidato
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const Icon = item.icon;
                const badge = badgeFor(item.key);
                const active = isActive(item.to, item.exact);
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.to} className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge != null && (
                          <span
                            className={`ml-auto min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold group-data-[collapsible=icon]:hidden ${
                              active
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : "bg-sidebar-accent text-sidebar-accent-foreground"
                            }`}
                          >
                            {badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/40 p-2 text-sidebar-foreground">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-sidebar-primary text-sm font-extrabold text-sidebar-primary-foreground">
            {avatarUrl ? (
              <img src={avatarUrl} alt={perfilNome} className="h-full w-full object-cover" />
            ) : (
              perfilInicial
            )}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold leading-none">{perfilNome}</p>
            <p className="mt-1 truncate text-[10px] text-sidebar-foreground/60">
              Candidato
            </p>
          </div>
          <button
            onClick={sair}
            title="Sair"
            aria-label="Sair"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
