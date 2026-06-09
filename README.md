# DataPeru

Portal publico y CMS operativo para noticias, tramites, salud, empleo, SEO programatico y gestion general del sitio.

## Stack

- Next.js 15 App Router
- Prisma + PostgreSQL/Supabase
- Tailwind CSS
- pnpm 11.5.2
- Upstash Redis
- Supabase Storage para medios en produccion

## Comandos principales

```bash
corepack pnpm install
corepack pnpm run dev
corepack pnpm run check
corepack pnpm run test:smoke
```

Servidor local:

```text
http://localhost:3000
```

Panel CMS:

```text
http://localhost:3000/admin/login
```

## CMS

El panel permite gestionar:

- Configuracion global del portal, portada, navegacion, ticker, footer y SEO global.
- Noticias, categorias, etiquetas, contenido enriquecido y biblioteca de medios.
- Territorio, departamentos, ciudades, tramites, sedes y paginas pSEO.
- Hospitales, salud y empleo.
- Revalidacion segura de contenido.

## Produccion

Revisar primero:

- `docs/production-readiness.md`
- `docs/deployment-runbook.md`
- `docs/cloudflare-guide.md`

Validacion local completa:

```bash
corepack pnpm run check
```

Validacion productiva, con Supabase Storage obligatorio:

```bash
corepack pnpm run preflight
```

Migraciones versionadas:

```bash
corepack pnpm run db:migrate
```

Si la base de datos ya existe y tiene tablas creadas manualmente, no ejecutes `db:migrate` a ciegas. Sigue el baseline documentado en `docs/deployment-runbook.md`.
