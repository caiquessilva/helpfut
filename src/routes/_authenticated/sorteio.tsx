import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { Page, Card, Button } from "@/components/ui-kit";
import { estatisticas, scoreTotal, sortearTimes, useStore, type TimeSorteado } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/sorteio")({
  head: () => ({
    meta: [
      { title: "Sorteio Inteligente de Times | HELPFUT" },
      {
        name: "description",
        content:
          "Snake draft automático que equilibra pontuação e média de idade entre Time Verde e Time Colete.",
      },
      { property: "og:title", content: "Sorteio Inteligente de Times | HELPFUT" },
      {
        property: "og:description",
        content: "Times equilibrados em segundos com o algoritmo snake draft do HELPFUT.",
      },
    ],
  }),
  component: Sorteio,
});

function Sorteio() {
  const { jogadores } = useStore();
  const [times, setTimes] = useState<[TimeSorteado, TimeSorteado] | null>(null);
  const presentes = jogadores.filter((j) => j.presente);

  return (
    <Page title="Sorteio" subtitle={`${presentes.length} jogadores presentes`}>
      <Button className="mb-4 w-full" onClick={() => setTimes(sortearTimes(presentes))}>
        <Shuffle className="size-4" /> Sortear times
      </Button>

      {!times ? (
        <p className="text-center text-sm text-muted-foreground">
          Marque a presença no Rachão e toque em sortear.
        </p>
      ) : (
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 text-sm font-bold text-foreground">Comparativo</h2>
            {(() => {
              const a = estatisticas(times[0]);
              const b = estatisticas(times[1]);
              const linhas: [string, string, string][] = [
                ["Jogadores", String(a.n), String(b.n)],
                ["Pontuação total", String(a.total), String(b.total)],
                ["Média de score", a.media.toFixed(2), b.media.toFixed(2)],
                ["Média de idade", a.idade.toFixed(1), b.idade.toFixed(1)],
              ];
              return (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-muted-foreground">
                      <th className="text-left font-semibold">Métrica</th>
                      <th className="font-semibold text-primary">Verde</th>
                      <th className="font-semibold text-foreground">Colete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map(([m, x, y]) => (
                      <tr key={m} className="border-t border-border">
                        <td className="py-1.5 text-muted-foreground">{m}</td>
                        <td className="py-1.5 text-center font-semibold text-foreground">{x}</td>
                        <td className="py-1.5 text-center font-semibold text-foreground">{y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </Card>

          {times.map((t, i) => {
            const s = estatisticas(t);
            return (
              <Card key={t.nome} className={i === 0 ? "border-primary/60" : undefined}>
                <div className="mb-2 flex items-center justify-between">
                  <h3
                    className={`text-base font-bold ${i === 0 ? "text-primary" : "text-foreground"}`}
                  >
                    {t.nome}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {s.total} pts · média {s.media.toFixed(2)} · {s.idade.toFixed(1)} anos
                  </span>
                </div>
                <ul className="divide-y divide-border">
                  {t.jogadores.map((j) => (
                    <li key={j.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{j.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {j.posicao} · {j.idade} anos
                        </p>
                      </div>
                      <span className="rounded-lg bg-primary/15 px-2 py-1 text-xs font-bold text-primary">
                        {scoreTotal(j)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </Page>
  );
}
