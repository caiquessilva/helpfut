import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminTeams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Acesso administrativo negado.");

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
    const { error } = await context.supabase.rpc("admin_set_account_blocked", {
      _user_id: data.userId,
      _is_blocked: data.isBlocked,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });