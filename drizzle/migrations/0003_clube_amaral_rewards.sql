CREATE TABLE public.club_accounts (user_id uuid PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.club_accounts TO authenticated;
GRANT ALL ON public.club_accounts TO service_role;
ALTER TABLE public.club_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member or admin read" ON public.club_accounts FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.club_rewards (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, benefit text NOT NULL, points integer NOT NULL CHECK(points>0), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.club_rewards TO authenticated;
GRANT ALL ON public.club_rewards TO service_role;
ALTER TABLE public.club_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read active rewards" ON public.club_rewards FOR SELECT TO authenticated USING(active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manage rewards" ON public.club_rewards FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
ALTER TABLE public.orders ADD COLUMN club_user_id uuid, ADD COLUMN club_earned_points integer NOT NULL DEFAULT 0;
CREATE POLICY "member read own purchases" ON public.orders FOR SELECT TO authenticated USING(club_user_id=auth.uid());
CREATE TABLE public.club_points (order_id uuid PRIMARY KEY REFERENCES public.orders(id), user_id uuid NOT NULL, points integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.club_points TO authenticated;
GRANT ALL ON public.club_points TO service_role;
ALTER TABLE public.club_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member or admin read points" ON public.club_points FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TABLE public.club_redemptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, reward_id uuid REFERENCES public.club_rewards(id) ON DELETE SET NULL, reward_name text NOT NULL, benefit text NOT NULL, points integer NOT NULL CHECK(points>0), balance_after integer NOT NULL, customer_name text NOT NULL, customer_email text NOT NULL, purchases jsonb NOT NULL DEFAULT '[]'::jsonb, fulfilled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.club_redemptions TO authenticated;
GRANT UPDATE(fulfilled) ON public.club_redemptions TO authenticated;
GRANT ALL ON public.club_redemptions TO service_role;
ALTER TABLE public.club_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "member or admin read redemptions" ON public.club_redemptions FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin deliver rewards" ON public.club_redemptions FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.join_club() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta'; END IF;
 SELECT lower(email) INTO e FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL;
 IF e IS NULL THEN RAISE EXCEPTION 'Confirme seu e-mail para participar'; END IF;
 INSERT INTO public.club_accounts(user_id,email,name) VALUES(auth.uid(),e,coalesce(auth.jwt()->'user_metadata'->>'full_name',e)) ON CONFLICT(user_id) DO NOTHING;
END; $$;
REVOKE ALL ON FUNCTION public.join_club() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.join_club() TO authenticated;
CREATE FUNCTION public.club_order_prepare() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE basis numeric;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.club_user_id IS NULL AND EXISTS(SELECT 1 FROM public.club_accounts WHERE user_id=auth.uid()) THEN NEW.club_user_id:=auth.uid(); END IF;
  IF NEW.club_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.club_accounts WHERE user_id=NEW.club_user_id) THEN RAISE EXCEPTION 'Cliente não cadastrado no clube'; END IF;
  SELECT coalesce(sum(p.price * (i->>'qty')::integer),0) INTO basis FROM jsonb_array_elements(NEW.items) i JOIN public.products p ON p.id=i->>'id' WHERE (i->>'qty') ~ '^[1-9][0-9]*$';
  NEW.club_earned_points:=greatest(0,floor(basis-greatest(0,NEW.discount)))::integer;
 ELSE
  NEW.club_user_id:=OLD.club_user_id; NEW.club_earned_points:=OLD.club_earned_points;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER club_order_prepare BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.club_order_prepare();
CREATE FUNCTION public.club_order_points() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.club_user_id IS NOT NULL THEN
  PERFORM 1 FROM public.club_accounts WHERE user_id=NEW.club_user_id FOR UPDATE;
  INSERT INTO public.club_points(order_id,user_id,points) VALUES(NEW.id,NEW.club_user_id,CASE WHEN NEW.status='entregue' THEN NEW.club_earned_points ELSE 0 END) ON CONFLICT(order_id) DO UPDATE SET points=EXCLUDED.points;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER club_order_points AFTER INSERT OR UPDATE OF status ON public.orders FOR EACH ROW EXECUTE FUNCTION public.club_order_points();
CREATE FUNCTION public.redeem_club_reward(reward uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE a public.club_accounts%ROWTYPE; r public.club_rewards%ROWTYPE; balance integer; receipt uuid; history jsonb;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Entre na sua conta para resgatar'; END IF;
 SELECT * INTO a FROM public.club_accounts WHERE user_id=auth.uid() FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Entre no Clube Amaral'; END IF;
 SELECT * INTO r FROM public.club_rewards WHERE id=reward AND active FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Recompensa indisponível'; END IF;
 SELECT coalesce((SELECT sum(points) FROM public.club_points WHERE user_id=a.user_id),0)-coalesce((SELECT sum(points) FROM public.club_redemptions WHERE user_id=a.user_id),0) INTO balance;
 IF balance<r.points THEN RAISE EXCEPTION 'Pontos insuficientes'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('number',number,'date',created_at,'items',items,'total',total,'points',club_earned_points) ORDER BY created_at),'[]'::jsonb) INTO history FROM public.orders WHERE club_user_id=a.user_id AND status='entregue';
 INSERT INTO public.club_redemptions(user_id,reward_id,reward_name,benefit,points,balance_after,customer_name,customer_email,purchases) VALUES(a.user_id,r.id,r.name,r.benefit,r.points,balance-r.points,a.name,a.email,history) RETURNING id INTO receipt;
 RETURN receipt;
END; $$;
REVOKE ALL ON FUNCTION public.redeem_club_reward(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.redeem_club_reward(uuid) TO authenticated;
CREATE FUNCTION public.assign_club_manual_customer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e text;
BEGIN
 e:=lower(trim(coalesce(NEW.address->>'club_email','')));
 IF e<>'' THEN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso restrito'; END IF;
  SELECT user_id INTO NEW.club_user_id FROM public.club_accounts WHERE email=e;
  IF NEW.club_user_id IS NULL THEN RAISE EXCEPTION 'Cliente precisa entrar no Clube Amaral com este e-mail primeiro'; END IF;
 ELSE
  IF NEW.notes='Venda de balcão' THEN NEW.club_user_id:=NULL; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER aa_club_manual_customer BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.assign_club_manual_customer();