import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Instagram, Mail, MessageCircle, Camera } from "lucide-react";
import { Page, Card, Field, Input, Textarea, Button, Chip } from "@/components/ui-kit";
import { TrofeusSection } from "@/components/TrofeusSection";
import { lerArquivoComoDataUrl } from "@/lib/imagem";
import { DIAS, useStore, type Dia } from "@/lib/store";

const DIA_LONGO: Record<Dia, string> = {
  Seg: "Segunda",
  Ter: "Terça",
  Qua: "Quarta",
  Qui: "Quinta",
  Sex: "Sexta",
  Sáb: "Sábado",
  Dom: "Domingo",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HELPFUT — Perfil do Time de Várzea" },
      {
        name: "description",
        content:
          "Monte o perfil do seu time de futebol amador: escudo, contatos, endereço por CEP, dias de jogo e troféus.",
      },
      { property: "og:title", content: "HELPFUT — Perfil do Time de Várzea" },
      {
        property: "og:description",
        content: "Gestão completa do seu time de várzea: perfil, contatos, disponibilidade e conquistas.",
      },
    ],
  }),
  component: Varzea,
});

function Varzea() {
  const { time, setTime } = useStore();
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [novoHorario, setNovoHorario] = useState<Partial<Record<Dia, string>>>({});
  const [admin, setAdmin] = useState(false);
  const [diaAberto, setDiaAberto] = useState<Dia | null>(null);

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

  const horariosDoDia = (dia: Dia) => time.disponibilidade.find((d) => d.dia === dia)?.horarios ?? [];

  const setHorarios = (dia: Dia, horarios: string[]) => {
    const ordenados = [...new Set(horarios)].sort();
    const existe = time.disponibilidade.some((d) => d.dia === dia);
    const lista = (existe
      ? time.disponibilidade.map((d) => (d.dia === dia ? { ...d, horarios: ordenados } : d))
      : [...time.disponibilidade, { dia, horarios: ordenados }]
    ).filter((d) => d.horarios.length > 0);
    setTime({ ...time, disponibilidade: lista });
  };

  const adicionarHorario = (dia: Dia) => {
    const hora = novoHorario[dia];
    if (!hora) return;
    setHorarios(dia, [...horariosDoDia(dia), hora]);
    setNovoHorario({ ...novoHorario, [dia]: "" });
  };

  const agenda = DIAS.map((dia) => ({ dia, horarios: horariosDoDia(dia) })).filter(
    (d) => d.horarios.length > 0,
  );

  const instaUser = time.instagram.trim().replace(/^@/, "").replace(/^https?:\/\/.*instagram\.com\//, "");
  const zap = time.whatsapp.replace(/\D/g, "");
  const email = time.email.trim();

  return (
    <Page title="Meu Time" subtitle="Perfil, contatos e conquistas">
      <div className="space-y-4">
        <Card className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="grid size-20 place-items-center overflow-hidden rounded-full border-2 border-primary bg-secondary">
              {time.escudo ? (
                <img
                  src={time.escudo}
                  alt={`Escudo do ${time.nome}`}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-primary">
                  {time.nome.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Enviar escudo do time"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setTime({ ...time, escudo: await lerArquivoComoDataUrl(file) });
              }}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Field label="Nome do time">
              <Input value={time.nome} onChange={(e) => setTime({ ...time, nome: e.target.value })} />
            </Field>
            {time.escudo ? (
              <button
                type="button"
                className="text-xs font-semibold text-muted-foreground"
                onClick={() => setTime({ ...time, escudo: "" })}
              >
                Remover escudo
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">Toque na câmera para enviar o escudo.</p>
            )}
          </div>
        </Card>

        <Card className="space-y-3">
          <Field label="Biografia">
            <Textarea value={time.bio} onChange={(e) => setTime({ ...time, bio: e.target.value })} />
          </Field>
          <Field label="Instagram">
            <Input
              placeholder="@seutime"
              value={time.instagram}
              onChange={(e) => setTime({ ...time, instagram: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              placeholder="11999998888"
              inputMode="tel"
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

          {instaUser || zap || email ? (
            <div className="flex gap-2 pt-1">
              {instaUser ? (
                <a
                  href={`https://instagram.com/${instaUser}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir Instagram do time"
                  className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                >
                  <Instagram className="size-5" />
                </a>
              ) : null}
              {zap ? (
                <a
                  href={`https://wa.me/${zap.length > 11 ? zap : `55${zap}`}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Conversar no WhatsApp"
                  className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                >
                  <MessageCircle className="size-5" />
                </a>
              ) : null}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  aria-label="Enviar e-mail"
                  className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary transition-colors hover:bg-primary/25"
                >
                  <Mail className="size-5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Sede do Time</h2>
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
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <h2 className="truncate text-sm font-bold text-foreground">Dias e horários de jogo</h2>
            <button
              type="button"
              onClick={() => {
                setAdmin(!admin);
                setDiaAberto(null);
              }}
              className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground"
            >
              {admin ? "Concluir" : "Editar agenda"}
            </button>
          </div>

          {admin ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {DIAS.map((dia) => (
                  <Chip
                    key={dia}
                    active={horariosDoDia(dia).length > 0 || diaAberto === dia}
                    className="px-2.5 py-1.5 text-xs uppercase"
                    onClick={() => setDiaAberto(diaAberto === dia ? null : dia)}
                  >
                    {dia}
                  </Chip>
                ))}
              </div>

              {diaAberto ? (
                <div className="space-y-2 rounded-xl bg-secondary/60 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      aria-label={`Horário de jogo em ${DIA_LONGO[diaAberto]}`}
                      className="w-32"
                      value={novoHorario[diaAberto] ?? ""}
                      onChange={(e) => setNovoHorario({ ...novoHorario, [diaAberto]: e.target.value })}
                    />
                    <Button type="button" onClick={() => adicionarHorario(diaAberto)}>
                      Adicionar
                    </Button>
                  </div>
                  {horariosDoDia(diaAberto).length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {horariosDoDia(diaAberto).map((h) => (
                        <Chip
                          key={h}
                          active
                          className="px-2.5 py-1 text-xs"
                          onClick={() =>
                            setHorarios(
                              diaAberto,
                              horariosDoDia(diaAberto).filter((x) => x !== h),
                            )
                          }
                        >
                          {h} ✕
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Nenhum horário em {DIA_LONGO[diaAberto]}.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Toque em um dia para definir o horário.</p>
              )}
            </div>
          ) : null}

          {agenda.length ? (
            <div className="flex flex-wrap gap-2">
              {agenda.flatMap((d) =>
                d.horarios.map((h) => (
                  <span
                    key={`${d.dia}-${h}`}
                    className="whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold leading-tight text-primary"
                  >
                    {DIA_LONGO[d.dia]} · {h}
                  </span>
                )),
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum dia de jogo definido ainda.</p>
          )}
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

        <TrofeusSection />
      </div>
    </Page>
  );
}
