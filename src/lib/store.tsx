import * as React from "react";

export type Periodo = "Manhã" | "Tarde" | "Noite";
export type Dia = "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb" | "Dom";

export interface Disponibilidade {
  dia: Dia;
  horarios: string[];
}

export interface Time {
  nome: string;
  escudo: string;
  bio: string;
  instagram: string;
  whatsapp: string;
  email: string;
  
  cep: string;
  rua: string;
  cidade: string;
  disponibilidade: Disponibilidade[];
  mando: "Mandante" | "Visitante";
}

export interface Trofeu {
  id: string;
  titulo: string;
  ano: string;
  descricao: string;
}

export type Posicao = "Goleiro" | "Defesa" | "Meio-campo" | "Ataque";
export type Estrelas = 1 | 2 | 3 | 4 | 5;

export interface Jogador {
  id: string;
  nome: string;
  idade: number;
  posicao: Posicao;
  estrelas: Estrelas;
  presente: boolean;
}

export const ESTRELAS: Estrelas[] = [1, 2, 3, 4, 5];
export const LEGENDA_ESTRELAS: Record<Estrelas, string> = {
  1: "Iniciante / Mais fraco",
  2: "Básico",
  3: "Mediano",
  4: "Bom jogador",
  5: "Craque / Mais forte",
};
export const POSICOES: Posicao[] = ["Goleiro", "Defesa", "Meio-campo", "Ataque"];
export const DIAS: Dia[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
export const PERIODOS: Periodo[] = ["Manhã", "Tarde", "Noite"];

export function pontosIdade(idade: number) {
  if (idade < 25) return 4;
  if (idade <= 39) return 3;
  if (idade <= 49) return 2;
  return 1;
}
export function pontosEstrelas(e: Estrelas | undefined) {
  return (e ?? 3) * 2;
}
export function scoreTotal(j: Jogador) {
  return pontosIdade(j.idade) + pontosEstrelas(j.estrelas);
}

const timeInicial: Time = {
  nome: "Grêmio Várzea FC",
  escudo: "",
  bio: "Time de várzea fundado em 2015. Jogamos por amor à camisa e ao terceiro tempo.",
  instagram: "@gremiovarzeafc",
  whatsapp: "11999998888",
  email: "contato@gremiovarzea.com",
  
  cep: "01001-000",
  rua: "Praça da Sé",
  cidade: "São Paulo",
  disponibilidade: [
    { dia: "Qua", periodos: ["Noite"] },
    { dia: "Sáb", periodos: ["Manhã", "Tarde"] },
  ],
  mando: "Mandante",
};

const trofeusIniciais: Trofeu[] = [
  {
    id: "t1",
    titulo: "Copa Zona Leste",
    ano: "2023",
    descricao: "Campeão invicto, 7 vitórias em 7 jogos.",
  },
  {
    id: "t2",
    titulo: "Torneio da Vila",
    ano: "2021",
    descricao: "Vitória nos pênaltis na final.",
  },
];

function j(
  id: string,
  nome: string,
  idade: number,
  posicao: Posicao,
  estrelas: Estrelas,
): Jogador {
  return { id, nome, idade, posicao, estrelas, presente: true };
}

const jogadoresIniciais: Jogador[] = [
  j("p1", "Marcão", 41, "Goleiro", 4),
  j("p2", "Léo Paredão", 28, "Goleiro", 2),
  j("p3", "Rafa", 22, "Defesa", 5),
  j("p4", "Tião", 36, "Defesa", 3),
  j("p5", "Juninho", 19, "Meio-campo", 4),
  j("p6", "Serginho", 52, "Meio-campo", 2),
  j("p7", "Vitinho", 24, "Ataque", 4),
  j("p8", "Betão", 45, "Ataque", 1),
  j("p9", "Diego", 31, "Defesa", 3),
  j("p10", "Kaio", 20, "Ataque", 3),
  j("p11", "Fernando", 38, "Meio-campo", 5),
  j("p12", "Zeca", 47, "Defesa", 2),
];

interface Store {
  time: Time;
  setTime: (t: Time) => void;
  trofeus: Trofeu[];
  setTrofeus: (t: Trofeu[]) => void;
  jogadores: Jogador[];
  setJogadores: (j: Jogador[]) => void;
}

const Ctx = React.createContext<Store | null>(null);

function usePersisted<T>(key: string, inicial: T) {
  const [state, setState] = React.useState<T>(inicial);
  React.useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        setState(JSON.parse(raw) as T);
      } catch {
        /* ignora */
      }
    }
  }, [key]);
  const set = React.useCallback(
    (v: T) => {
      setState(v);
      localStorage.setItem(key, JSON.stringify(v));
    },
    [key],
  );
  return [state, set] as const;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [time, setTime] = usePersisted("helpfut.time", timeInicial);
  const [trofeus, setTrofeus] = usePersisted("helpfut.trofeus", trofeusIniciais);
  const [jogadoresRaw, setJogadores] = usePersisted("helpfut.jogadores", jogadoresIniciais);
  const jogadores = React.useMemo(
    () => jogadoresRaw.map((p) => ({ ...p, estrelas: (p.estrelas ?? 3) as Estrelas })),
    [jogadoresRaw],
  );
  const value = React.useMemo(
    () => ({ time, setTime, trofeus, setTrofeus, jogadores, setJogadores }),
    [time, setTime, trofeus, setTrofeus, jogadores, setJogadores],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useStore fora do StoreProvider");
  return ctx;
}

export interface TimeSorteado {
  nome: string;
  jogadores: Jogador[];
}

export function sortearTimes(presentes: Jogador[]): [TimeSorteado, TimeSorteado] {
  const goleiros = presentes
    .filter((p) => p.posicao === "Goleiro")
    .sort((a, b) => scoreTotal(b) - scoreTotal(a));
  const linha = presentes
    .filter((p) => p.posicao !== "Goleiro")
    .sort((a, b) => scoreTotal(b) - scoreTotal(a));

  const a: Jogador[] = [];
  const b: Jogador[] = [];
  if (goleiros[0]) a.push(goleiros[0]);
  if (goleiros[1]) b.push(goleiros[1]);
  goleiros.slice(2).forEach((g) => linha.push(g));

  // Snake draft: A, B, B, A, A, B...
  linha.forEach((p, i) => {
    const rodada = Math.floor(i / 2);
    const paraA = i % 2 === (rodada % 2 === 0 ? 0 : 1);
    (paraA ? a : b).push(p);
  });

  // Ajuste fino de idade média trocando jogadores de score igual
  return [
    { nome: "Time Verde", jogadores: a },
    { nome: "Time Colete", jogadores: b },
  ];
}

export function estatisticas(t: TimeSorteado) {
  const n = t.jogadores.length || 1;
  const total = t.jogadores.reduce((s, p) => s + scoreTotal(p), 0);
  const idade = t.jogadores.reduce((s, p) => s + p.idade, 0) / n;
  return { total, media: total / n, idade, n: t.jogadores.length };
}
