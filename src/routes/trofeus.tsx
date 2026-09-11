import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, X } from "lucide-react";
import { Page, Card, Field, Input, Textarea, Button } from "@/components/ui-kit";
import { useStore, type Trofeu } from "@/lib/store";

export const Route = createFileRoute("/trofeus")({
  head: () => ({
    meta: [
      { title: "Troféus e Conquistas | HELPFUT" },
      {
        name: "description",
        content: "Galeria de títulos do seu time de várzea com ano, descrição e foto de cada conquista.",
      },
      { property: "og:title", content: "Troféus e Conquistas | HELPFUT" },
      {
        property: "og:description",
        content: "Registre e exiba todos os títulos conquistados pelo seu time amador.",
      },
    ],
  }),
  component: Trofeus,
});

const vazio = { titulo: "", ano: "", descricao: "", foto: "" };

function Trofeus() {
  const { trofeus, setTrofeus } = useStore();
  const [form, setForm] = useState(vazio);

  const adicionar = () => {
    if (!form.titulo.trim()) return;
    const novo: Trofeu = { id: crypto.randomUUID(), ...form };
    setTrofeus([novo, ...trofeus]);
    setForm(vazio);
  };

  return (
    <Page title="Troféus" subtitle="A sala de troféus do time">
      <Card className="mb-4 space-y-3">
        <h2 className="text-sm font-bold text-foreground">Nova conquista</h2>
        <Field label="Título">
          <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
        </Field>
        <Field label="Ano">
          <Input
            inputMode="numeric"
            value={form.ano}
            onChange={(e) => setForm({ ...form, ano: e.target.value })}
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </Field>
        <Field label="URL da foto">
          <Input
            placeholder="https://..."
            value={form.foto}
            onChange={(e) => setForm({ ...form, foto: e.target.value })}
          />
        </Field>
        <Button className="w-full" onClick={adicionar}>
          Adicionar troféu
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {trofeus.map((t) => (
          <Card key={t.id} className="relative overflow-hidden p-0">
            <button
              aria-label={`Remover ${t.titulo}`}
              onClick={() => setTrofeus(trofeus.filter((x) => x.id !== t.id))}
              className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground"
            >
              <X className="size-3.5" />
            </button>
            <div className="grid h-28 place-items-center bg-secondary">
              {t.foto ? (
                <img src={t.foto} alt={t.titulo} className="size-full object-cover" />
              ) : (
                <Trophy className="size-10 text-primary" />
              )}
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-primary">{t.ano}</p>
              <p className="text-sm font-semibold text-foreground">{t.titulo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.descricao}</p>
            </div>
          </Card>
        ))}
      </div>
      {trofeus.length === 0 ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">Nenhum troféu cadastrado ainda.</p>
      ) : null}
    </Page>
  );
}
