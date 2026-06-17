import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';

interface LinkAutomaticoProps {
  type: 'tramites' | 'hospitales' | 'trabajos';
  ciudadSlug: string;
  excludeSlug?: string;
}

export async function LinkAutomatico({ type, ciudadSlug, excludeSlug }: LinkAutomaticoProps) {
  try {
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
        return <p className="text-xs leading-6 text-[#6B7280]">No hay tramites relacionados en esta ciudad.</p>;
      }

      return (
        <ul className="grid w-full gap-3 md:grid-cols-2">
          {links.map((link) => (
            <li key={link.url}>
              <Link
                href={link.url}
                className="group flex items-center justify-between gap-3 border border-[#E8E4DE] bg-[#F8F5F0] p-3 text-sm font-semibold text-[#1A1A2E] transition hover:border-[#C8102E]/40 hover:bg-white hover:text-[#C8102E]"
              >
                <span>{link.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      );
    }

    if (type === 'hospitales') {
      const links = ciudad.hospitales
        .filter((hospital) => hospital.slug !== excludeSlug)
        .map((hospital) => ({
          title: `${hospital.nombre} (${hospital.tipo})`,
          url: `/hospitales/${hospital.slug}`,
        }));

      if (links.length === 0) {
        return <p className="text-xs leading-6 text-[#6B7280]">No hay centros de salud registrados en esta ciudad.</p>;
      }

      return (
        <ul className="grid w-full gap-2">
          {links.map((link) => (
            <li key={link.url}>
              <Link
                href={link.url}
                className="group flex items-center justify-between gap-3 border border-[#E8E4DE] bg-[#F8F5F0] p-3 text-sm font-semibold text-[#1A1A2E] transition hover:border-[#C8102E]/40 hover:bg-white hover:text-[#C8102E]"
              >
                <span>{link.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
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
