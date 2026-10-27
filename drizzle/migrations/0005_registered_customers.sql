CREATE TABLE public.customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (length(trim(name)) > 0),
 phone text NOT NULL DEFAULT '',
 address jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(address) = 'object'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin manage customers" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX customers_name_idx ON public.customers (name);
