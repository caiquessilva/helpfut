CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.account_status (
  user_id uuid PRIMARY KEY,
  is_blocked boolean NOT NULL DEFAULT false,
  blocked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.account_status TO authenticated;
GRANT ALL ON public.account_status TO service_role;
ALTER TABLE public.account_status ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

CREATE OR REPLACE FUNCTION public.is_account_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT COALESCE((
    SELECT is_blocked FROM public.account_status WHERE user_id = _user_id
  ), false)
$$;
REVOKE ALL ON FUNCTION public.is_account_active(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_account_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_active(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.bootstrap_current_account()
RETURNS TABLE(is_admin boolean, is_blocked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text := lower(COALESCE(auth.jwt() ->> 'email', ''));
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.account_status (user_id)
  VALUES (current_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    current_user_id,
    CASE WHEN current_email = '7caiquess@gmail.com' THEN 'admin'::public.app_role ELSE 'user'::public.app_role END
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN QUERY
  SELECT
    public.has_role(current_user_id, 'admin'::public.app_role),
    NOT public.is_account_active(current_user_id);
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_current_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_account() TO authenticated;

CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their account status"
ON public.account_status FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Teams can view their own profile" ON public.team_profiles;
DROP POLICY IF EXISTS "Teams can create their own profile" ON public.team_profiles;
DROP POLICY IF EXISTS "Teams can update their own profile" ON public.team_profiles;
DROP POLICY IF EXISTS "Teams can delete their own profile" ON public.team_profiles;

CREATE POLICY "Active teams and admins can view profiles"
ON public.team_profiles FOR SELECT TO authenticated
USING (
  (auth.uid() = user_id AND public.is_account_active(auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Active teams can create their profile"
ON public.team_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.is_account_active(auth.uid()));

CREATE POLICY "Active teams can update their profile"
ON public.team_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND public.is_account_active(auth.uid()))
WITH CHECK (auth.uid() = user_id AND public.is_account_active(auth.uid()));

CREATE POLICY "Active teams can delete their profile"
ON public.team_profiles FOR DELETE TO authenticated
USING (auth.uid() = user_id AND public.is_account_active(auth.uid()));