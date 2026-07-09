import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORIAS_FREELA, getMeuFreelancer, upsertMeuFreelancer } from "@/lib/freelas.functions";

export const Route = createFileRoute("/freelancer/perfil")({
  component: FreelaPerfilEdit,
});

type FormState = {
  handle: string;
  nome: string;
  headline: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  categoria_principal: string;
  skills: string;
  cidade: string;
  estado: string;
  atende_remoto: boolean;
  nivel: "" | "junior" | "pleno" | "senior" | "especialista";
  disponibilidade: "imediata" | "ate_15d" | "ate_30d" | "indisponivel";
  valor_hora_min: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
  behance: string;
  site: string;
  notif_email: boolean;
  notif_email_endereco: string;
  notif_wa: boolean;
};

const empty: FormState = {
  handle: "",
  nome: "",
  headline: "",
  bio: "",
  avatar_url: "",
  cover_url: "",
  categoria_principal: "",
  skills: "",
  cidade: "",
  estado: "",
  atende_remoto: true,
  nivel: "",
  disponibilidade: "imediata",
  valor_hora_min: "",
  whatsapp: "",
  instagram: "",
  linkedin: "",
  behance: "",
  site: "",
  notif_email: true,
  notif_email_endereco: "",
  notif_wa: false,
};

function FreelaPerfilEdit() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: freela } = useQuery({ queryKey: ["meu-freelancer"], queryFn: () => getMeuFreelancer() });
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (freela) {
      setForm({
        handle: freela.handle,
        nome: freela.nome,
        headline: freela.headline ?? "",
        bio: freela.bio ?? "",
        avatar_url: freela.avatar_url ?? "",
        cover_url: freela.cover_url ?? "",
        categoria_principal: freela.categoria_principal,
        skills: (freela.skills ?? []).join(", "),
        cidade: freela.cidade ?? "",
        estado: freela.estado ?? "",
        atende_remoto: freela.atende_remoto,
        nivel: (freela.nivel as any) ?? "",
        disponibilidade: freela.disponibilidade as any,
        valor_hora_min: freela.valor_hora_min?.toString() ?? "",
        whatsapp: freela.whatsapp ?? "",
        instagram: freela.instagram ?? "",
        linkedin: freela.linkedin ?? "",
        behance: freela.behance ?? "",
        site: freela.site ?? "",
        notif_email: (freela as any).notif_email ?? true,
        notif_email_endereco: (freela as any).notif_email_endereco ?? "",
        notif_wa: (freela as any).notif_wa ?? false,
      });
    }
  }, [freela]);

  const save = useMutation({
    mutationFn: () =>
      upsertMeuFreelancer({
        data: {
          handle: form.handle,
          nome: form.nome,
          headline: form.headline || null,
          bio: form.bio || null,
          avatar_url: form.avatar_url || null,
          cover_url: form.cover_url || null,
          categoria_principal: form.categoria_principal,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 15),
          cidade: form.cidade || null,
          estado: form.estado || null,
          atende_remoto: form.atende_remoto,
          nivel: form.nivel || null,
          disponibilidade: form.disponibilidade,
          valor_hora_min: form.valor_hora_min ? Number(form.valor_hora_min) : null,
          whatsapp: form.whatsapp || null,
          instagram: form.instagram || null,
          linkedin: form.linkedin || null,
          behance: form.behance || null,
          site: form.site || null,
          notif_email: form.notif_email,
          notif_email_endereco: form.notif_email_endereco || null,
          notif_wa: form.notif_wa,
        },
      }),
    onSuccess: (res) => {
      toast.success("Perfil salvo!");
      qc.invalidateQueries({ queryKey: ["meu-freelancer"] });
      if (!freela) navigate({ to: "/freelas/p/$handle", params: { handle: res.handle } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold">{freela ? "Editar perfil" : "Criar perfil freelancer"}</h1>
        <p className="text-sm text-muted-foreground">
          Sua vitrine pública ficará em <code className="rounded bg-secondary px-1">/freelas/p/{form.handle || "seu-handle"}</code>
        </p>
      </div>

      <Section title="Identidade">
        <Field label="Nome público *" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
        <Field
          label="Handle * (só letras minúsculas, números e hífen)"
          value={form.handle}
          onChange={(v) => setForm({ ...form, handle: v.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
          required
        />
        <Field label="Headline (uma linha)" value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} placeholder="Ex: Designer gráfico especializado em identidade visual" />
        <TextArea label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} rows={5} />
        <Field label="URL do avatar" value={form.avatar_url} onChange={(v) => setForm({ ...form, avatar_url: v })} placeholder="https://…" />
        <Field label="URL da capa" value={form.cover_url} onChange={(v) => setForm({ ...form, cover_url: v })} placeholder="https://…" />
      </Section>

      <Section title="Trabalho">
        <div>
          <Label>Categoria principal *</Label>
          <select
            required
            value={form.categoria_principal}
            onChange={(e) => setForm({ ...form, categoria_principal: e.target.value })}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm"
          >
            <option value="">Escolha…</option>
            {CATEGORIAS_FREELA.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <Field label="Habilidades (vírgula)" value={form.skills} onChange={(v) => setForm({ ...form, skills: v })} placeholder="Photoshop, Figma, Illustrator" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nível</Label>
            <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value as any })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
              <option value="">—</option>
              <option value="junior">Júnior</option>
              <option value="pleno">Pleno</option>
              <option value="senior">Sênior</option>
              <option value="especialista">Especialista</option>
            </select>
          </div>
          <div>
            <Label>Disponibilidade</Label>
            <select value={form.disponibilidade} onChange={(e) => setForm({ ...form, disponibilidade: e.target.value as any })} className="w-full rounded-xl border border-border bg-background p-3 text-sm">
              <option value="imediata">Imediata</option>
              <option value="ate_15d">Em até 15 dias</option>
              <option value="ate_30d">Em até 30 dias</option>
              <option value="indisponivel">Indisponível</option>
            </select>
          </div>
        </div>
        <Field label="Valor/hora mínimo (R$)" type="number" value={form.valor_hora_min} onChange={(v) => setForm({ ...form, valor_hora_min: v })} />
      </Section>

      <Section title="Localização">
        <div className="grid grid-cols-[1fr_100px] gap-3">
          <Field label="Cidade" value={form.cidade} onChange={(v) => setForm({ ...form, cidade: v })} />
          <Field label="UF" value={form.estado} onChange={(v) => setForm({ ...form, estado: v.toUpperCase().slice(0, 2) })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.atende_remoto} onChange={(e) => setForm({ ...form, atende_remoto: e.target.checked })} />
          Atendo projetos remotos
        </label>
      </Section>

      <Section title="Contato & redes">
        <Field label="WhatsApp (com DDD)" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="11999998888" />
        <Field label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} placeholder="@seuhandle" />
        <Field label="LinkedIn (URL)" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} />
        <Field label="Behance (URL)" value={form.behance} onChange={(v) => setForm({ ...form, behance: v })} />
        <Field label="Site pessoal (URL)" value={form.site} onChange={(v) => setForm({ ...form, site: v })} />
      </Section>

      <Section title="Notificações de novos orçamentos">
        <p className="text-xs text-muted-foreground">
          Escolha como quer ser avisado quando um cliente pedir orçamento. Você não perde nenhum
          serviço mesmo offline.
        </p>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
          <input
            type="checkbox"
            checked={form.notif_email}
            onChange={(e) => setForm({ ...form, notif_email: e.target.checked })}
            className="mt-1 h-4 w-4"
          />
          <div className="flex-1">
            <p className="text-sm font-bold">📧 Receber por email</p>
            <p className="text-[11px] text-muted-foreground">
              Enviamos os dados do cliente + botão de responder no WhatsApp.
            </p>
          </div>
        </label>
        {form.notif_email && (
          <Field
            label="Email pra notificação (opcional — padrão é o email da conta)"
            type="email"
            value={form.notif_email_endereco}
            onChange={(v) => setForm({ ...form, notif_email_endereco: v })}
            placeholder="voce@email.com"
          />
        )}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3">
          <input
            type="checkbox"
            checked={form.notif_wa}
            onChange={(e) => setForm({ ...form, notif_wa: e.target.checked })}
            className="mt-1 h-4 w-4"
          />
          <div className="flex-1">
            <p className="text-sm font-bold">
              💬 Alerta no WhatsApp{" "}
              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
                em breve
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Vamos avisar no seu WhatsApp assim que a opção estiver ativa. Já pode marcar.
            </p>
          </div>
        </label>
      </Section>



      <button
        type="submit"
        disabled={save.isPending}
        className="w-full rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft hover:scale-[1.01] transition disabled:opacity-50"
      >
        {save.isPending ? "Salvando…" : freela ? "Salvar alterações" : "Publicar perfil"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold text-muted-foreground">{children}</label>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background p-3 text-sm"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
    </div>
  );
}
