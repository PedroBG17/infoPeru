'use client';

import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Clock, MapPin, Phone, Search } from 'lucide-react';

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

const hospitalTypes = [
  { id: 'todos', label: 'Todos' },
  { id: 'minsa', label: 'MINSA' },
  { id: 'essalud', label: 'EsSalud' },
  { id: 'privado', label: 'Privados' },
];

export function HospitalesList({ initialHospitales, ciudadNombre }: HospitalesListProps) {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [only24h, setOnly24h] = useState(false);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  const filteredHospitales = initialHospitales.filter((hospital) => {
    const matchesSearch =
      hospital.nombre.toLowerCase().includes(search.toLowerCase()) ||
      hospital.direccion.toLowerCase().includes(search.toLowerCase()) ||
      (hospital.telefono && hospital.telefono.includes(search));

    const matchesTipo = filterTipo === 'todos' || hospital.tipo.toLowerCase() === filterTipo.toLowerCase();
    const matches24h = !only24h || hospital.horario24h;

    return matchesSearch && matchesTipo && matches24h;
  });

  const toggleMap = (id: string) => {
    setExpandedMapId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-5">
      <div className="border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8102E]" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, direccion o telefono"
            className="w-full border border-[#E8E4DE] bg-[#F8F5F0] py-3 pl-11 pr-4 text-sm text-[#1A1A2E] outline-none transition placeholder:text-[#6B7280]/70 focus:border-[#C8102E] focus:bg-white"
          />
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {hospitalTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterTipo(type.id)}
                className={`border px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                  filterTipo === type.id
                    ? 'border-[#C8102E] bg-[#C8102E] text-white'
                    : 'border-[#E8E4DE] bg-[#F8F5F0] text-[#6B7280] hover:border-[#C8102E]/40 hover:text-[#C8102E]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280] transition hover:text-[#C8102E]">
            <input
              type="checkbox"
              checked={only24h}
              onChange={() => setOnly24h((value) => !value)}
              className="h-4 w-4 border-[#E8E4DE] bg-white text-[#C8102E] focus:ring-[#C8102E]"
            />
            Solo 24h
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {filteredHospitales.length === 0 ? (
          <div className="border border-[#E8E4DE] bg-white p-10 text-center shadow-[0_1px_3px_rgba(10,15,30,.08)]">
            <AlertCircle className="mx-auto h-10 w-10 text-[#C8102E]" />
            <h3 className="mt-3 font-heading text-lg font-bold text-[#1A1A2E]">No se encontraron centros de salud</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Intenta removiendo filtros o cambiando los terminos de busqueda.
            </p>
          </div>
        ) : (
          filteredHospitales.map((hospital) => {
            const isExpandedMap = expandedMapId === hospital.id;

            return (
              <article
                key={hospital.id}
                className="border border-[#E8E4DE] bg-white p-5 shadow-[0_1px_3px_rgba(10,15,30,.08)] transition hover:shadow-[0_8px_24px_rgba(10,15,30,.14)]"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="border border-[#C8102E]/20 bg-[#C8102E]/[0.06] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C8102E]">
                        {hospital.tipo}
                      </span>
                      {hospital.horario24h && (
                        <span className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          <Clock className="h-3 w-3" />
                          24h
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-xl font-bold leading-tight text-[#1A1A2E]">{hospital.nombre}</h3>

                    <div className="mt-3 space-y-2 text-sm leading-6 text-[#6B7280]">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#C8102E]" />
                        <span>{hospital.direccion}</span>
                      </div>
                      {hospital.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-[#C8102E]" />
                          <span>{hospital.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
                    {hospital.telefono && (
                      <a
                        href={`tel:${hospital.telefono.replace(/\s+/g, '')}`}
                        className="inline-flex h-10 items-center justify-center gap-2 bg-[#C8102E] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9B0B22]"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Llamar
                      </a>
                    )}
                    <button
                      onClick={() => toggleMap(hospital.id)}
                      className="inline-flex h-10 items-center justify-center gap-2 border border-[#E8E4DE] bg-[#F8F5F0] px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A1A2E] transition hover:border-[#C8102E]/40 hover:text-[#C8102E]"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {isExpandedMap ? 'Cerrar mapa' : 'Ver mapa'}
                      {isExpandedMap ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {isExpandedMap && (
                  <div className="mt-5 h-80 w-full overflow-hidden border border-[#E8E4DE] bg-[#F8F5F0]">
                    <iframe
                      title={`Mapa de ubicacion para ${hospital.nombre}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(`${hospital.nombre} ${hospital.direccion} ${ciudadNombre} Peru`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
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
