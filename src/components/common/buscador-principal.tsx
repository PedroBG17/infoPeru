'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Hospital, Briefcase, MapPin, X, ArrowRight, Sparkles } from 'lucide-react';

interface SearchItem {
  title: string;
  category: 'Trámite' | 'Salud' | 'Empleo';
  url: string;
  keywords: string[];
  location: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Trámites
  {
    title: 'Duplicado de DNI',
    category: 'Trámite',
    url: '/tramites/dni-duplicado/lima',
    keywords: ['dni', 'duplicado', 'reniec', 'identidad', 'lima', 'tasa'],
    location: 'Lima Metropolitana',
  },
  {
    title: 'Duplicado de DNI',
    category: 'Trámite',
    url: '/tramites/dni-duplicado/arequipa',
    keywords: ['dni', 'duplicado', 'reniec', 'identidad', 'arequipa', 'merced'],
    location: 'Arequipa',
  },
  {
    title: 'Licencia de Conducir A1',
    category: 'Trámite',
    url: '/tramites/licencia-de-conducir/lima',
    keywords: ['brevete', 'licencia', 'conducir', 'mtc', 'touring', 'conchan', 'lima'],
    location: 'Lima Metropolitana',
  },
  {
    title: 'Licencia de Conducir A1',
    category: 'Trámite',
    url: '/tramites/licencia-de-conducir/arequipa',
    keywords: ['brevete', 'licencia', 'conducir', 'mtc', 'arequipa', 'paucarpata'],
    location: 'Arequipa',
  },
  // Hospitales / Salud
  {
    title: 'Hospitales y Clínicas',
    category: 'Salud',
    url: '/hospitales/lima',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'essalud', 'minsa', 'rebagliati', 'almenara', 'lima'],
    location: 'Lima Metropolitana',
  },
  {
    title: 'Hospitales y Clínicas',
    category: 'Salud',
    url: '/hospitales/arequipa',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'minsa', 'essalud', 'honorio delgado', 'arequipa'],
    location: 'Arequipa',
  },
  {
    title: 'Hospitales y Clínicas',
    category: 'Salud',
    url: '/hospitales/trujillo',
    keywords: ['hospital', 'clinica', 'salud', 'emergencia', 'trujillo', 'la libertad'],
    location: 'Trujillo',
  },
  // Empleos / Trabajos
  {
    title: 'Bolsa de Empleo y Trabajos',
    category: 'Empleo',
    url: '/trabajos/lima',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'lima', 'administracion', 'logistica'],
    location: 'Lima Metropolitana',
  },
  {
    title: 'Bolsa de Empleo y Trabajos',
    category: 'Empleo',
    url: '/trabajos/arequipa',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'arequipa', 'mineria', 'turismo'],
    location: 'Arequipa',
  },
  {
    title: 'Bolsa de Empleo y Trabajos',
    category: 'Empleo',
    url: '/trabajos/trujillo',
    keywords: ['empleo', 'trabajo', 'chamba', 'vacantes', 'trujillo', 'agroindustria', 'construccion', 'la libertad'],
    location: 'Trujillo',
  },
];

export function BuscadorPrincipal() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
        item.location.toLowerCase().includes(cleanQuery) ||
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
      {/* Caja de Entrada del Buscador */}
      <div 
        className={`flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border p-2 rounded-2xl shadow-xl transition-all duration-300 items-center ${
          isFocused 
            ? 'border-teal-500 ring-4 ring-teal-500/10 shadow-[0_15px_30px_-5px_rgba(20,184,166,0.25)] scale-[1.005]' 
            : 'border-slate-200/80 dark:border-slate-800/80 shadow-md'
        }`}
      >
        <div className={`flex items-center pl-3.5 pr-2 transition-colors duration-300 ${isFocused ? 'text-teal-500' : 'text-slate-400'}`}>
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué servicio, trámite o ciudad buscas? (Ej: DNI, Brevete, Arequipa)"
          className="flex-1 bg-transparent px-2 py-3 outline-none border-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm md:text-base focus:ring-0 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="p-2 mr-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Autocomplete con Efecto Glassmorphic */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden z-55 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          {/* Cabecera del Dropdown */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/55 dark:bg-slate-950/20">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            Resultados Sugeridos
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800/30">
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
                    className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-teal-500/10 dark:bg-teal-500/10'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    {/* Barra de foco activa en el borde izquierdo */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r transition-all duration-200 ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-50'}`} />

                    {/* Icono con contenedores estilizados */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                        isTramite
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30'
                          : isSalud
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100/50 dark:border-teal-900/30'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30'
                      }`}
                    >
                      {isTramite && <FileText className="w-5 h-5" />}
                      {isSalud && <Hospital className="w-5 h-5" />}
                      {isEmpleo && <Briefcase className="w-5 h-5" />}
                    </div>

                    {/* Contenido de la sugerencia */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold transition-colors duration-200 ${
                        isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-100'
                      }`}>
                        {item.title}
                      </p>
                      
                      {/* Flex de Badges informativos */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isTramite
                            ? 'bg-blue-100/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                            : isSalud
                            ? 'bg-teal-100/50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400'
                            : 'bg-amber-100/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {item.category}
                        </span>
                        
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-450 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {item.location}
                        </span>
                      </div>
                    </div>

                    {/* Indicador de Acción */}
                    <div className={`shrink-0 transition-all duration-300 ${
                      isActive 
                        ? 'text-teal-500 translate-x-0.5 opacity-100' 
                        : 'text-slate-300 dark:text-slate-700 opacity-60 group-hover:translate-x-0.5'
                    }`}>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Mensaje de no resultados con mejor diseño */}
      {isOpen && query.trim() !== '' && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-2xl p-7 text-center z-55 animate-in fade-in slide-in-from-top-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            No se encontraron resultados
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            No encontramos guías o directorios relacionados con <strong className="text-slate-700 dark:text-slate-300">"{query}"</strong>. Intenta buscando palabras como "brevete", "dni", "hospital" o el nombre de una ciudad.
          </p>
        </div>
      )}
    </div>
  );
}
