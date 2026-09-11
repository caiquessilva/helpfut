import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useServerFn } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, MapPin, Search, ShieldCheck, Users } from "lucide-react";
import { Button, Card, Input } from "@/components/ui-kit";
import { getAdminTeams, setAdminTeamBlocked } from "@/lib/admin.functions";
import type { Dia, Disponibilidade, Jogador, Time } from "@/lib/store";

const DIA_LONGO: Record<Dia, string> = {
  Seg: "Segunda", Ter: "Terça", Qua: "Quarta", Qui: "Quinta", Sex: "Sexta", Sáb: "Sábado", Dom: "Domingo",
};

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (!context.isAdmin) throw redirect({ to: "/time" });
  },
  head: () => ({
    meta: [
      { title: "Administração de Times | HELPFUT" },
      { name: "description", content: "Área administrativa para gestão das contas de times do HELPFUT." },
      { property: "og:title", content: "Administração de Times | HELPFUT" },
      { property: "og:description", content: "Gestão segura de times, agendas, jogadores e acessos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fetchTeams = useServerFn(getAdminTeams);
  const setBlocked = useServerFn(setAdminTeamBlocked);
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [alterando, setAlterando] = useState<string | null>(null);
  const { data: teams = [], isLoading, error } = useQuery({
    queryKey: ["admin-teams"],
    queryFn: () => fetchTeams(),
  });

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return teams;
    return teams.filter((registro) => {
      const time = registro.team as unknown as Time;
      return `${time.nome} ${time.cidade} ${registro.email}`.toLocaleLowerCase("pt-BR").includes(termo);
    });
  }, [busca, teams]);
  const totalPlayers = teams.reduce((total, item) => total + (item.players as unknown as Jogador[]).length, 0);
  const bloqueados = teams.filter((item) => item.is_blocked).length;

  const alternarBloqueio = async (userId: string, isBlocked: boolean) => {
    setAlterando(userId);
    try {
      await setBlocked({ data: { userId, isBlocked: !isBlocked } });
      await queryClient.invalidateQueries({ queryKey: ["admin-teams"] });
    } finally {
      setAlterando(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-6">
      <header className="mb-5 flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="size-6" /></div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">HELPFUT ADMIN</p>
          <h1 className="text-2xl font-bold text-foreground">Gestão de times</h1>
          <p className="mt-1 text-sm text-muted-foreground">Contas, agendas e elencos cadastrados</p>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-3 gap-2" aria-label="Resumo das contas">
        <Resumo label="Times" valor={teams.length} />
        <Resumo label="Jogadores" valor={totalPlayers} />
        <Resumo label="Bloqueados" valor={bloqueados} alerta={bloqueados > 0} />
      </section>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" aria-label="Buscar times" placeholder="Buscar por time, cidade ou e-mail" value={busca} onChange={(event) => setBusca(event.target.value)} />
      </div>

      {isLoading ? <p className="py-12 text-center text-sm text-muted-foreground">Carregando times...</p> : null}
      {error ? <p className="py-12 text-center text-sm text-destructive">Não foi possível carregar os times.</p> : null}
      {!isLoading && !error && filtrados.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">Nenhum time encontrado.</p> : null}

      <div className="space-y-3">
        {filtrados.map((registro) => {
          const time = registro.team as unknown as Time;
          const jogadores = registro.players as unknown as Jogador[];
          const agenda = (time.disponibilidade ?? []) as Disponibilidade[];
          const expandido = aberto === registro.id;
          return (
            <Card key={registro.id} className="overflow-hidden p-0">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-secondary">
                    {time.escudo ? <img src={time.escudo} alt={`Escudo do ${time.nome}`} className="size-full object-cover" /> : <span className="font-black text-primary">{time.nome.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-bold text-foreground">{time.nome}</h2>
                      <span className={registro.is_blocked ? "whitespace-nowrap rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-bold text-destructive" : "whitespace-nowrap rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary"}>{registro.is_blocked ? "Bloqueada" : "Liberada"}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{registro.email}</p>
                    {time.cidade ? <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" /> {time.cidade}</p> : null}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button className="min-w-0 flex-1" variant="ghost" onClick={() => setAberto(expandido ? null : registro.id)} aria-expanded={expandido}>{expandido ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />} Detalhes</Button>
                  <Button disabled={alterando === registro.user_id} variant={registro.is_blocked ? "primary" : "ghost"} className={registro.is_blocked ? "" : "text-destructive"} onClick={() => void alternarBloqueio(registro.user_id, registro.is_blocked)}>{registro.is_blocked ? <CheckCircle2 className="size-4" /> : <Ban className="size-4" />}{alterando === registro.user_id ? "Aguarde" : registro.is_blocked ? "Liberar" : "Bloquear"}</Button>
                </div>
              </div>

              {expandido ? (
                <div className="border-t border-border bg-background/40 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <section>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground"><CalendarDays className="size-4 text-primary" /> Agenda</h3>
                      {agenda.length ? <div className="flex flex-wrap gap-1.5">{agenda.flatMap((item) => item.horarios.map((hora) => <span key={`${item.dia}-${hora}`} className="whitespace-nowrap rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">{DIA_LONGO[item.dia]} · {hora}</span>))}</div> : <p className="text-xs text-muted-foreground">Nenhum horário cadastrado.</p>}
                    </section>
                    <section>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground"><Users className="size-4 text-primary" /> Jogadores ({jogadores.length})</h3>
                      {jogadores.length ? <ul className="max-h-52 divide-y divide-border overflow-y-auto">{jogadores.map((jogador) => <li key={jogador.id} className="flex items-center justify-between gap-2 py-2 text-xs"><span className="font-semibold text-foreground">{jogador.nome}</span><span className="whitespace-nowrap text-muted-foreground">{jogador.posicao} · {jogador.idade} anos · {jogador.estrelas}★</span></li>)}</ul> : <p className="text-xs text-muted-foreground">Nenhum jogador cadastrado.</p>}
                    </section>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </main>
  );
}

function Resumo({ label, valor, alerta = false }: { label: string; valor: number; alerta?: boolean }) {
  return <div className="rounded-xl border border-border bg-card p-3"><strong className={alerta ? "block text-xl text-destructive" : "block text-xl text-primary"}>{valor}</strong><span className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</span></div>;
}