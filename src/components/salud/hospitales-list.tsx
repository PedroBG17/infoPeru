// src/components/salud/hospitales-list.tsx
'use client';

import React, { useState } from 'react';
import { Phone, MapPin, Clock, Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface Hospital {
  id: string;
  nombre: string;
  slug: string;
  tipo: string;
  direccion: string;
  telefono: string | null;
  horario24h: boolean;
  ciudadId: string;
}

interface HospitalesListProps {
  initialHospitales: Hospital[];
  ciudadNombre: string;
}

export function HospitalesList({ initialHospitales, ciudadNombre }: HospitalesListProps) {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos'); // 'todos', 'minsa', 'essalud', 'privado'
  const [only24h, setOnly24h] = useState(false);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  // Apply searching and filtering
  const filteredHospitales = initialHospitales.filter((h) => {
    const matchesSearch = 
      h.nombre.toLowerCase().includes(search.toLowerCase()) ||
      h.direccion.toLowerCase().includes(search.toLowerCase()) ||
      (h.telefono && h.telefono.includes(search));

    const matchesTipo = 
      filterTipo === 'todos' || 
      h.tipo.toLowerCase() === filterTipo.toLowerCase();

    const matches24h = !only24h || h.horario24h;

    return matchesSearch && matchesTipo && matches24h;
  });

  const toggleMap = (id: string) => {
    if (expandedMapId === id) {
      setExpandedMapId(null);
    } else {
      setExpandedMapId(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Filtros Box */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        
        {/* Fila 1: Caja de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-450 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de centro de salud, dirección o teléfono..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Fila 2: Selector de Categorías (Pills) y Filtro 24h */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'minsa', label: 'MINSA' },
              { id: 'essalud', label: 'EsSalud' },
              { id: 'privado', label: 'Clínicas / Privados' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterTipo(pill.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  filterTipo === pill.id
                    ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 text-slate-650 dark:text-slate-400'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Toggle 24h */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={only24h}
              onChange={() => setOnly24h(!only24h)}
              className="w-4 h-4 text-teal-600 border-slate-350 dark:border-slate-850 rounded-sm focus:ring-teal-500 bg-slate-50 dark:bg-slate-950"
            />
            <span>Solo Emergencias 24h</span>
          </label>
        </div>
      </div>

      {/* Listado de Centros Médicos */}
      <div className="space-y-4">
        {filteredHospitales.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              No se encontraron centros de salud
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 max-w-sm mx-auto">
              Intenta removiendo filtros o cambiando los términos de búsqueda (Ej. "MINSA", "EsSalud" o palabras clave).
            </p>
          </div>
        ) : (
          filteredHospitales.map((h) => {
            const isEsSalud = h.tipo.toUpperCase() === 'ESSALUD';
            const isMinsa = h.tipo.toUpperCase() === 'MINSA';
            const isExpandedMap = expandedMapId === h.id;

            return (
              <article
                key={h.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all duration-300 relative"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  {/* Info Hospital */}
                  <div className="space-y-3.5 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide border ${
                          isEsSalud
                            ? 'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-950/45 dark:border-sky-900/30 dark:text-sky-300'
                            : isMinsa
                            ? 'bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/45 dark:border-teal-900/30 dark:text-teal-300'
                            : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/45 dark:border-amber-900/30 dark:text-amber-300'
                        }`}
                      >
                        {h.tipo}
                      </span>
                      {h.horario24h && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/20 dark:text-emerald-300">
                          <Clock className="w-3 h-3 mr-1" />
                          Urgencias 24h
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {h.nombre}
                    </h3>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-light">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{h.direccion}</span>
                      </div>
                      {h.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{h.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    {h.telefono && (
                      <a
                        href={`tel:${h.telefono.replace(/\s+/g, '')}`}
                        className="inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 shadow-xs transition"
                      >
                        <Phone className="w-3.5 h-3.5 mr-1.5" />
                        Llamar de Emergencia
                      </a>
                    )}
                    <button
                      onClick={() => toggleMap(h.id)}
                      className={`inline-flex h-9 items-center justify-center px-4 rounded-xl text-xs font-bold transition-all ${
                        isExpandedMap
                          ? 'bg-slate-900 dark:bg-slate-800 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      {isExpandedMap ? 'Cerrar Mapa' : 'Ver Mapa de Ruta'}
                      {isExpandedMap ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>
                </div>

                {/* Google Maps Embed iframe */}
                {isExpandedMap && (
                  <div className="mt-5 w-full h-80 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-200">
                    <iframe
                      title={`Mapa de ubicación para ${h.nombre}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(h.nombre + ' ' + h.direccion + ' ' + ciudadNombre + ' Peru')}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                )}

              </article>
            );
          })
        )}
      </div>

    </div>
  );
}
