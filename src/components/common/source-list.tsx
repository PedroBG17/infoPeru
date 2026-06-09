import type { EditorialImage, EditorialSource } from '@/lib/editorial-sources';

type SourceListProps = {
  title?: string;
  sources: EditorialSource[];
  image?: EditorialImage;
};

export function SourceList({ title = 'Fuentes consultadas', sources, image }: SourceListProps) {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
      {image && (
        <figure className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <img
            src={image.src}
            alt={image.alt}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
          <figcaption className="px-3 py-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Imagen: {' '}
            <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 dark:text-teal-300 hover:underline">
              {image.credit}
            </a>
            {' '}({image.license}).
          </figcaption>
        </figure>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Informacion resumida y parafraseada desde fuentes oficiales o repositorios con licencia abierta. Verifique siempre la fuente antes de realizar un tramite.
        </p>
      </div>

      <ul className="space-y-3">
        {sources.map((source) => (
          <li key={source.url} className="text-xs leading-relaxed">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-600 dark:text-teal-300 hover:underline"
            >
              {source.label}
            </a>
            {source.note && (
              <span className="block text-slate-500 dark:text-slate-400 mt-0.5">{source.note}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
