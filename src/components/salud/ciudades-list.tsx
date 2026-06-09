// src/components/salud/ciudades-list.tsx
'use client';

import React, { useState } from 'react';
import { MapPin, ChevronRight, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Ciudad {
  id: string;
  name: string;
  slug: string;
  departamento: {
    id: string;
    name: string;
    slug: string;
  };
  hospitales: Array<{ id: string }>;
}

interface CiudadesListProps {
  initialCiudades: Ciudad[];
}

export function CiudadesList({ initialCiudades }: CiudadesListProps) {
  const [search, setSearch] = useState('');

  // Filter cities by search term
  const filteredCiudades = initialCiudades.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.departamento.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Caja de Búsqueda de Ciudades */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-450 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Escribe el nombre de tu ciudad o región (Ej. Lima, Arequipa, Piura)..."
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
        />
      </div>

      {/* Grid de Ciudades */}
      {filteredCiudades.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 rounded-2xl p-10 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">
            No se encontraron ciudades
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-450">
            Intenta buscando otra región o revisa la ortografía de la consulta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCiudades.map((c) => (
            <Link
              key={c.id}
              href={`/hospitales/${c.slug}`}
              className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-teal-500/40 dark:hover:border-teal-500/40 hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-all duration-300"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/45 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-450 block">
                    Región {c.departamento.name} • {c.hospitales.length} centros de salud
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 dark:group-hover:text-teal-400 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
