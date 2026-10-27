CREATE OR REPLACE FUNCTION public.create_manual_sale(payload jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it jsonb; p public.products%ROWTYPE; lines jsonb := '[]'::jsonb; subtotal_value numeric := 0; received numeric; quantity integer; n integer;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acesso restrito ao administrador'; END IF;
 IF length(trim(coalesce(payload->>'customer_name',''))) = 0 THEN RAISE EXCEPTION 'Informe o nome do cliente'; END IF;
 IF coalesce(payload->>'payment_method','') NOT IN ('pix','dinheiro','cartao') THEN RAISE EXCEPTION 'Forma de pagamento inválida'; END IF;
 IF jsonb_typeof(payload->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(payload->'items') = 0 THEN RAISE EXCEPTION 'Adicione um produto'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'items') x GROUP BY x->>'id' HAVING count(*) > 1) THEN RAISE EXCEPTION 'Produto duplicado'; END IF;
 FOR it IN SELECT value FROM jsonb_array_elements(payload->'items') ORDER BY value->>'id' LOOP
  IF (it->>'qty') IS NULL OR (it->>'qty') !~ '^[1-9][0-9]*$' THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
  quantity := (it->>'qty')::integer;
  SELECT * INTO p FROM public.products WHERE id=it->>'id' AND active FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto indisponível'; END IF;
  IF p.stock < quantity THEN RAISE EXCEPTION 'Estoque insuficiente para %', p.name; END IF;
  IF p.price < 0 THEN RAISE EXCEPTION 'Preço inválido'; END IF;
  subtotal_value := subtotal_value + round(p.price,2)*quantity;
  lines := lines || jsonb_build_array(jsonb_build_object('id',p.id,'name',p.name,'qty',quantity,'price',round(p.price,2)));
 END LOOP;
 IF payload->>'payment_method' = 'dinheiro' THEN
  received := coalesce(nullif(payload->>'change_for','')::numeric,subtotal_value);
  IF received < subtotal_value THEN RAISE EXCEPTION 'Valor recebido menor que o total'; END IF;
 END IF;
 INSERT INTO public.orders(customer_name,customer_whatsapp,address,payment_method,change_for,items,notes,subtotal,delivery,discount,total,status)
 VALUES(left(trim(payload->>'customer_name'),120),left(coalesce(payload->>'customer_whatsapp',''),30),coalesce(payload->'address','{}'::jsonb),payload->>'payment_method',CASE WHEN received IS NOT NULL THEN received::text ELSE NULL END,lines,'Venda de balcão',subtotal_value,0,0,subtotal_value,'entregue') RETURNING number INTO n;
 FOR it IN SELECT value FROM jsonb_array_elements(lines) LOOP
  INSERT INTO public.stock_movements(product_id,qty,kind,note) VALUES(it->>'id',(it->>'qty')::integer,'saida','Venda de balcão #'||n);
 END LOOP;
 RETURN n;
END; $$;
REVOKE ALL ON FUNCTION public.create_manual_sale(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_manual_sale(jsonb) TO authenticated;