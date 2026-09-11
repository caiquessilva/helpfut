CREATE OR REPLACE FUNCTION public.admin_set_account_blocked(_user_id uuid, _is_blocked boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF auth.uid() = _user_id THEN
    RAISE EXCEPTION 'Administrators cannot block their own account';
  END IF;

  INSERT INTO public.account_status (user_id, is_blocked, blocked_at, updated_at)
  VALUES (_user_id, _is_blocked, CASE WHEN _is_blocked THEN now() ELSE NULL END, now())
  ON CONFLICT (user_id) DO UPDATE SET
    is_blocked = EXCLUDED.is_blocked,
    blocked_at = EXCLUDED.blocked_at,
    updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_account_blocked(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_account_blocked(uuid, boolean) TO authenticated;