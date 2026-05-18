import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Camera, Image as ImageIcon, Check, ArrowLeft, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMeuPerfil, updateMeuPerfil, sugerirHandle, type PerfilSocial } from "@/lib/social.functions";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — VagasAgora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilEditPage,
});

function PerfilEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<PerfilSocial | null>(null);
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.navigate({ to: "/auth" });
        return;
      }
      try {
        const p = await getMeuPerfil();
        if (!p) throw new Error("Perfil não encontrado");
        setPerfil(p);
        setBio(p.bio_social ?? "");
        setFullName(p.full_name ?? p.company_name ?? "");
        setAvatar(p.avatar_url);
        setCover(p.cover_url);
        if (p.handle) {
          setHandle(p.handle);
        } else {
          const sug = await sugerirHandle();
          setHandle(sug.handle);
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const uploadFile = async (file: File, tipo: "avatar" | "cover") => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw new Error("Sessão expirada");
    if (file.size > 5 * 1024 * 1024) throw new Error("Imagem precisa ter até 5MB");
    if (!file.type.startsWith("image/")) throw new Error("Envie uma imagem (jpg, png, webp)");
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().slice(0, 4);
    const path = `${u.user.id}/${tipo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("social-media").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabase.storage.from("social-media").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, "avatar");
      setAvatar(url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setUploadingCover(true);
    try {
      const url = await uploadFile(file, "cover");
      setCover(url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setUploadingCover(false);
      e.target.value = "";
    }
  };

  const salvar = async () => {
    setErro(null);
    setSaving(true);
    try {
      const h = handle.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(h)) {
        throw new Error("@handle precisa ter 3-30 letras minúsculas, números ou _");
      }
      await updateMeuPerfil({
        data: {
          handle: h,
          bio_social: bio.trim() || null,
          avatar_url: avatar,
          cover_url: cover,
          full_name: fullName.trim() || undefined,
        },
      });
      setSavedAt(Date.now());
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-bold text-destructive">{erro ?? "Erro ao carregar perfil"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      <div className="mx-auto max-w-2xl">
        {/* Capa */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary to-primary/60 md:h-64 md:rounded-b-3xl">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
          <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/80 px-3 py-1.5 text-xs font-bold backdrop-blur hover:bg-background">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-4 py-2 text-xs font-bold backdrop-blur shadow-pop hover:bg-background disabled:opacity-60"
          >
            {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            {uploadingCover ? "Enviando…" : "Mudar capa"}
          </button>
          <input ref={coverInput} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        {/* Avatar */}
        <div className="relative -mt-16 px-4 md:px-6">
          <div className="relative inline-block">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-background bg-secondary text-4xl font-extrabold text-secondary-foreground shadow-pop">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{(fullName || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInput.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-pop disabled:opacity-60"
              aria-label="Mudar foto"
            >
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-5 w-5" />}
            </button>
            <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Formulário */}
          <div className="mt-6 space-y-5 rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
            <h1 className="text-xl font-extrabold">Editar meu perfil</h1>

            <Field label="Nome de exibição">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                placeholder="Seu nome ou nome da empresa"
                className="h-12 w-full rounded-xl border-2 border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>

            <Field label="@ Handle (único, usado na URL)">
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  maxLength={30}
                  placeholder="seu_usuario"
                  className="h-12 w-full rounded-xl border-2 border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Seu perfil ficará em: <span className="font-mono font-bold text-foreground">/u/{handle || "..."}</span>
              </p>
            </Field>

            <Field label={`Bio (${bio.length}/500)`}>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                rows={4}
                placeholder="Conta um pouco sobre você, suas habilidades, o que você procura…"
                className="w-full rounded-xl border-2 border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </Field>

            {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}

            <div className="flex items-center justify-between gap-3">
              {perfil.handle && (
                <Link
                  to="/u/$handle"
                  params={{ handle: perfil.handle }}
                  className="text-sm font-semibold text-muted-foreground underline hover:text-foreground"
                >
                  Ver perfil público
                </Link>
              )}
              <button
                onClick={salvar}
                disabled={saving}
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-pop disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? "Salvando…" : savedAt && Date.now() - savedAt < 3000 ? "Salvo ✓" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
