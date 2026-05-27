// src/app/(public)/todos/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Consulta de prueba a Supabase
  const { data: todos, error } = await supabase.from('todos').select();

  if (error) {
    console.error('Error fetching todos:', error);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Lista de Tareas (Supabase Demo)
        </h1>
        
        {todos && todos.length > 0 ? (
          <ul className="space-y-3">
            {todos.map((todo: any) => (
              <li 
                key={todo.id} 
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl"
              >
                <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {todo.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-slate-500 text-sm">
            {error ? (
              <span className="text-destructive font-medium">Error al cargar la tabla: {error.message}</span>
            ) : (
              <span>No hay registros en la tabla <code>todos</code> de Supabase o las credenciales están desactualizadas.</span>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Esta ruta demuestra el uso del cliente <code>createClient</code> de Supabase para consultas del lado del servidor (RSC).
        </div>
      </div>
    </main>
  );
}
