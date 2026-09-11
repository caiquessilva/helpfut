import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, Users, Shuffle, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const itens = [
  { to: "/time", label: "Time", Icon: Shield },
  { to: "/rachao", label: "Rachão", Icon: Users },
  { to: "/sorteio", label: "Sorteio", Icon: Shuffle },
] as const;

export function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sair = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {itens.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/time" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
        {isAdmin ? (
          <li className="flex-1">
            <Link
              to="/admin"
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
            >
              <ShieldCheck className="size-5" />
              Admin
            </Link>
          </li>
        ) : null}
        <li className="flex-1">
          <button
            type="button"
            onClick={sair}
            className="flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-5" />
            Sair
          </button>
        </li>
      </ul>
    </nav>
  );
}
