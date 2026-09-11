import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const disponibilidadeSchema = z.object({
  dia: z.enum(["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]),
  horarios: z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).max(12),
});

const teamSchema = z.object({
  nome: z.string().trim().min(1).max(100),
  escudo: z.string().max(1_500_000),
  bio: z.string().max(2000),
  instagram: z.string().max(200),
  whatsapp: z.string().max(30),
  email: z.string().max(254),
  cep: z.string().max(12),
  rua: z.string().max(300),
  cidade: z.string().max(200),
  disponibilidade: z.array(disponibilidadeSchema).max(84),
  mando: z.enum(["Mandante", "Visitante"]),
});

const playerSchema = z.object({
  id: z.string().min(1).max(100),
  nome: z.string().trim().min(1).max(100),
  idade: z.number().int().min(1).max(120),
  posicao: z.enum(["Goleiro", "Defesa", "Meio-campo", "Ataque"]),
  estrelas: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  presente: z.boolean(),
});

const trophySchema = z.object({
  id: z.string().min(1).max(100),
  titulo: z.string().trim().min(1).max(150),
  ano: z.string().max(10),
  descricao: z.string().max(1000),
});

async function assertAdmin(context: {
  supabase: Parameters<Parameters<typeof requireSupabaseAuth>[0]>[0]["context"]["supabase"];
  userId: string;
}) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !isAdmin) throw new Error("Acesso administrativo negado.");
}

export const getAdminTeams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles, error: profilesError }, { data: statuses, error: statusesError }] =
      await Promise.all([
        supabaseAdmin
          .from("team_profiles")
          .select("id, user_id, team, players, trophies, created_at, updated_at")
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("account_status").select("user_id, is_blocked, blocked_at"),
      ]);
    if (profilesError || statusesError) throw new Error("Não foi possível carregar os times.");

    const emails = new Map<string, string>();
    let page = 1;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error("Não foi possível carregar as contas.");
      data.users.forEach((user) => emails.set(user.id, user.email ?? "E-mail não disponível"));
      if (data.users.length < 1000) break;
      page += 1;
    }

    const statusByUser = new Map((statuses ?? []).map((status) => [status.user_id, status]));
    return (profiles ?? []).map((profile) => ({
      ...profile,
      email: emails.get(profile.user_id) ?? "E-mail não disponível",
      is_blocked: statusByUser.get(profile.user_id)?.is_blocked ?? false,
      blocked_at: statusByUser.get(profile.user_id)?.blocked_at ?? null,
    }));
  });

export const setAdminTeamBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userId: z.string().uuid(), isBlocked: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.rpc("admin_set_account_blocked", {
      _user_id: data.userId,
      _is_blocked: data.isBlocked,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateAdminTeam = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      userId: z.string().uuid(),
      team: teamSchema,
      players: z.array(playerSchema).max(500),
      trophies: z.array(trophySchema).max(200),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("team_profiles")
      .update({
        team: data.team,
        players: data.players,
        trophies: data.trophies,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", data.userId);
    if (error) throw new Error("Não foi possível salvar as alterações do time.");
    return { ok: true };
  });

export const deleteAdminTeamAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) {
      throw new Error("A conta administrativa não pode excluir a si mesma.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (authError) throw new Error("Não foi possível excluir a conta.");

    const [{ error: profileError }, { error: statusError }, { error: roleError }] = await Promise.all([
      supabaseAdmin.from("team_profiles").delete().eq("user_id", data.userId),
      supabaseAdmin.from("account_status").delete().eq("user_id", data.userId),
      supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId),
    ]);
    if (profileError || statusError || roleError) {
      throw new Error("A conta foi excluída, mas alguns dados precisam de limpeza administrativa.");
    }
    return { ok: true };
  });