import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { X, Star } from "lucide-react";
import { Page, Card, Field, Input, Select, Button } from "@/components/ui-kit";
import {
  ESTRELAS,
  LEGENDA_ESTRELAS,
  POSICOES,
  scoreTotal,
  useStore,
  type Estrelas,
  type Jogador,
  type Posicao,
} from "@/lib/store";

function SeletorEstrelas({
  valor,
  onChange,
}: {
  valor: Estrelas;
  onChange: (v: Estrelas) => void;
}) {
  return (
    <div>
      <div className="flex gap-1.5">
        {ESTRELAS.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrela${n > 1 ? "s" : ""} — ${LEGENDA_ESTRELAS[n]}`}
            onClick={() => onChange(n)}
            className="p-0.5"
          >
            <Star
              className={
                n <= valor
                  ? "size-7 fill-primary text-primary"
                  : "size-7 text-muted-foreground"
              }
            />
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs font-semibold text-primary">
        {valor} ★ — {LEGENDA_ESTRELAS[valor]}
      </p>
      <ul className="mt-1 space-y-0.5 text-[11px] leading-tight text-muted-foreground">
        {ESTRELAS.map((n) => (
          <li key={n}>
            {n} estrela{n > 1 ? "s" : ""} = {LEGENDA_ESTRELAS[n]}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createFileRoute("/rachao")({
  head: () => ({
    meta: [
      { title: "Rachão — Jogadores e Presença | HELPFUT" },
      {
        name: "description",
        content:
          "Cadastre jogadores com score automático por idade, nível técnico e fôlego, e marque a presença do dia.",
      },
      { property: "og:title", content: "Rachão — Jogadores e Presença | HELPFUT" },
      {
        property: "og:description",
        content: "Lista de presença e pontuação automática dos jogadores do rachão.",
      },
    ],
  }),
  component: Rachao,
});

const vazio = {
  nome: "",
  idade: "25",
  posicao: "Meio-campo" as Posicao,
  estrelas: 3 as Estrelas,
};

function Rachao() {
  const { jogadores, setJogadores } = useStore();
  const [form, setForm] = useState(vazio);
  const presentes = jogadores.filter((j) => j.presente).length;

  const adicionar = () => {
    if (!form.nome.trim()) return;
    const novo: Jogador = {
      id: crypto.randomUUID(),
      nome: form.nome,
      idade: Number(form.idade) || 0,
      posicao: form.posicao,
      estrelas: form.estrelas,
      presente: true,
    };
    setJogadores([...jogadores, novo]);
    setForm(vazio);
  };

  const toggle = (id: string) =>
    setJogadores(jogadores.map((j) => (j.id === id ? { ...j, presente: !j.presente } : j)));

  return (
    <Page title="Rachão" subtitle={`${presentes} de ${jogadores.length} confirmados para hoje`}>
      <Card className="mb-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Novo jogador</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Nome">
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </Field>
          </div>
          <Field label="Idade">
            <Input
              inputMode="numeric"
              value={form.idade}
              onChange={(e) => setForm({ ...form, idade: e.target.value })}
            />
          </Field>
          <Field label="Posição">
            <Select
              value={form.posicao}
              onChange={(e) => setForm({ ...form, posicao: e.target.value as Posicao })}
            >
              {POSICOES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <div className="col-span-2">
            <Field label="Avaliação geral">
              <SeletorEstrelas
                valor={form.estrelas}
                onChange={(v) => setForm({ ...form, estrelas: v })}
              />
            </Field>
          </div>
        </div>
        <Button className="w-full" onClick={adicionar}>
          Cadastrar jogador
        </Button>
      </Card>

      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Lista de presença</h2>
          <button
            className="text-xs font-semibold text-primary"
            onClick={() => setJogadores(jogadores.map((j) => ({ ...j, presente: presentes !== jogadores.length })))}
          >
            {presentes === jogadores.length ? "Desmarcar todos" : "Marcar todos"}
          </button>
        </div>
        <ul className="divide-y divide-border">
          {jogadores.map((j) => (
            <li key={j.id} className="flex items-center gap-3 py-2.5">
              <input
                type="checkbox"
                checked={j.presente}
                onChange={() => toggle(j.id)}
                className="size-5 accent-[var(--primary)]"
                aria-label={`Presença de ${j.nome}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{j.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {j.posicao} · {j.idade} anos · {j.nivel} · {j.folego}
                </p>
              </div>
              <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs font-bold text-primary">
                {scoreTotal(j)} pts
              </span>
              <button
                aria-label={`Remover ${j.nome}`}
                onClick={() => setJogadores(jogadores.filter((x) => x.id !== j.id))}
                className="text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Link to="/sorteio" className="mt-4 block">
        <Button className="w-full">Ir para o sorteio</Button>
      </Link>
    </Page>
  );
}
