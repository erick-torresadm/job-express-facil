import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Eye, FileText, Send, Eye as EyeOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getRecruiterFeed, countUnreadEvents, getRecruiterEventsSummary, type RecruiterEvent } from "@/lib/recruiter-notifications.server";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/empresa/atividade")({
  head: () => ({
    meta: [
      { title: "Atividade — VagasAgora" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EmpresaAtividade,
});

function EmpresaAtividade() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<RecruiterEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [summary, setSummary] = useState({ vaga_views: 0, cv_clicks: 0, candidaturas: 0 });

  const fetchFeed = useServerFn(getRecruiterFeed);
  const fetchUnread = useServerFn(countUnreadEvents);
  const fetchSummary = useServerFn(getRecruiterEventsSummary);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [f, u, s] = await Promise.all([fetchFeed(), fetchUnread(), fetchSummary()]);
        setFeed(f);
        setUnreadCount(u.unread);
        setSummary(s);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao carregar atividade");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`recruiter_events:empresa_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recruiter_events",
          filter: `empresa_id=eq.${user.id}`,
        },
        (payload) => {
          // Reload feed on new events
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchFeed, fetchUnread, fetchSummary]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <p className="text-gray-600">Você precisa estar autenticado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/empresa" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Atividade</h1>
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount} não lida{unreadCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <p className="text-gray-600">Acompanhe as ações dos candidatos nas suas vagas</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <SummaryCard
            title="Visualizações"
            count={summary.vaga_views}
            icon={<Eye className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            title="Currículos Vistos"
            count={summary.cv_clicks}
            icon={<FileText className="w-5 h-5" />}
            color="purple"
          />
          <SummaryCard
            title="Candidaturas"
            count={summary.candidaturas}
            icon={<Send className="w-5 h-5" />}
            color="green"
          />
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              <p>Carregando atividade...</p>
            </div>
          ) : feed.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <EyeOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Nenhuma atividade ainda</p>
              <p className="text-sm mt-1">As ações dos candidatos aparecerão aqui</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {feed.map((event) => (
                <li key={event.id} className={`p-4 hover:bg-gray-50 transition ${!event.lido ? "bg-blue-50" : ""}`}>
                  <EventRow event={event} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  count,
  icon,
  color,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green";
}) {
  const bgColors = {
    blue: "bg-blue-50",
    purple: "bg-purple-50",
    green: "bg-green-50",
  };
  const textColors = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };
  const iconBgColors = {
    blue: "bg-blue-100",
    purple: "bg-purple-100",
    green: "bg-green-100",
  };

  return (
    <div className={`${bgColors[color]} rounded-lg p-4 border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${textColors[color]}`}>{count}</p>
        </div>
        <div className={`${iconBgColors[color]} p-3 rounded-lg ${textColors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: RecruiterEvent }) {
  const timeAgo = getTimeAgo(new Date(event.timestamp));

  let description = "";
  let icon = null;
  let iconBg = "bg-gray-100 text-gray-600";

  if (event.tipo === "vaga_view") {
    description = `Alguém visualizou sua vaga${event.vaga ? `: ${event.vaga.titulo}` : ""}`;
    icon = <Eye className="w-4 h-4" />;
    iconBg = "bg-blue-100 text-blue-600";
  } else if (event.tipo === "cv_click") {
    description = `Você visualizou o currículo de ${event.curriculo?.nome || "um candidato"}`;
    icon = <FileText className="w-4 h-4" />;
    iconBg = "bg-purple-100 text-purple-600";
  } else if (event.tipo === "candidatura_received") {
    description = `Nova candidatura${event.vaga ? ` para ${event.vaga.titulo}` : ""}${event.curriculo ? ` de ${event.curriculo.nome}` : ""}`;
    icon = <Send className="w-4 h-4" />;
    iconBg = "bg-green-100 text-green-600";
  }

  return (
    <div className="flex items-start gap-4">
      <div className={`${iconBg} p-2 rounded-lg flex-shrink-0 mt-1`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 font-medium text-sm">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
        {!event.lido && (
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
            Não lida
          </span>
        )}
      </div>
      {event.vaga?.slug && event.tipo === "vaga_view" && (
        <Link
          to="/vagas/$slug"
          params={{ slug: event.vaga.slug }}
          className="text-primary hover:text-primary/80 text-sm font-medium flex-shrink-0"
          target="_blank"
        >
          Ver vaga
        </Link>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Agora mesmo";
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;

  return date.toLocaleDateString("pt-BR");
}
