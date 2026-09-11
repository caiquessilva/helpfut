import { Link } from "@tanstack/react-router";
import { Shield, Trophy, Users, Shuffle } from "lucide-react";

const itens = [
  { to: "/", label: "Time", Icon: Shield },
  { to: "/trofeus", label: "Troféus", Icon: Trophy },
  { to: "/rachao", label: "Rachão", Icon: Users },
  { to: "/sorteio", label: "Sorteio", Icon: Shuffle },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {itens.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
