# DataPerú - Checklist de Producción

## Runbooks

- `docs/deployment-runbook.md`: despliegue final, baseline de base de datos, verificacion post-deploy y rollback.
- `docs/supabase-storage-guide.md`: bucket de medios, service role server-only y verificacion.

## Variables obligatorias

Configurar en el proveedor de hosting:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`
- `REVALIDATION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `MEDIA_STORAGE_PROVIDER`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ENABLE_EXPERIMENTAL_COREPACK`

Valores productivos esperados:

```text
MEDIA_STORAGE_PROVIDER=supabase
SUPABASE_STORAGE_BUCKET=kbucket
ENABLE_EXPERIMENTAL_COREPACK=1
```

Para generar un hash de contraseña admin:

```bash
node -e "const crypto=require('crypto'); const p='CAMBIAR_PASSWORD'; const s=crypto.randomBytes(16).toString('hex'); console.log('scrypt:'+s+':'+crypto.scryptSync(p,s,64).toString('hex'))"
```

## Verificación antes de deploy

```bash
corepack pnpm install
corepack pnpm exec prisma generate
corepack pnpm exec tsc --noEmit
corepack pnpm run build
```

Con el servidor local activo:

```bash
SMOKE_ADMIN_PASSWORD='tu-password-admin' corepack pnpm run test:smoke
```

En PowerShell:

```powershell
$env:SMOKE_ADMIN_PASSWORD='tu-password-admin'
corepack pnpm run test:smoke
Remove-Item Env:\SMOKE_ADMIN_PASSWORD
```

## Seguridad mínima

- `/admin/dashboard` debe redirigir a `/admin/login` sin sesión.
- `/api/v1/media/upload` debe responder `401` sin sesión admin.
- `/api/v1/webhooks/revalidate` debe responder `401` sin token y `200` con `Authorization: Bearer <REVALIDATION_SECRET>`.
- Cambiar `ADMIN_PASSWORD_HASH` y `ADMIN_SESSION_SECRET` antes de producción.
- Mantener `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, `CRON_SECRET` y `REVALIDATION_SECRET` fuera del cliente.

## Operación CMS

- Usar `Gestión del Portal > Sitio` para portada, ticker, footer, navegación y SEO global.
- Usar `Gestión de Noticias` para artículos, categorías, etiquetas y medios.
- Usar `Gestión del Portal` para territorio, trámites, pSEO, sedes, hospitales y empleo.
- Después de cargas masivas, usar el botón de revalidación del CMS o el webhook seguro.

## Pendientes recomendados para producción avanzada

- Configurar bucket publico de Supabase Storage para medios del CMS.
- Confirmar que el cron versionado en `vercel.json` aparece en Vercel y responde con `200` desde el panel de Cron Jobs.
- Mantener migraciones Prisma versionadas para cada cambio futuro de esquema.
- Añadir backups programados de Supabase.
- Configurar monitoreo de errores y alertas de uptime.

## Preflight automatizado

Para validar el entorno local antes de construir:

```bash
corepack pnpm run validate:env
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

Para aplicar migraciones versionadas en produccion:

```bash
corepack pnpm run db:migrate
```

Si la base de datos ya existe y fue creada antes de versionar migraciones, seguir primero el baseline de `docs/deployment-runbook.md`.

Para validar un deploy productivo con Supabase Storage obligatorio:

```bash
corepack pnpm run preflight
```

Para comprobar que el bucket de medios existe y es publico:

```bash
corepack pnpm run verify:supabase-storage
```

Para monitoreo externo, configurar un uptime check sobre:

```text
https://info-peru.vercel.app/api/health
```

Debe responder `200` con `status: ok` y `checks.database: ok`.

GitHub Actions queda alineado con pnpm `11.5.2`; los workflows ejecutan instalacion con lockfile congelado, lint y typecheck antes del despliegue.
