CREATE OR REPLACE FUNCTION public.club_order_prepare() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE basis numeric;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.notes IS DISTINCT FROM 'Venda de balcão' AND NEW.club_user_id IS NULL AND EXISTS(SELECT 1 FROM public.club_accounts WHERE user_id=auth.uid()) THEN NEW.club_user_id:=auth.uid(); END IF;
  IF NEW.club_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.club_accounts WHERE user_id=NEW.club_user_id) THEN RAISE EXCEPTION 'Cliente não cadastrado no clube'; END IF;
  SELECT coalesce(sum(p.price * (i->>'qty')::integer),0) INTO basis FROM jsonb_array_elements(NEW.items) i JOIN public.products p ON p.id=i->>'id' WHERE (i->>'qty') ~ '^[1-9][0-9]*$';
  NEW.club_earned_points:=greatest(0,floor(basis-greatest(0,NEW.discount)))::integer;
 ELSE
  NEW.club_user_id:=OLD.club_user_id; NEW.club_earned_points:=OLD.club_earned_points;
 END IF;
 RETURN NEW;
END; $$;