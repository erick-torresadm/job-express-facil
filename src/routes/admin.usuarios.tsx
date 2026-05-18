import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, User } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { listarUsuariosAdmin } from "@/lib/admin.functions";

type RoleFilter = "todos" | "candidato" | "empresa" | "admin";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Admin · Usuários" }, { name: "robots", content: "noindex" }] }),
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const [role, setRole] = useState<RoleFilter>("todos");
  const [busca, setBusca] = useState("");
  const fetchUsers = useServerFn(listarUsuariosAdmin);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["admin-usuarios", role, busca],
    queryFn: () => fetchUsers({ data: { role, busca: busca.trim() || undefined } }),
  });

  return (
    <AdminShell title="Usuários">
      <div className="flex flex-wrap items-center gap-2">
        {(["todos", "candidato", "empresa", "admin"] as const).map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              role === r ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}>{r}</button>
        ))}
        <div className="ml-auto flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 sm:w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, empresa ou WhatsApp..."
            className="h-9 flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Roles</th>
              <th className="hidden px-4 py-3 md:table-cell">WhatsApp</th>
              <th className="hidden px-4 py-3 md:table-cell">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>}
            {!isLoading && usuarios?.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Ninguém por aqui.</td></tr>
            )}
            {usuarios?.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{u.company_name || u.full_name || "(sem nome)"}</p>
                      {u.handle && <p className="truncate text-[11px] text-muted-foreground">@{u.handle}</p>}
                    </div>
                    {u.verificada && <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    {u.roles.map((r) => (
                      <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        r === "admin" ? "bg-accent text-accent-foreground"
                        : r === "empresa" ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground"
                      }`}>{r}</span>
                    ))}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{u.whatsapp ?? "—"}</td>
                <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
