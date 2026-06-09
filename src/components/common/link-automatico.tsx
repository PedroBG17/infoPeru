// src/components/common/link-automatico.tsx
import React from 'react';
import { prisma } from '@/lib/db';
import Link from 'next/link';

interface LinkAutomaticoProps {
  type: 'tramites' | 'hospitales' | 'trabajos';
  ciudadSlug: string;
  excludeSlug?: string;
}

/**
 * Componente de Servidor (RSC) de Enlazado Interno Automático.
 * Consulta la base de datos de manera dinámica para recomendar contenidos altamente semánticos 
 * dentro de la misma ubicación geográfica, mejorando el Crawl Budget y transfiriendo PageRank.
 */
export async function LinkAutomatico({ type, ciudadSlug, excludeSlug }: LinkAutomaticoProps) {
  try {
    // 1. Obtener la Ciudad
    const ciudad = await prisma.ciudad.findUnique({
      where: { slug: ciudadSlug },
      include: {
        procedimientos: {
          include: { procedimiento: true },
          take: 8,
        },
        hospitales: {
          take: 6,
        },
      },
    });

    if (!ciudad) return null;

    if (type === 'tramites') {
      const links = ciudad.procedimientos
        .filter((pc) => pc.procedimiento.slug !== excludeSlug)
        .map((pc) => ({
          title: `${pc.procedimiento.title} en ${ciudad.name}`,
          url: `/tramites/${pc.procedimiento.slug}/${ciudad.slug}`,
        }));

      if (links.length === 0) {
        return <p className="text-xs text-muted-foreground">No hay trámites relacionados en esta ciudad.</p>;
      }

      return (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
          {links.map((link) => (
            <li key={link.url}>
              <Link
                href={link.url}
                className="block p-3 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors font-medium text-sm text-primary"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      );
    }

    if (type === 'hospitales') {
      const links = ciudad.hospitales
        .filter((h) => h.slug !== excludeSlug)
        .map((h) => ({
          title: `${h.nombre} (${h.tipo})`,
          url: `/hospitales/${h.slug}`,
        }));

      if (links.length === 0) {
        return <p className="text-xs text-muted-foreground">No hay centros de salud registrados en esta ciudad.</p>;
      }

      return (
        <ul className="grid grid-cols-1 gap-2 w-full">
          {links.map((link) => (
            <li key={link.url}>
              <Link
                href={link.url}
                className="text-sm font-semibold hover:underline text-primary"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      );
    }

    return null;
  } catch (error) {
    console.error('Error rendering dynamic link automatico:', error);
    return null;
  }
}
