import { useState } from "react";
import { X } from "lucide-react";
import { Card, Field, Input, Textarea, Button } from "@/components/ui-kit";
import { useStore, type Trofeu } from "@/lib/store";

const vazio = { titulo: "", ano: "", descricao: "" };

export function TrofeusSection() {
  const { trofeus, setTrofeus } = useStore();
  const [form, setForm] = useState(vazio);
  const [aberto, setAberto] = useState(false);

  const adicionar = () => {
    if (!form.titulo.trim()) return;
    const novo: Trofeu = { id: crypto.randomUUID(), ...form };
    setTrofeus([novo, ...trofeus]);
    setForm(vazio);
    setAberto(false);
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Troféus</h2>
        <button className="text-xs font-semibold text-primary" onClick={() => setAberto(!aberto)}>
          {aberto ? "Cancelar" : "+ Nova conquista"}
        </button>
      </div>

      {aberto ? (
        <div className="space-y-3 rounded-xl border border-border bg-background/40 p-3">
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
          <Button className="w-full" onClick={adicionar}>
            Salvar troféu
          </Button>
        </div>
      ) : null}

      {trofeus.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Nenhum troféu cadastrado ainda.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-4">
          {trofeus.map((t) => (
            <li key={t.id} className="relative">
              <button
                aria-label={`Remover ${t.titulo}`}
                onClick={() => setTrofeus(trofeus.filter((x) => x.id !== t.id))}
                className="absolute -left-[1.4rem] top-0 rounded-full bg-background p-0.5 text-muted-foreground"
              >
                <X className="size-3" />
              </button>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-bold text-foreground">{t.titulo}</p>
                <p className="text-xs font-semibold text-primary">{t.ano}</p>
              </div>
              {t.descricao ? (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.descricao}</p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
