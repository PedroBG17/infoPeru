// src/utils/security.ts

/**
 * Sanitiza contenido HTML eliminando etiquetas de script, controladores de eventos on* (onclick, onload, etc.)
 * y enlaces javascript: para evitar XSS.
 * Es liviana, ultra-rápida y 100% compatible con Server Components de Next.js sin depender de JSDOM.
 */
export function safeSanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    // Eliminar etiquetas <script> completas
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Eliminar controladores de eventos inline (onload, onerror, onclick, etc.)
    .replace(/\son\w+\s*=\s*(['"].*?['"]|[^\\\s>]+)/gi, '')
    // Reemplazar protocolos javascript: en href/src
    .replace(/href\s*=\s*(['"])\s*javascript:.*?(\1)/gi, 'href="#"')
    .replace(/src\s*=\s*(['"])\s*javascript:.*?(\1)/gi, 'src=""');
}
