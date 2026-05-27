-- =============================================================
-- DataPerú: Políticas de Row Level Security (RLS)
-- Ejecutar en Supabase SQL Editor o como migración
-- =============================================================

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE public."Departamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Ciudad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Procedimiento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProcedimientoCiudad" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SedeOficina" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Hospital" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SEOConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AnalyticsLog" ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. TABLAS PÚBLICAS (Lectura anónima permitida, escritura denegada)
--    Estas tablas alimentan las páginas pSEO y directorios.
-- =============================================================

-- Departamento: Solo lectura pública
DROP POLICY IF EXISTS "Departamento: lectura pública" ON public."Departamento";
CREATE POLICY "Departamento: lectura pública"
  ON public."Departamento" FOR SELECT
  TO anon, authenticated
  USING (true);

-- Ciudad: Solo lectura pública
DROP POLICY IF EXISTS "Ciudad: lectura pública" ON public."Ciudad";
CREATE POLICY "Ciudad: lectura pública"
  ON public."Ciudad" FOR SELECT
  TO anon, authenticated
  USING (true);

-- Procedimiento: Solo lectura pública
DROP POLICY IF EXISTS "Procedimiento: lectura pública" ON public."Procedimiento";
CREATE POLICY "Procedimiento: lectura pública"
  ON public."Procedimiento" FOR SELECT
  TO anon, authenticated
  USING (true);

-- ProcedimientoCiudad: Solo lectura pública
DROP POLICY IF EXISTS "ProcedimientoCiudad: lectura pública" ON public."ProcedimientoCiudad";
CREATE POLICY "ProcedimientoCiudad: lectura pública"
  ON public."ProcedimientoCiudad" FOR SELECT
  TO anon, authenticated
  USING (true);

-- SedeOficina: Solo lectura pública
DROP POLICY IF EXISTS "SedeOficina: lectura pública" ON public."SedeOficina";
CREATE POLICY "SedeOficina: lectura pública"
  ON public."SedeOficina" FOR SELECT
  TO anon, authenticated
  USING (true);

-- Hospital: Solo lectura pública
DROP POLICY IF EXISTS "Hospital: lectura pública" ON public."Hospital";
CREATE POLICY "Hospital: lectura pública"
  ON public."Hospital" FOR SELECT
  TO anon, authenticated
  USING (true);

-- SEOConfig: Solo lectura pública
DROP POLICY IF EXISTS "SEOConfig: lectura pública" ON public."SEOConfig";
CREATE POLICY "SEOConfig: lectura pública"
  ON public."SEOConfig" FOR SELECT
  TO anon, authenticated
  USING (true);

-- =============================================================
-- 3. TABLAS SENSIBLES (Sin acceso anónimo, solo service_role)
--    Lead y AnalyticsLog solo son accesibles desde el backend
--    (Prisma usa la conexión directa con rol postgres, que
--     bypasea RLS automáticamente).
-- =============================================================

-- Lead: Solo inserción desde usuarios autenticados, lectura solo service_role
DROP POLICY IF EXISTS "Lead: inserción autenticada" ON public."Lead";
CREATE POLICY "Lead: inserción autenticada"
  ON public."Lead" FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Lead: lectura solo admin" ON public."Lead";
CREATE POLICY "Lead: lectura solo admin"
  ON public."Lead" FOR SELECT
  TO authenticated
  USING (false);
  -- El backend Prisma usa el rol 'postgres' que bypasea RLS.
  -- Ningún usuario frontend puede leer leads.

-- AnalyticsLog: Sin acceso desde PostgREST
-- El backend Prisma (rol postgres) inserta y lee directamente.
-- No se crea ninguna política = acceso denegado por defecto con RLS activo.

-- =============================================================
-- 4. BLOQUEAR ESCRITURA PÚBLICA en tablas de contenido
--    Previene que alguien inserte, actualice o borre registros
--    a través de la API REST pública de Supabase.
-- =============================================================
-- No se crean políticas INSERT/UPDATE/DELETE para las tablas
-- de contenido (Departamento, Ciudad, Procedimiento, etc.),
-- lo que significa que RLS las bloquea por defecto.
-- Solo el rol 'postgres' (usado por Prisma) puede escribir.
