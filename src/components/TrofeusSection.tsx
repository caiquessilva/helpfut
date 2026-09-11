import { useRef, useState } from "react";
import { Trophy, X, ImagePlus } from "lucide-react";
import { Card, Field, Input, Textarea, Button } from "@/components/ui-kit";
import { useStore, type Trofeu } from "@/lib/store";
import { lerArquivoComoDataUrl } from "@/lib/imagem";

const vazio = { titulo: "", ano: "", descricao: "", foto: "" };

export function TrofeusSection() {
  const { trofeus, setTrofeus } = useStore();
  const [form, setForm] = useState(vazio);
  const [aberto, setAberto] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Trophy className="size-4 text-primary" /> Troféus
        </h2>
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
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setForm({ ...form, foto: await lerArquivoComoDataUrl(file) });
            }}
          />
          <div className="flex items-center gap-3">
            <Button variant="ghost" type="button" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-4" /> Escolher foto
            </Button>
            {form.foto ? (
              <img src={form.foto} alt="Prévia da conquista" className="size-12 rounded-lg object-cover" />
            ) : null}
          </div>
          <Button className="w-full" onClick={adicionar}>
            Salvar troféu
          </Button>
        </div>
      ) : null}

      {trofeus.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Nenhum troféu cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {trofeus.map((t) => (
            <div key={t.id} className="relative overflow-hidden rounded-xl border border-border">
              <button
                aria-label={`Remover ${t.titulo}`}
                onClick={() => setTrofeus(trofeus.filter((x) => x.id !== t.id))}
                className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground"
              >
                <X className="size-3.5" />
              </button>
              <div className="grid h-24 place-items-center bg-secondary">
                {t.foto ? (
                  <img src={t.foto} alt={t.titulo} className="size-full object-cover" />
                ) : (
                  <Trophy className="size-9 text-primary" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-bold text-primary">{t.ano}</p>
                <p className="text-sm font-semibold text-foreground">{t.titulo}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
