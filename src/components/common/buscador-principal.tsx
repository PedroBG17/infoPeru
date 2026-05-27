'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Hospital, Briefcase, MapPin, X } from 'lucide-react';

interface SearchItem {
  title: string;
  category: 'Trámite' | 'Salud' | 'Empleo';
  url: string;
  keywords: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // Trámites
  {
    title: 'Duplicado de DNI en Lima Metropolitana',
    category: 'Trámite',
    url: '/tramites/dni-duplicado/lima',
    keywords: ['dni', 'duplicado', 'reniec', 'identidad', 'lima', 'tasa'],
  },
  {
    title: 'Duplicado de DNI en Arequipa',
    category: 'Trámite',
    url: '/tramites/dni-duplicado/arequipa',
    keywords: ['dni', 'duplicado', 'reniec', 'identidad', 'arequipa', 'merced'],
  },
  {
    title: 'Licencia de Conducir A1 en Lima Metropolitana',
    category: 'Trámite',
    url: '/tramites/licencia-de-conducir/lima',
    keywords: ['brevete', 'licencia', 'conducir', 'mtc', 'touring', 'conchan', 'lima'],
  },
  {
    title: 'Licencia de Conducir A1 en Arequipa',
    category: 'Trámite',
    url: '/tramites/licencia-de-conducir/arequipa',
    keywords: ['brevete', 'licencia', 'conducir', 'mtc', 'arequipa', 'paucarpata'],
  },
  // Hospitales / Salud
  {
    title: 'Hospitales y Clínicas en Lima Metropolitana',
    category: 'Salud',
    url: '/hospitales/lima',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'essalud', 'minsa', 'rebagliati', 'almenara', 'lima'],
  },
  {
    title: 'Hospitales y Clínicas en Arequipa',
    category: 'Salud',
    url: '/hospitales/arequipa',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'minsa', 'essalud', 'honorio delgado', 'arequipa'],
  },
  {
    title: 'Hospitales y Clínicas en Trujillo',
    category: 'Salud',
    url: '/hospitales/trujillo',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'trujillo', 'la libertad'],
  },
  // Empleos / Trabajos
  {
    title: 'Bolsa de Empleo y Trabajos en Lima Metropolitana',
    category: 'Empleo',
    url: '/trabajos/lima',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'lima', 'administracion', 'logistica'],
  },
  {
    title: 'Bolsa de Empleo y Trabajos en Arequipa',
    category: 'Empleo',
    url: '/trabajos/arequipa',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'arequipa', 'mineria', 'turismo'],
  },
  {
    title: 'Bolsa de Empleo y Trabajos en Trujillo',
    category: 'Empleo',
    url: '/trabajos/trujillo',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'trujillo', 'agroindustria', 'construccion', 'la libertad'],
  },
];

export function BuscadorPrincipal() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar resultados al escribir
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const filtered = SEARCH_DATABASE.filter((item) => {
      return (
        item.title.toLowerCase().includes(cleanQuery) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(cleanQuery)) ||
        item.category.toLowerCase().includes(cleanQuery)
      );
    });

    setResults(filtered.slice(0, 5)); // Mostrar máximo 5 resultados
    setActiveIndex(-1);
  }, [query]);

  // Navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex].url);
      } else if (results.length > 0) {
        handleSelect(results[0].url);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (url: string) => {
    router.push(url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-50">
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
        <div className="flex items-center pl-3 pr-2 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué servicio, trámite o ciudad buscas? (Ej: Brevete Lima)"
          className="flex-1 bg-transparent px-2 py-3 outline-none border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-0 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Autocomplete */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-200">
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">
            Resultados Sugeridos
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {results.map((item, index) => {
              const isActive = index === activeIndex;
              const isTramite = item.category === 'Trámite';
              const isSalud = item.category === 'Salud';
              const isEmpleo = item.category === 'Empleo';

              return (
                <li key={item.url}>
                  <button
                    onClick={() => handleSelect(item.url)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-teal-500/10 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isTramite
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
                          : isSalud
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-500'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-500'
                      }`}
                    >
                      {isTramite && <FileText className="w-4 h-4" />}
                      {isSalud && <Hospital className="w-4 h-4" />}
                      {isEmpleo && <Briefcase className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        {item.category}
                      </span>
                    </div>

                    <div className="text-slate-300 dark:text-slate-700">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mensaje de no resultados */}
      {isOpen && query.trim() !== '' && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-center z-50 text-slate-500 dark:text-slate-400 text-sm">
          No se encontraron guías o directorios relacionados con <strong className="text-slate-800 dark:text-slate-200">"{query}"</strong>.
          <p className="text-xs text-slate-400 mt-1">Prueba escribiendo "brevete", "dni", "hospital" o "arequipa".</p>
        </div>
      )}
    </div>
  );
}
