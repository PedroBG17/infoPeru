# Guía de Configuración e Infraestructura de Cloudflare: DataPerú

Esta guía detalla la configuración recomendada en el panel de control de Cloudflare (DNS, WAF, SSL/TLS, Caching) para poner en producción la plataforma **DataPerú** detrás de un proxy de alto rendimiento, optimizando el Crawl Budget y absorbiendo ataques de scraping.

---

## 1. Reglas de Caché en el Edge (Edge Cache Rules)

Para lograr un TTFB (Time to First Byte) inferior a **50ms** a nivel global y reducir la facturación de Vercel Serverless, debemos almacenar las páginas de SEO programático (pSEO) y Evergreen CMS directamente en los servidores Edge de Cloudflare.

### Regla 1: Caché de Páginas pSEO y Directorios
*   **Nombre de la Regla**: `Cache_pSEO_y_Directorios`
*   **Filtro (Expression Builder)**:
    ```
    (http.request.uri.path starts_with "/tramites/") or 
    (http.request.uri.path starts_with "/hospitales/") or 
    (http.request.uri.path starts_with "/trabajos/")
    ```
*   **Ajustes de Caché**:
    *   **Cache Elegibility**: Elegible para caché.
    *   **Edge Cache TTL**: Respetar cabeceras de origen (Next.js envía `s-maxage=86400`), o forzar a **7 días** (`Override origin` -> `7 days`).
    *   **Browser Cache TTL**: Respetar cabeceras de origen (Next.js envía `max-age=0` o revalidaciones), o forzar a `4 horas` para mejorar velocidad del cliente.

### Regla 2: Ignorar Parámetros de Consulta Quirúrgicos (Query String)
Para evitar que ataques de *cache-busting* con strings aleatorios inunden el origen de peticiones:
*   **Ajustes de Caché Key**:
    *   **Query String**: Excluir todo (Ignore Query String) a menos que uses parámetros de paginación específicos (`page`, `sector`).

---

## 2. Reglas del WAF (Web Application Firewall)

El scraping automatizado consume ancho de banda y degrada el rendimiento de la base de datos de Supabase. El WAF de Cloudflare debe filtrar estos rastreos maliciosos antes de que lleguen a Next.js.

### Regla WAF 1: Bloqueo de Scraping de User-Agents Comunes
*   **Nombre de la Regla**: `Bloquear_Scrapers_Automatizados`
*   **Acción**: `Block` (Bloquear)
*   **Filtro (Expression Builder)**:
    ```
    (http.user_agent contains "Scrapy") or
    (http.user_agent contains "pycurl") or
    (http.user_agent contains "Selenium") or
    (http.user_agent contains "Puppeteer") or
    (http.user_agent contains "Playwright") or
    (http.user_agent contains "python-requests") or
    (http.user_agent contains "Go-http-client") or
    (http.user_agent contains "axios")
    ```

### Regla WAF 2: Managed Challenge en la API de Captura de Leads (Antispam)
*   **Nombre de la Regla**: `Desafio_Formularios_Sensibles`
*   **Acción**: `Managed Challenge` (Desafío administrado interactivo)
*   **Filtro (Expression Builder)**:
    ```
    (http.request.uri.path eq "/api/v1/leads") and 
    (http.request.method eq "POST")
    ```
*   *Nota*: Esto despliega un Turnstile o desafío de Cloudflare silencioso contra bots automatizados para impedir spam en nuestra tabla de leads en Supabase.

---

## 3. Configuración de SSL/TLS y Cabeceras de Seguridad

Configura estos ajustes en la pestaña **SSL/TLS** de Cloudflare para garantizar la conformidad de seguridad requerida:

1.  **Modo de Encriptación**: `Full (Strict)` (Completo estricto)
    *   Garantiza cifrado completo de extremo a extremo entre el navegador del usuario, Cloudflare y Vercel/Next.js.
2.  **HTTPS Recomendado**:
    *   **Always Use HTTPS**: Activo (True).
    *   **HSTS (HTTP Strict Transport Security)**: Activo (True).
        *   Max Age: `2 years (63072000 seconds)`.
        *   Include subdomains: Activo.
        *   Preload: Activo (nuestro middleware en Next.js también inyecta esta cabecera para doble protección).
3.  **Min TLS Version**: `TLS 1.2` o `TLS 1.3` únicamente para cifrados modernos ultrarrápidos.

---

## 4. Revalidación On-Demand (Bust Cache)

Cuando actualices un registro en Supabase o edites contenido en WordPress:
1.  Next.js purgará su propia caché local a través de `/api/v1/webhooks/revalidate` e `ISR`.
2.  Para purgar el Edge de Cloudflare, debes emitir una solicitud de purga a la API de Cloudflare usando el **Zone ID** y un **API Token** con permisos `Zone.Cache Purge`.

### Comando CURL para Purga Selectiva por URL
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/TU_ZONE_ID/purge_cache" \
     -H "Authorization: Bearer TU_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"files":["https://dataperu.pe/tramites/dni-duplicado/lima"]}'
```

Esta estrategia híbrida asegura consistencia de datos instantánea a nivel global sin comprometer el rendimiento.
