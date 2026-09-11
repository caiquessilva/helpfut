import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { Ban, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StoreProvider } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui-kit";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: access, error: accessError } = await supabase.rpc("bootstrap_current_account");
    if (accessError || !access?.[0]) throw redirect({ to: "/auth" });
    return { user: data.user, isAdmin: access[0].is_admin, isBlocked: access[0].is_blocked };
  },
  component: TeamLayout,
});

function TeamLayout() {
  const { user, isAdmin, isBlocked } = Route.useRouteContext();
  if (isBlocked) return <BlockedAccount />;
  return (
    <StoreProvider userId={user.id}>
      <Outlet />
      <BottomNav isAdmin={isAdmin} />
    </StoreProvider>
  );
}

function BlockedAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sair = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5">
      <section className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
        <Ban className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Conta bloqueada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O acesso deste time foi suspenso. Entre em contato com a administração do HELPFUT.
        </p>
        <Button className="mt-5 w-full" variant="ghost" onClick={sair}>
          <LogOut className="size-4" /> Sair da conta
        </Button>
      </section>
    </main>
  );
}