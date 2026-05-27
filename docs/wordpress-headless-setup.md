# Guía de Configuración: WordPress Headless para DataPerú

Esta guía detalla los pasos sencillos para configurar WordPress como administrador de contenidos (CMS) para **DataPerú**. En esta arquitectura Headless, WordPress se utiliza únicamente para escribir los artículos; las visitas públicas entran directamente a Next.js, el cual obtiene el contenido de WordPress en segundo plano.

---

## Paso 1: Dónde instalar WordPress

1. **Instalación**: Instala WordPress en un subdominio de tu sitio web (por ejemplo, `cms.dataperu.pe` o `admin.dataperu.pe`).
2. **Hosting**: Puedes usar cualquier hosting económico (Hostinger, SiteGround, Bluehost, etc.). Casi todos tienen un botón de **"Instalar WordPress en 1 Clic"**.
3. **Privacidad**: En los ajustes de WordPress (*Ajustes > Lectura*), te recomendamos marcar la opción *"Disuadir a los motores de búsqueda de indexar este sitio"*. Esto asegura que Google indexe únicamente la web rápida de Next.js (`dataperu.pe`) y no el panel administrador.

---

## Paso 2: Plugins obligatorios a instalar

Una vez dentro de tu panel de administración de WordPress (`/wp-admin`), ve a la sección **Plugins > Añadir nuevo** e instala estos dos plugins gratuitos:

1. **WPGraphQL** (Creado por WPGraphQL)
   * *¿Para qué sirve?*: Abre una puerta de comunicación (API GraphQL) para que Next.js pueda conectarse y descargar los textos de tus artículos.
   * *Configuración*: Ninguna. Solo instálalo y dale clic a **Activar**.

2. **WP Webhooks** (o *JAMstack Deployments*)
   * *¿Para qué sirve?*: Envía una señal automática a Next.js cuando creas o modificas un artículo para que la página web se actualice al instante (sin esperar 24 horas).
   * *Configuración*: Sigue las instrucciones del Paso 3.

---

## Paso 3: Configurar la señal de actualización (Webhook)

Para que Next.js sepa cuándo has modificado o creado un artículo en WordPress y actualice el CDN:

1. En tu panel de WordPress, ve a **Ajustes > WP Webhooks**.
2. Dirígete a la pestaña **Send Data** (Enviar datos).
3. En la lista de eventos de la derecha, selecciona **Post updated** (Entrada actualizada) o **Post published** (Entrada publicada).
4. Haz clic en el botón **Add Webhook URL** (Añadir URL de Webhook).
5. Configúralo así:
   * **Webhook Name**: `Revalidación Next.js`
   * **Webhook URL**: Copia y pega la dirección de tu API de Next.js con tu secreto de seguridad:
     ```
     https://tu-dominio-nextjs.pe/api/v1/webhooks/revalidate?secret=TU_REVALIDATION_SECRET
     ```
6. Guarda los cambios. ¡Listo! A partir de ahora, cada vez que edites un artículo en WordPress, la caché de Next.js se purgará automáticamente.

---

## Paso 4: Cómo redactar artículos

Puedes redactar tus artículos (noticias, guías útiles) de forma habitual usando el editor de bloques nativo de WordPress (Gutenberg):
* Usa títulos, párrafos, listas y añade imágenes en la biblioteca de medios.
* **Importante**: Next.js se encarga automáticamente de aplicar los estilos premium, el modo oscuro, y de optimizar las imágenes del contenido para que carguen a máxima velocidad.
