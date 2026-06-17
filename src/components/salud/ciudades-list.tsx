'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, MapPin, Search } from 'lucide-react';

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

  const filteredCiudades = initialCiudades.filter(
    (city) =>
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.departamento.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8102E]" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar ciudad o region"
          className="w-full border border-[#E8E4DE] bg-[#F8F5F0] py-3 pl-11 pr-4 text-sm text-[#1A1A2E] outline-none transition placeholder:text-[#6B7280]/70 focus:border-[#C8102E] focus:bg-white"
        />
      </div>

      {filteredCiudades.length === 0 ? (
        <div className="border border-[#E8E4DE] bg-[#F8F5F0] p-8 text-center">
          <AlertCircle className="mx-auto h-9 w-9 text-[#C8102E]" />
          <h3 className="mt-3 font-heading text-lg font-bold text-[#1A1A2E]">No se encontraron ciudades</h3>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">Prueba con otra ciudad o region.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filteredCiudades.map((city) => (
            <Link
              key={city.id}
              href={`/hospitales/${city.slug}`}
              className="group relative flex items-center gap-4 border border-[#E8E4DE] bg-white p-4 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:-translate-y-0.5 hover:border-[#C8102E]/40 hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
            >
              <span className="absolute inset-y-0 left-0 w-[3px] origin-bottom scale-y-0 bg-[#C8102E] transition group-hover:scale-y-100" />
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0A0F1E] text-white transition group-hover:bg-[#C8102E]">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-lg font-bold leading-tight text-[#1A1A2E] transition group-hover:text-[#C8102E]">
                  {city.name}
                </span>
                <span className="mt-1 block text-xs text-[#6B7280]">
                  {city.departamento.name} | {city.hospitales.length} centros de salud
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#C8102E] transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
