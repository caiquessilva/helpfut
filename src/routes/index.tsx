import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Page, Card, Field, Input, Textarea, Button, Chip } from "@/components/ui-kit";
import { DIAS, PERIODOS, useStore, type Dia, type Periodo } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HELPFUT — Perfil do Time de Várzea" },
      {
        name: "description",
        content:
          "Monte o perfil do seu time de futebol amador: escudo, contatos, endereço por CEP e dias de jogo.",
      },
      { property: "og:title", content: "HELPFUT — Perfil do Time de Várzea" },
      {
        property: "og:description",
        content: "Gestão completa do seu time de várzea: perfil, contatos e disponibilidade.",
      },
    ],
  }),
  component: Varzea,
});

function Varzea() {
  const { time, setTime } = useStore();
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const buscarCep = async () => {
    const cep = time.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      setErroCep("Informe um CEP com 8 dígitos.");
      return;
    }
    setErroCep("");
    setBuscando(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = (await res.json()) as {
        logradouro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean | string;
      };
      if (data.erro) {
        setErroCep("CEP não encontrado.");
        return;
      }
      setTime({
        ...time,
        rua: data.logradouro ?? "",
        cidade: data.localidade ? `${data.localidade} - ${data.uf ?? ""}`.trim() : "",
      });
    } catch {
      setErroCep("Não foi possível consultar o CEP agora.");
    } finally {
      setBuscando(false);
    }
  };

  const togglePeriodo = (dia: Dia, periodo: Periodo) => {
    const atual = time.disponibilidade.find((d) => d.dia === dia);
    let lista = time.disponibilidade;
    if (!atual) {
      lista = [...lista, { dia, periodos: [periodo] }];
    } else {
      const periodos = atual.periodos.includes(periodo)
        ? atual.periodos.filter((p) => p !== periodo)
        : [...atual.periodos, periodo];
      lista = lista
        .map((d) => (d.dia === dia ? { ...d, periodos } : d))
        .filter((d) => d.periodos.length > 0);
    }
    setTime({ ...time, disponibilidade: lista });
  };

  const ativo = (dia: Dia, periodo: Periodo) =>
    !!time.disponibilidade.find((d) => d.dia === dia)?.periodos.includes(periodo);

  return (
    <Page title="Meu Time" subtitle="Perfil e gestão do time de várzea">
      <div className="space-y-4">
        <Card className="flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary bg-secondary">
            {time.escudo ? (
              <img src={time.escudo} alt={`Escudo do ${time.nome}`} className="size-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">
                {time.nome.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Field label="Nome do time">
              <Input value={time.nome} onChange={(e) => setTime({ ...time, nome: e.target.value })} />
            </Field>
            <Field label="URL do escudo">
              <Input
                placeholder="https://..."
                value={time.escudo}
                onChange={(e) => setTime({ ...time, escudo: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-3">
          <Field label="Biografia">
            <Textarea value={time.bio} onChange={(e) => setTime({ ...time, bio: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram">
              <Input
                value={time.instagram}
                onChange={(e) => setTime({ ...time, instagram: e.target.value })}
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                value={time.whatsapp}
                onChange={(e) => setTime({ ...time, whatsapp: e.target.value })}
              />
            </Field>
            <Field label="E-mail">
              <Input
                type="email"
                value={time.email}
                onChange={(e) => setTime({ ...time, email: e.target.value })}
              />
            </Field>
            <Field label="Telefone">
              <Input
                value={time.telefone}
                onChange={(e) => setTime({ ...time, telefone: e.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Endereço do campo</h2>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="CEP">
                <Input
                  inputMode="numeric"
                  value={time.cep}
                  onChange={(e) => setTime({ ...time, cep: e.target.value })}
                />
              </Field>
            </div>
            <Button type="button" onClick={buscarCep} disabled={buscando}>
              {buscando ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {erroCep ? <p className="text-xs text-destructive">{erroCep}</p> : null}
          <Field label="Rua">
            <Input value={time.rua} onChange={(e) => setTime({ ...time, rua: e.target.value })} />
          </Field>
          <Field label="Cidade">
            <Input value={time.cidade} onChange={(e) => setTime({ ...time, cidade: e.target.value })} />
          </Field>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Dias de jogo disponíveis</h2>
          <div className="space-y-2">
            {DIAS.map((dia) => (
              <div key={dia} className="flex items-center gap-2">
                <span className="w-10 text-xs font-bold text-muted-foreground">{dia}</span>
                <div className="flex flex-wrap gap-1.5">
                  {PERIODOS.map((p) => (
                    <Chip key={p} active={ativo(dia, p)} onClick={() => togglePeriodo(dia, p)}>
                      {p}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mando de campo
            </span>
            <div className="flex gap-2">
              {(["Mandante", "Visitante"] as const).map((m) => (
                <Chip
                  key={m}
                  active={time.mando === m}
                  className="flex-1 py-2"
                  onClick={() => setTime({ ...time, mando: m })}
                >
                  {m}
                </Chip>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
}
