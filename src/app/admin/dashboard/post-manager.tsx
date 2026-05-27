// src/app/admin/dashboard/post-manager.tsx
'use client';

import React, { useState, useTransition } from 'react';
import { createPostAction, deletePostAction } from './actions';
import { 
  FileText, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Link, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  createdAt: Date;
}

interface PostManagerProps {
  initialPosts: Post[];
}

export function PostManager({ initialPosts }: PostManagerProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isNewFormOpen, setIsNewFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Generate clean slug with accent normalization
    const cleaned = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accent marks
      .replace(/ñ/g, 'n')              // replace ñ with n
      .replace(/[^a-z0-9\s-_]/g, '')   // remove other special characters
      .replace(/\s+/g, '-')            // replace spaces with dashes
      .replace(/-+/g, '-');            // merge multiple dashes
    setSlug(cleaned);
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    formData.append('author', author);

    startTransition(async () => {
      const res = await createPostAction(null, formData);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Publicado con éxito.' });
        // Add to state list
        const newPost: Post = {
          id: Math.random().toString(), // temp ID for UI list before refresh
          title,
          slug,
          excerpt: excerpt || null,
          author: author || 'Redacción Central',
          createdAt: new Date(),
        };
        setPosts([newPost, ...posts]);
        // Reset form
        setTitle('');
        setSlug('');
        setExcerpt('');
        setContent('');
        setAuthor('');
        setIsNewFormOpen(false);
      }
    });
  };

  const handleDeletePost = async (id: string, slugName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la noticia "${slugName}"?`)) return;

    const res = await deletePostAction(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
      setMessage({ type: 'success', text: res.message || 'Noticia eliminada.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al eliminar.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications banner */}
      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          message.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
            : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold">{message.text}</p>
          </div>
        </div>
      )}

      {/* Title & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Artículos y Noticias Publicadas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra las guías y artículos informativos almacenados en Supabase.
          </p>
        </div>
        
        <button
          onClick={() => setIsNewFormOpen(!isNewFormOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Redactar Artículo
        </button>
      </div>

      {/* New Article Form */}
      {isNewFormOpen && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Nueva Entrada del Portal</h3>
          
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Título de la Noticia</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Ej: Guía completa para renovar DNI vencido en 2026"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ruta URL (Slug)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-sm select-none">/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="guia-renovacion-dni-2026"
                    className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Autor del Artículo</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej: Redacción Central"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen Corto (Excerpt)</label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Ej: Pasos detallados, costo del trámite y oficinas autorizadas..."
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contenido de la Noticia (Formato HTML)</label>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido aquí. Puedes utilizar etiquetas de HTML como <p>, <h3>, <ul>, <li> para estructurar la noticia..."
                className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewFormOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publicar Noticia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Articles List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
        {posts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Aún no has redactado ninguna noticia. ¡Haz clic en "Redactar Artículo" para crear la primera!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Artículo</th>
                  <th className="px-6 py-4">Ruta URL</th>
                  <th className="px-6 py-4">Autor</th>
                  <th className="px-6 py-4">Publicado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 divide-slate-800/60">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100 line-clamp-1">{post.title}</div>
                      {post.excerpt && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{post.excerpt}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-400 bg-slate-950 px-2 py-1 rounded-lg border border-teal-900/30">
                        <Link className="w-3 h-3 text-slate-500" />
                        /{post.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-xs text-slate-400">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {post.author}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        {new Date(post.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 transition-all"
                          title="Ver en la web"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeletePost(post.id, post.slug)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg border border-slate-700 hover:border-rose-900/40 transition-all"
                          title="Eliminar noticia"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
