import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShieldCheck, Building2, Briefcase, Send, Calendar } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { listarEmpresasAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/empresas")({
  head: () => ({ meta: [{ title: "Admin · Empresas" }, { name: "robots", content: "noindex" }] }),
  component: AdminEmpresas,
});

function AdminEmpresas() {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const fetchEmpresas = useServerFn(listarEmpresasAdmin);

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["admin-empresas", busca],
    queryFn: () => fetchEmpresas({ data: { busca: busca.trim() || undefined } }),
  });

  return (
    <AdminShell title="Empresas">
          <div className="mb-5 flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome, CNPJ ou WhatsApp..."
          className="h-9 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="hidden px-4 py-3 md:table-cell">CNPJ</th>
              <th className="hidden px-4 py-3 md:table-cell">WhatsApp</th>
              <th className="px-4 py-3 text-center">Vagas</th>
              <th className="hidden px-4 py-3 text-center md:table-cell">Cand. 7d</th>
              <th className="hidden px-4 py-3 md:table-cell">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>}
            {!isLoading && empresas?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Ninguém por aqui.</td></tr>
            )}
            {empresas?.map((empresa) => (
              <tr
                key={empresa.id}
                className="hover:bg-secondary/40 cursor-pointer"
                onClick={() => navigate({ to: "/admin/empresas/$id", params: { id: empresa.id } })}
              >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{empresa.company_name || "(sem nome)"}</p>
                        {empresa.verificada && (
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                            <p className="text-[11px] text-muted-foreground">Verificada</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{empresa.cnpj ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{empresa.whatsapp ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      <Briefcase className="h-3.5 w-3.5" />
                      {empresa.vagas_ativas}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-center text-xs font-semibold text-foreground md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      <Send className="h-3.5 w-3.5 text-accent/60" />
                      {empresa.candidaturas_7d}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 opacity-60" />
                      {new Date(empresa.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
