import { ImageIcon } from 'lucide-react';

import type { EditorialImage, EditorialSource } from '@/lib/editorial-sources';

type SourceListProps = {
  title?: string;
  sources: EditorialSource[];
  image?: EditorialImage;
};

export function SourceList({ title = 'Fuentes consultadas', sources, image }: SourceListProps) {
  return (
    <section className="border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)]">
      {image && (
        <figure className="mb-5 overflow-hidden border border-[#E8E4DE] bg-[#F8F5F0]">
          <div className="flex h-44 w-full items-center justify-center bg-[#0A0F1E] px-5 text-center text-white">
            <div>
              <span className="mx-auto flex h-12 w-12 items-center justify-center border border-white/15 bg-white/10">
                <ImageIcon aria-hidden="true" className="h-6 w-6 text-white" />
              </span>
              <span className="mt-3 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                Referencia visual citada
              </span>
              <span className="mt-2 block text-sm leading-5 text-white/75">{image.alt}</span>
            </div>
          </div>
          <figcaption className="border-t border-[#E8E4DE] px-3 py-2 text-[11px] leading-relaxed text-[#6B7280]">
            Referencia:{' '}
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C8102E] hover:underline">
              {image.credit}
            </a>{' '}
            ({image.license}).
          </figcaption>
        </figure>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-[#C8102E]" />
          <h3 className="font-heading text-base font-bold text-[#1A1A2E]">{title}</h3>
        </div>
        <p className="mt-2 text-xs leading-6 text-[#6B7280]">
          Informacion resumida y parafraseada desde fuentes oficiales o repositorios con licencia abierta.
          Verifique siempre la fuente antes de realizar un tramite.
        </p>
      </div>

      <ul className="space-y-3">
        {sources.map((source) => (
          <li key={source.url} className="border-t border-[#E8E4DE] pt-3 text-xs leading-relaxed first:border-t-0 first:pt-0">
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C8102E] hover:underline">
              {source.label}
            </a>
            {source.note && <span className="mt-1 block text-[#6B7280]">{source.note}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
