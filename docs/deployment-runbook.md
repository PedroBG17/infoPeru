# DataPeru - Runbook de despliegue

Este documento deja el camino operativo para pasar el portal y el CMS a produccion con control de riesgos.

## 1. Requisitos

- Node.js 20 o superior.
- pnpm 11.5.2 mediante Corepack.
- Proyecto Vercel conectado al repositorio.
- Supabase PostgreSQL con `DATABASE_URL` y `DIRECT_URL`.
- Supabase Storage con bucket publico para medios del CMS.
- Upstash Redis configurado.
- Corepack habilitado en Vercel con `ENABLE_EXPERIMENTAL_COREPACK=1`.

## 2. Variables de entorno

Configurar en Vercel Production:

```text
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
CRON_SECRET
REVALIDATION_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
MEDIA_STORAGE_PROVIDER
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_STORAGE_BUCKET
ENABLE_EXPERIMENTAL_COREPACK
```

En produccion usar:

```text
MEDIA_STORAGE_PROVIDER=supabase
SUPABASE_STORAGE_BUCKET=kbucket
ENABLE_EXPERIMENTAL_COREPACK=1
```

El bucket configurado para este proyecto es `kbucket` y debe ser publico para que las imagenes del CMS rendericen en las paginas publicas.

`SUPABASE_SERVICE_ROLE_KEY` es server-only. No debe exponerse en cliente ni usar prefijo `NEXT_PUBLIC_`.

## 3. Base de datos

Hay una migracion base versionada:

```text
prisma/migrations/20260607003000_dataperu_cms_schema/migration.sql
```

Para una base nueva:

```bash
corepack pnpm run db:migrate
```

Para una base existente que ya tiene las tablas del proyecto:

1. Crear backup desde Supabase.
2. Confirmar que el esquema real coincide con `prisma/schema.prisma`.
3. Marcar la migracion base como aplicada:

```bash
corepack pnpm exec prisma migrate resolve --applied 20260607003000_dataperu_cms_schema
```

4. Usar `corepack pnpm run db:migrate` solo para migraciones futuras.

El archivo `prisma/migrations/enable_rls.sql` es SQL operativo para Supabase. Revisarlo y ejecutarlo manualmente desde el SQL Editor cuando las politicas RLS esten listas para el flujo real de usuarios.

## 4. Verificacion antes de deploy

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm run check
```

Con variables productivas disponibles:

```bash
corepack pnpm run preflight
```

El preflight debe pasar sin variables faltantes. Si falla por storage, revisar `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` y `MEDIA_STORAGE_PROVIDER=supabase`.

Verificar bucket Supabase Storage:

```bash
corepack pnpm run verify:supabase-storage
```

## 5. Deploy

El archivo `vercel.json` deja versionado:

- Framework Next.js.
- Install command con pnpm/Corepack.
- Build command `corepack pnpm run build`.
- Cron diario `0 9 * * *` (UTC) hacia `/api/v1/cron/update-costs`.

El workflow `.github/workflows/deploy.yml` ejecuta:

- Instalacion pnpm con lockfile congelado.
- Lint.
- Typecheck.
- Descarga de entorno Vercel Production.
- Validacion productiva de variables.
- Build y deploy con Vercel CLI.

El deploy se activa al hacer push a `main`.

## 6. Verificacion post-deploy

Revisar estos endpoints:

```text
https://info-peru.vercel.app/api/health
https://info-peru.vercel.app/sitemap.xml
https://info-peru.vercel.app/robots.txt
```

Smoke test contra produccion:

```bash
SMOKE_BASE_URL=https://info-peru.vercel.app SMOKE_ADMIN_EMAIL='ADMIN_EMAIL_REAL' SMOKE_ADMIN_PASSWORD='ADMIN_PASSWORD_REAL' corepack pnpm run test:smoke
```

En PowerShell:

```powershell
$env:SMOKE_BASE_URL='https://info-peru.vercel.app'
$env:SMOKE_ADMIN_EMAIL='ADMIN_EMAIL_REAL'
$env:SMOKE_ADMIN_PASSWORD='ADMIN_PASSWORD_REAL'
corepack pnpm run test:smoke
Remove-Item Env:\SMOKE_BASE_URL
Remove-Item Env:\SMOKE_ADMIN_EMAIL
Remove-Item Env:\SMOKE_ADMIN_PASSWORD
```

## 7. Checklist funcional CMS

- Login admin correcto.
- Portada editable desde Gestion del Portal.
- Noticias publicadas y revalidadas.
- Medios subidos a Supabase Storage y servidos desde el bucket publico.
- Sitemap incluye rutas principales.
- Robots expone la URL del sitemap.
- `/api/v1/webhooks/revalidate` rechaza requests sin token.
- `/api/v1/cron/update-costs` rechaza requests sin `CRON_SECRET` y no modifica costos automaticamente sin fuente oficial estructurada.

## 8. Rollback

Si falla el despliegue:

1. Revertir al deployment anterior desde Vercel.
2. No revertir base de datos sin backup validado.
3. Desactivar temporalmente jobs cron externos si el error afecta escrituras.
4. Revisar `/api/health`, logs de Vercel y Supabase.
