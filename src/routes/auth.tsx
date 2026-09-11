import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";
import { Button, Card, Field, Input, Page } from "@/components/ui-kit";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar no seu time | HELPFUT" },
      { name: "description", content: "Entre ou crie a conta exclusiva do seu time no HELPFUT." },
      { property: "og:title", content: "Entrar no seu time | HELPFUT" },
      { property: "og:description", content: "Acesso seguro aos dados exclusivos do seu time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/time" });
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    setCarregando(true);
    setMensagem("");
    const result = modo === "entrar"
      ? await supabase.auth.signInWithPassword({ email, password: senha })
      : await supabase.auth.signUp({ email, password: senha, options: { emailRedirectTo: window.location.origin } });
    setCarregando(false);
    if (result.error) return setMensagem(result.error.message);
    if (modo === "criar" && !result.data.session) {
      setMensagem("Confira seu e-mail e confirme a conta para entrar.");
      return;
    }
    await navigate({ to: "/time", replace: true });
  };

  const entrarGoogle = async () => {
    setCarregando(true);
    setMensagem("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setCarregando(false);
      setMensagem(result.error.message);
      return;
    }
    if (!result.redirected) await navigate({ to: "/time", replace: true });
  };

  return (
    <Page title="Sua conta do time" subtitle="Dados privados e exclusivos para sua equipe">
      <Card className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {(["entrar", "criar"] as const).map((item) => (
            <Button key={item} type="button" variant={modo === item ? "primary" : "ghost"} className="w-full" onClick={() => setModo(item)}>
              {item === "entrar" ? "Entrar" : "Criar conta"}
            </Button>
          ))}
        </div>
        <form className="space-y-3" onSubmit={enviar}>
          <Field label="E-mail do time"><Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Senha"><Input type="password" autoComplete={modo === "entrar" ? "current-password" : "new-password"} minLength={6} required value={senha} onChange={(e) => setSenha(e.target.value)} /></Field>
          <Button type="submit" className="w-full" disabled={carregando}>
            <LogIn className="size-4" /> {carregando ? "Aguarde..." : modo === "entrar" ? "Entrar no time" : "Criar conta do time"}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
        <Button type="button" variant="ghost" className="w-full" disabled={carregando} onClick={entrarGoogle}>Continuar com Google</Button>
        {mensagem ? <p className="text-center text-sm text-muted-foreground" role="status">{mensagem}</p> : null}
      </Card>
    </Page>
  );
}