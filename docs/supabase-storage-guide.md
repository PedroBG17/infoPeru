# Guia de Supabase Storage para DataPeru

DataPeru usa Supabase en dos capas:

- PostgreSQL para datos del portal y CMS.
- Supabase Storage para imagenes y medios del CMS.

## 1. Bucket configurado

Crear un bucket publico:

```text
kbucket
```

Debe ser publico porque las imagenes del CMS se renderizan en paginas publicas: portada, noticias, SEO programatico, hospitales y empleo.

## 2. Variables

En produccion:

```env
MEDIA_STORAGE_PROVIDER="supabase"
SUPABASE_SERVICE_ROLE_KEY="TU_SERVICE_ROLE_KEY"
SUPABASE_STORAGE_BUCKET="kbucket"
```

Opcional:

```env
SUPABASE_STORAGE_PUBLIC_URL=""
```

Si `SUPABASE_STORAGE_PUBLIC_URL` queda vacio, la aplicacion genera la URL publica nativa de Supabase:

```text
https://PROJECT_ID.supabase.co/storage/v1/object/public/kbucket/uploads/archivo.webp
```

## 3. Seguridad

`SUPABASE_SERVICE_ROLE_KEY` es server-only. No debe usarse con prefijo `NEXT_PUBLIC_` ni exponerse en cliente.

El CMS ya exige sesion admin para subir archivos. La service role se usa solo en rutas servidor para crear y eliminar objetos del bucket.

## 4. Politicas del bucket

Configuracion recomendada:

- Bucket publico para lectura.
- Escritura gestionada solo desde servidor con service role.
- Limite de carga controlado por la API del CMS: 5 MB por imagen.
- Tipos permitidos: JPG, PNG, WebP y GIF.

## 5. Verificacion

Con servidor local activo:

```bash
SMOKE_ADMIN_PASSWORD='tu-password-admin' corepack pnpm run test:smoke
```

Para verificar entorno productivo:

```bash
corepack pnpm run preflight
```

Para verificar que el bucket existe y es publico:

```bash
corepack pnpm run verify:supabase-storage
```

Si el preflight falla por storage, revisar:

- `MEDIA_STORAGE_PROVIDER=supabase`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

## 6. Migracion desde almacenamiento local

Los archivos locales viven en:

```text
public/uploads
```

Para migrarlos manualmente:

1. Subir cada archivo al bucket `kbucket` dentro de `uploads/`.
2. Actualizar las URLs guardadas en la tabla `Media` si eran `/uploads/...`.
3. Revisar noticias y portada que usen imagenes antiguas.

En nuevos uploads, el CMS guardara directamente URLs publicas de Supabase.
