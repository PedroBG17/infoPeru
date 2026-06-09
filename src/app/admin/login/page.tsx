import React from 'react';
import { redirect } from 'next/navigation';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { getAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth';
import { getMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export async function generateMetadata() {
  return getMetadata({
    title: 'Acceso Admin',
    description: 'Acceso seguro al panel administrativo de DataPerú.',
    slug: '/admin/login',
    noIndex: true,
  });
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();
  if (session) redirect('/admin/dashboard?tab=portal');

  const params = await searchParams;
  const configured = isAdminAuthConfigured();
  const errorMessage = getErrorMessage(params.error, configured);
  const next = sanitizeNext(params.next);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-12">
        <section className="flex flex-col justify-center px-6 py-12 lg:col-span-7">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Consola protegida
            </span>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-black tracking-tight sm:text-5xl">
                Acceso seguro al CMS
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-350">
                Panel privado para gestionar noticias, portada, SEO, trámites, salud, empleo y contenido territorial del portal.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center px-6 py-12 lg:col-span-5">
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-slate-950">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">Iniciar sesión</h2>
                <p className="text-xs text-slate-500">Solo administradores autorizados.</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-rose-800/50 bg-rose-950/40 px-4 py-3 text-xs font-semibold leading-5 text-rose-200">
                {errorMessage}
              </div>
            )}

            <form method="post" action="/admin/login/submit" className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                  required
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contraseña</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={!configured}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-500 px-5 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Entrar al CMS
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function sanitizeNext(value: string | undefined) {
  if (!value || !value.startsWith('/admin') || value.startsWith('/admin/login')) {
    return '/admin/dashboard?tab=portal';
  }
  return value;
}

function getErrorMessage(error: string | undefined, configured: boolean) {
  if (!configured) {
    return 'El acceso admin todavía no está configurado. Define ADMIN_EMAIL, ADMIN_PASSWORD_HASH y ADMIN_SESSION_SECRET.';
  }
  if (error === 'credentials') return 'Credenciales inválidas. Revisa el email y la contraseña.';
  if (error === 'expired') return 'Tu sesión expiró. Vuelve a ingresar.';
  if (error === 'rate-limit') return 'Demasiados intentos. Espera unos minutos antes de volver a probar.';
  return null;
}
