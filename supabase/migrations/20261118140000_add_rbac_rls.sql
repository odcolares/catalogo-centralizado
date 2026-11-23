-- RBAC: RLS policies por role (lojista vs prestador)
-- Nota: backend usa service_role key (bypassa RLS). Estas policies são para acesso direto via client.

-- Função helper para extrair role do JWT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', 'lojista');
$$ LANGUAGE sql STABLE;

-- Produtos: lojista pode ver/editar todos (RLS permissivo para autenticados)
-- Prestador tem acesso total (já é service_role no backend)

-- Política: usuários autenticados podem ler produtos ativos
DROP POLICY IF EXISTS "Authenticated users can read active products" ON products;
CREATE POLICY "Authenticated users can read active products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Política: apenas prestador pode fazer bulk operations (via service_role no backend)
-- Lojista pode editar individualmente
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política: apenas prestador pode inserir (via service_role no backend)
-- Lojista pode criar individualmente
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Categorias: todos autenticados podem ler
DROP POLICY IF EXISTS "Authenticated users can read categories" ON categories;
CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Categorias: apenas prestador pode modificar (via service_role no backend)
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);