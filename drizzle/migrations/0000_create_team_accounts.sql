CREATE TABLE public.team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  team JSONB NOT NULL DEFAULT '{}'::jsonb,
  trophies JSONB NOT NULL DEFAULT '[]'::jsonb,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_profiles TO authenticated;
GRANT ALL ON public.team_profiles TO service_role;

ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams can view their own profile"
ON public.team_profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teams can create their own profile"
ON public.team_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teams can update their own profile"
ON public.team_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teams can delete their own profile"
ON public.team_profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX team_profiles_user_id_idx ON public.team_profiles (user_id);