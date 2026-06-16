'use client';

import React, { useState, useTransition, useRef } from 'react';
import { 
  createPostAction, 
  deletePostAction, 
  updatePostAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createTagAction,
  updateTagAction,
  deleteTagAction,
  bulkDeletePostsAction,
  bulkPublishPostsAction,
  bulkChangeCategoryAction,
  deleteMediaAction
} from './actions';
import { RichTextEditor } from './rich-text-editor';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Folder,
  Tag as TagIcon,
  Image as ImageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Copy,
  ChevronDown,
  Globe,
  Eye,
  BookOpen
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage?: string | null;
  published: boolean;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  metaTitle: string | null;
  metaDescription: string | null;
  readingTime: number | null;
  viewCount: number;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  tags?: {
    id: string;
    name: string;
  }[];
}

interface PostManagerProps {
  initialPosts: Post[];
  categories: Category[];
  tags: Tag[];
  mediaFiles: Media[];
}

export function PostManager({ initialPosts, categories: initialCategories, tags: initialTags, mediaFiles: initialMediaFiles }: PostManagerProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [mediaFiles, setMediaFiles] = useState<Media[]>(initialMediaFiles);

  // General Tabs: 'posts' | 'categories' | 'tags' | 'media'
  const [currentSubTab, setCurrentSubTab] = useState<'posts' | 'categories' | 'tags' | 'media'>('posts');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Search & Filters States (Posts) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // --- Bulk Selection States ---
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('');

  // --- Post Form States ---
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState(true);
  const [postCategoryId, setPostCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // --- Taxonomy Form States (Categories/Tags) ---
  const [taxName, setTaxName] = useState('');
  const [taxSlug, setTaxSlug] = useState('');
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);

  // --- Media Uploader States ---
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Media Select Modal State (Integrated in RichText / Cover) ---
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaPurpose, setMediaPurpose] = useState<'cover' | 'editor' | null>(null);
  const [editorInsertCallback, setEditorInsertCallback] = useState<((url: string) => void) | null>(null);

  // --- Auto-generate slugs ---
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPostId) {
      setSlug(generateSlug(val));
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // accent marks
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // --- Post Submission ---
  const handleCreateOrUpdatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    formData.append('coverImage', coverImage);
    formData.append('author', author || 'Redacción Central');
    formData.append('published', published ? 'true' : 'false');
    formData.append('categoryId', postCategoryId);
    formData.append('tagIds', JSON.stringify(selectedTagIds));
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);

    if (editingPostId) {
      formData.append('id', editingPostId);
    }

    startTransition(async () => {
      const res = editingPostId 
        ? await updatePostAction(null, formData)
        : await createPostAction(null, formData);

      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success) {
        setMessage({ type: 'success', text: res.message });
        
        // Refresh local memory from database would be ideal, but for UI responsiveness:
        // We trigger manual reload or update local state
        // Let's reload local listings by fetching in actions or simply letting Server Actions trigger revalidatePath.
        // To update client state instantly:
        const targetCategory = categories.find(c => c.id === postCategoryId);
        const targetTags = tags.filter(t => selectedTagIds.includes(t.id));

        if (editingPostId) {
          setPosts(posts.map(p => p.id === editingPostId ? {
            ...p,
            title: title.trim(),
            slug,
            content: content.trim(),
            excerpt: excerpt ? excerpt.trim() : null,
            coverImage: coverImage ? coverImage.trim() : null,
            author: author || 'Redacción Central',
            published,
            categoryId: postCategoryId || null,
            category: targetCategory ? { id: targetCategory.id, name: targetCategory.name } : null,
            tags: targetTags.map(t => ({ id: t.id, name: t.name })),
            metaTitle: metaTitle ? metaTitle.trim() : null,
            metaDescription: metaDescription ? metaDescription.trim() : null,
            readingTime: Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200)),
            updatedAt: new Date()
          } : p));
          setEditingPostId(null);
        } else {
          const newPost: Post = {
            id: Math.random().toString(), // Temp ID
            title: title.trim(),
            slug,
            content: content.trim(),
            excerpt: excerpt ? excerpt.trim() : null,
            coverImage: coverImage ? coverImage.trim() : null,
            author: author || 'Redacción Central',
            published,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoryId: postCategoryId || null,
            category: targetCategory ? { id: targetCategory.id, name: targetCategory.name } : null,
            tags: targetTags.map(t => ({ id: t.id, name: t.name })),
            metaTitle: metaTitle ? metaTitle.trim() : null,
            metaDescription: metaDescription ? metaDescription.trim() : null,
            readingTime: Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length / 200)),
            viewCount: 0
          };
          setPosts([newPost, ...posts]);
        }

        resetPostForm();
      }
    });
  };

  const resetPostForm = () => {
    setTitle('');
    setSlug('');
    setExcerpt('');
    setCoverImage('');
    setContent('');
    setAuthor('');
    setPublished(true);
    setPostCategoryId('');
    setSelectedTagIds([]);
    setMetaTitle('');
    setMetaDescription('');
    setEditingPostId(null);
    setIsFormOpen(false);
  };

  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || '');
    setCoverImage(post.coverImage || '');
    setContent(post.content || '');
    setAuthor(post.author);
    setPublished(post.published);
    setPostCategoryId(post.categoryId || '');
    setSelectedTagIds(post.tags?.map(t => t.id) || []);
    setMetaTitle(post.metaTitle || '');
    setMetaDescription(post.metaDescription || '');
    setIsFormOpen(true);
    
    window.scrollTo({ top: 220, behavior: 'smooth' });
  };

  const handleDeletePost = async (id: string, slugName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la noticia "${slugName}"?`)) return;
    const res = await deletePostAction(id);
    if (res.success) {
      setPosts(posts.filter(p => p.id !== id));
      setMessage({ type: 'success', text: res.message });
      if (editingPostId === id) resetPostForm();
    } else {
      setMessage({ type: 'error', text: res.error || 'Error al eliminar.' });
    }
  };

  // --- Category / Tag Submissions ---
  const handleTaxonomySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append('name', taxName);
    formData.append('slug', taxSlug || generateSlug(taxName));
    if (editingTaxId) {
      formData.append('id', editingTaxId);
    }

    startTransition(async () => {
      let res;
      if (currentSubTab === 'categories') {
        res = editingTaxId 
          ? await updateCategoryAction(null, formData)
          : await createCategoryAction(null, formData);
      } else {
        res = editingTaxId 
          ? await updateTagAction(null, formData)
          : await createTagAction(null, formData);
      }

      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else if (res.success) {
        setMessage({ type: 'success', text: res.message });
        
        // Simular actualización local para evitar peticiones redundantes
        const newSlug = taxSlug || generateSlug(taxName);
        if (currentSubTab === 'categories') {
          if (editingTaxId) {
            setCategories(categories.map(c => c.id === editingTaxId ? { ...c, name: taxName, slug: newSlug } : c));
          } else {
            setCategories([...categories, { id: Math.random().toString(), name: taxName, slug: newSlug, _count: { posts: 0 } }]);
          }
        } else {
          if (editingTaxId) {
            setTags(tags.map(t => t.id === editingTaxId ? { ...t, name: taxName, slug: newSlug } : t));
          } else {
            setTags([...tags, { id: Math.random().toString(), name: taxName, slug: newSlug, _count: { posts: 0 } }]);
          }
        }

        setTaxName('');
        setTaxSlug('');
        setEditingTaxId(null);
      }
    });
  };

  const startEditingTax = (item: Category | Tag) => {
    setEditingTaxId(item.id);
    setTaxName(item.name);
    setTaxSlug(item.slug);
  };

  const handleDeleteTax = async (id: string, name: string) => {
    if (!confirm(`¿Deseas eliminar permanentemente "${name}"?`)) return;
    
    startTransition(async () => {
      const res = currentSubTab === 'categories' 
        ? await deleteCategoryAction(id)
        : await deleteTagAction(id);

      if (res.success) {
        setMessage({ type: 'success', text: res.message });
        if (currentSubTab === 'categories') {
          setCategories(categories.filter(c => c.id !== id));
        } else {
          setTags(tags.filter(t => t.id !== id));
        }
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al eliminar.' });
      }
    });
  };

  // --- Bulk Operations ---
  const handleBulkAction = async (action: 'delete' | 'publish' | 'draft' | 'category') => {
    if (selectedPostIds.length === 0) return;
    setMessage(null);

    const confirmMsg = action === 'delete' 
      ? `¿Estás seguro de que deseas eliminar los ${selectedPostIds.length} artículos seleccionados?`
      : `¿Proceder con la acción por lote para ${selectedPostIds.length} artículos?`;

    if (!confirm(confirmMsg)) return;

    startTransition(async () => {
      let res;
      if (action === 'delete') {
        res = await bulkDeletePostsAction(selectedPostIds);
        if (res.success) setPosts(posts.filter(p => !selectedPostIds.includes(p.id)));
      } else if (action === 'publish' || action === 'draft') {
        const publish = action === 'publish';
        res = await bulkPublishPostsAction(selectedPostIds, publish);
        if (res.success) {
          setPosts(posts.map(p => selectedPostIds.includes(p.id) ? { ...p, published: publish } : p));
        }
      } else if (action === 'category') {
        res = await bulkChangeCategoryAction(selectedPostIds, bulkCategoryTarget || null);
        if (res.success) {
          const targetCat = categories.find(c => c.id === bulkCategoryTarget);
          setPosts(posts.map(p => selectedPostIds.includes(p.id) ? { 
            ...p, 
            categoryId: bulkCategoryTarget || null,
            category: targetCat ? { id: targetCat.id, name: targetCat.name } : null
          } : p));
        }
      }

      if (res?.success) {
        setMessage({ type: 'success', text: res.message });
        setSelectedPostIds([]);
      } else {
        setMessage({ type: 'error', text: res?.error || 'Ocurrió un error en la operación por lote.' });
      }
    });
  };

  const toggleSelectPost = (id: string) => {
    setSelectedPostIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredPosts: Post[]) => {
    const filteredIds = filteredPosts.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedPostIds.includes(id));
    
    if (allSelected) {
      setSelectedPostIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedPostIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // --- Media Uploader Operations ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadingMedia(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setMediaFiles([data.media, ...mediaFiles]);
        setMessage({ type: 'success', text: 'Archivo cargado con éxito en la biblioteca.' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al subir el archivo.' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error de red al intentar cargar el archivo.' });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string, url: string) => {
    if (!confirm('¿Seguro de que deseas eliminar esta imagen de la biblioteca?')) return;
    
    startTransition(async () => {
      const res = await deleteMediaAction(id, url);
      if (res.success) {
        setMediaFiles(mediaFiles.filter(m => m.id !== id));
        setMessage({ type: 'success', text: res.message });
      } else {
        setMessage({ type: 'error', text: res.error || 'Error al eliminar.' });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Enlace de imagen copiado al portapapeles!');
  };

  // --- Selection in Modal ---
  const handleOpenMediaLibrary = (callback: (url: string) => void) => {
    setMediaPurpose('editor');
    setEditorInsertCallback(() => callback);
    setIsMediaModalOpen(true);
  };

  const handleSelectMediaInModal = (url: string) => {
    if (mediaPurpose === 'cover') {
      setCoverImage(url);
    } else if (mediaPurpose === 'editor' && editorInsertCallback) {
      editorInsertCallback(url);
    }
    setIsMediaModalOpen(false);
    setMediaPurpose(null);
    setEditorInsertCallback(null);
  };

  // --- Tag Helper Toggle ---
  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // --- Filtering Logic (Posts) ---
  const getSeoScore = (post: Post) => {
    let score = 0;
    const seoTitle = post.metaTitle || post.title;
    const seoDescription = post.metaDescription || post.excerpt || '';

    if (seoTitle.length >= 30 && seoTitle.length <= 65) score += 25;
    if (seoDescription.length >= 110 && seoDescription.length <= 160) score += 25;
    if (post.coverImage) score += 20;
    if (post.categoryId) score += 15;
    if (post.readingTime && post.readingTime >= 2) score += 10;
    if (post.published) score += 5;

    return score;
  };

  const publishedCount = posts.filter(post => post.published).length;
  const draftCount = posts.length - publishedCount;
  const seoReadyCount = posts.filter(post => getSeoScore(post) >= 80).length;
  const missingCoverCount = posts.filter(post => !post.coverImage).length;

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || post.categoryId === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'published' && post.published) || 
                          (statusFilter === 'draft' && !post.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Notifications Banner */}
      {message && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-in fade-in duration-200 ${
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

      {/* Sub tabs Menu */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-900 pb-1.5 gap-4">
        <div className="flex items-center gap-1.5 bg-slate-900/50 p-1 rounded-xl border border-slate-900">
          <button
            onClick={() => { setCurrentSubTab('posts'); setMessage(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              currentSubTab === 'posts' 
                ? 'bg-teal-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Artículos
          </button>
          <button
            onClick={() => { setCurrentSubTab('categories'); setMessage(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              currentSubTab === 'categories' 
                ? 'bg-teal-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            Categorías
          </button>
          <button
            onClick={() => { setCurrentSubTab('tags'); setMessage(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              currentSubTab === 'tags' 
                ? 'bg-teal-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            Etiquetas
          </button>
          <button
            onClick={() => { setCurrentSubTab('media'); setMessage(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              currentSubTab === 'media' 
                ? 'bg-teal-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Biblioteca
          </button>
        </div>

        {currentSubTab === 'posts' && !isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Redactar Artículo
          </button>
        )}
      </div>

      {/* --- Tab 1: Articles Panel --- */}
      {currentSubTab === 'posts' && (
        <div className="space-y-6">
          {/* Create or Edit post form */}
          {isFormOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-100">
                  {editingPostId ? `Editar Artículo: ${title}` : 'Nueva Entrada del Portal'}
                </h3>
                <button
                  type="button"
                  onClick={resetPostForm}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateOrUpdatePost} className="space-y-6">
                {/* Visual Title and Slug */}
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
                        onChange={(e) => setSlug(generateSlug(e.target.value))}
                        placeholder="guia-renovacion-dni-2026"
                        className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Author, Excerpt & Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Autor</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Ej: Redacción Central"
                      className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categoría</label>
                    <div className="relative">
                      <select
                        value={postCategoryId}
                        onChange={(e) => setPostCategoryId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Sin Categoría</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resumen (Excerpt)</label>
                    <input
                      type="text"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Breve resumen informativo..."
                      className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Cover Image Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imagen de Portada</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="URL publica de imagen o selecciona desde biblioteca"
                      className="flex-1 bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => { setMediaPurpose('cover'); setIsMediaModalOpen(true); }}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Elegir de Biblioteca
                    </button>
                  </div>
                  {coverImage && (
                    <div className="mt-2.5 w-40 h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={coverImage} alt="Vista previa de portada" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Tags Multi-select */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Etiquetas del Artículo</label>
                  {tags.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No hay etiquetas creadas. Ve a la pestaña de etiquetas para agregar algunas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      {tags.map(tag => {
                        const isSelected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTagSelection(tag.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              isSelected 
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' 
                                : 'bg-slate-900 text-slate-400 border border-transparent hover:border-slate-800'
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* WYSIWYG Content Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contenido de la Noticia</label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Redacta el artículo aquí..."
                    onOpenMediaLibrary={handleOpenMediaLibrary}
                  />
                </div>

                {/* Advanced SEO Fields Panel */}
                <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Metadatos SEO Avanzados</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 text-slate-400 mb-1.5">Meta Título (SEO Title)</label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder="Si se deja en blanco, usará el título principal"
                        maxLength={70}
                        className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 text-slate-400 mb-1.5">Meta Descripción (SEO Description)</label>
                      <input
                        type="text"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder="Si se deja en blanco, usará el resumen inicial"
                        maxLength={160}
                        className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Publishing State & Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-450 text-slate-450 text-slate-400 uppercase tracking-wider">Estado de publicación:</label>
                    <button
                      type="button"
                      onClick={() => setPublished(!published)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        published 
                          ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-450 text-emerald-400' 
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {published ? 'Publicado (Live)' : 'Borrador (Draft)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetPostForm}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-350 text-xs font-bold rounded-xl border border-slate-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {editingPostId ? 'Guardar Cambios' : 'Publicar Entrada'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Editorial health cards */}
          {!isFormOpen && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Publicados</span>
                <div className="mt-2 text-2xl font-black text-emerald-400">{publishedCount}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Borradores</span>
                <div className="mt-2 text-2xl font-black text-slate-200">{draftCount}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SEO listo</span>
                <div className="mt-2 text-2xl font-black text-teal-400">{seoReadyCount}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sin portada</span>
                <div className="mt-2 text-2xl font-black text-amber-400">{missingCoverCount}</div>
              </div>
            </div>
          )}

          {/* Filter Toolbar */}
          {!isFormOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar artículo..."
                    className="w-full bg-slate-950 border border-slate-850 border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 transition-colors"
                  />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="bg-slate-950 border border-slate-850 border-slate-800/60 rounded-xl pl-4 pr-9 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Todas las Categorías</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'all' | 'published' | 'draft');
                      setCurrentPage(1);
                    }}
                    className="bg-slate-950 border border-slate-850 border-slate-800/60 rounded-xl pl-4 pr-9 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3.5 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Reset Filters */}
              {(searchTerm || categoryFilter || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setCategoryFilter(''); setStatusFilter('all'); }}
                  className="text-xs text-slate-450 hover:text-teal-400 font-semibold"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}

          {/* Bulk Operations Toolbar */}
          {!isFormOpen && selectedPostIds.length > 0 && (
            <div className="bg-slate-900 border border-teal-900/30 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  {selectedPostIds.length} seleccionados
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-850 border-slate-850 text-slate-350 text-xs font-bold rounded-xl transition-all"
                >
                  Publicar
                </button>
                <button
                  onClick={() => handleBulkAction('draft')}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-850 text-slate-350 text-xs font-bold rounded-xl transition-all"
                >
                  Despublicar
                </button>
                
                {/* Bulk Category Change */}
                <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                  <select
                    value={bulkCategoryTarget}
                    onChange={(e) => setBulkCategoryTarget(e.target.value)}
                    className="bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Mover a...</option>
                    <option value="none">Sin Categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleBulkAction('category')}
                    disabled={!bulkCategoryTarget}
                    className="px-3 py-1.5 bg-teal-500 text-slate-950 text-xs font-bold rounded-xl disabled:opacity-30 transition-all"
                  >
                    Mover
                  </button>
                </div>

                <div className="w-px h-5 bg-slate-800 mx-1" />

                <button
                  onClick={() => handleBulkAction('delete')}
                  className="p-2 bg-slate-850 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 hover:border-rose-900/40 transition-all"
                  title="Eliminar seleccionados"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Posts list table */}
          {!isFormOpen && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
              {paginatedPosts.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  Ningún artículo coincide con los criterios de búsqueda actuales.
                </div>
              ) : (
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider select-none">
                        <tr>
                          <th className="px-6 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={paginatedPosts.every(p => selectedPostIds.includes(p.id))}
                              onChange={() => toggleSelectAll(paginatedPosts)}
                              className="w-4 h-4 rounded-sm border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4">Artículo</th>
                          <th className="px-6 py-4">Categoría</th>
                          <th className="px-6 py-4">SEO</th>
                          <th className="px-6 py-4">Métricas</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 divide-slate-800/60">
                        {paginatedPosts.map((post) => {
                          const isSelected = selectedPostIds.includes(post.id);
                          const seoScore = getSeoScore(post);
                          return (
                            <tr key={post.id} className={`hover:bg-slate-800/10 transition-colors ${
                              isSelected ? 'bg-teal-500/5' : ''
                            }`}>
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectPost(post.id)}
                                  className="w-4 h-4 rounded-sm border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950 cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {post.coverImage && (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-100 line-clamp-1">{post.title}</div>
                                    <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-slate-500 font-mono">
                                      /{post.slug}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {post.category ? (
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-950/60 text-teal-400 border border-teal-800/30">
                                    {post.category.name}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 italic">Sin Categoría</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="min-w-[120px]">
                                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                                    <span className={seoScore >= 80 ? 'text-emerald-400' : seoScore >= 55 ? 'text-amber-400' : 'text-rose-400'}>
                                      {seoScore >= 80 ? 'Optimo' : seoScore >= 55 ? 'Mejorable' : 'Incompleto'}
                                    </span>
                                    <span className="text-slate-500">{seoScore}%</span>
                                  </div>
                                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-950">
                                    <div
                                      className={seoScore >= 80 ? 'h-full bg-emerald-500' : seoScore >= 55 ? 'h-full bg-amber-500' : 'h-full bg-rose-500'}
                                      style={{ width: `${seoScore}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                    {post.viewCount} visitas
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                                    {post.readingTime || 1} min de lectura
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  post.published 
                                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500'
                                }`}>
                                  {post.published ? 'Publicado' : 'Borrador'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <a
                                    href={`/${post.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 rounded-lg border border-slate-800 transition-all"
                                    title="Ver en la web"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() => startEditing(post)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-teal-450 hover:text-teal-400 rounded-lg border border-slate-800 transition-all"
                                    title="Editar noticia"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post.id, post.slug)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-550 hover:border-rose-900/40 rounded-lg border border-slate-800 transition-all"
                                    title="Eliminar noticia"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="bg-slate-950 border-t border-slate-850 border-slate-800 px-6 py-4 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Mostrando {((currentPage - 1) * postsPerPage) + 1} - {Math.min(currentPage * postsPerPage, filteredPosts.length)} de {filteredPosts.length} entradas
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-450 hover:text-slate-200 rounded-lg disabled:opacity-40 disabled:hover:bg-slate-900"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-semibold px-3 text-slate-455">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-455 hover:text-slate-200 rounded-lg disabled:opacity-40 disabled:hover:bg-slate-900"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- Tab 2: Categories Panel --- */}
      {currentSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Editor Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-md font-bold mb-4 text-slate-100 flex items-center gap-2">
              <Folder className="w-4 h-4 text-teal-400" />
              {editingTaxId ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
            </h3>
            
            <form onSubmit={handleTaxonomySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => { setTaxName(e.target.value); if (!editingTaxId) setTaxSlug(generateSlug(e.target.value)); }}
                  placeholder="Ej: Salud y Bienestar"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-250 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ruta URL (Slug)</label>
                <input
                  type="text"
                  value={taxSlug}
                  onChange={(e) => setTaxSlug(generateSlug(e.target.value))}
                  placeholder="salud-y-bienestar"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-250 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingTaxId && (
                  <button
                    type="button"
                    onClick={() => { setEditingTaxId(null); setTaxName(''); setTaxSlug(''); }}
                    className="w-1/2 py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className={`py-2 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    editingTaxId ? 'w-1/2 bg-teal-500 hover:bg-teal-650' : 'w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                  }`}
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingTaxId ? 'Actualizar' : 'Añadir Categoría'}
                </button>
              </div>
            </form>
          </div>

          {/* Categories list */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {categories.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No hay categorías registradas en el CMS.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Publicaciones</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 divide-slate-800/60">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100">{cat.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-teal-400">/{cat.slug}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{cat._count?.posts ?? 0} artículos</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditingTax(cat)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-teal-450 hover:text-teal-400 rounded-lg border border-slate-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTax(cat.id, cat.name)}
                            disabled={isPending}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 3: Tags Panel --- */}
      {currentSubTab === 'tags' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Editor Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-md font-bold mb-4 text-slate-100 flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-teal-400" />
              {editingTaxId ? 'Editar Etiqueta' : 'Agregar Nueva Etiqueta'}
            </h3>
            
            <form onSubmit={handleTaxonomySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  value={taxName}
                  onChange={(e) => { setTaxName(e.target.value); if (!editingTaxId) setTaxSlug(generateSlug(e.target.value)); }}
                  placeholder="Ej: Trámites"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-250 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ruta URL (Slug)</label>
                <input
                  type="text"
                  value={taxSlug}
                  onChange={(e) => setTaxSlug(generateSlug(e.target.value))}
                  placeholder="tramites"
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-250 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingTaxId && (
                  <button
                    type="button"
                    onClick={() => { setEditingTaxId(null); setTaxName(''); setTaxSlug(''); }}
                    className="w-1/2 py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-xl border border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className={`py-2 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 ${
                    editingTaxId ? 'w-1/2 bg-teal-500 hover:bg-teal-650' : 'w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                  }`}
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingTaxId ? 'Actualizar' : 'Añadir Etiqueta'}
                </button>
              </div>
            </form>
          </div>

          {/* Tags list */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            {tags.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No hay etiquetas registradas en el CMS.
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4">Publicaciones</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 divide-slate-800/60">
                  {tags.map(tag => (
                    <tr key={tag.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100">{tag.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-teal-400">/{tag.slug}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{tag._count?.posts ?? 0} artículos</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditingTax(tag)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-teal-450 hover:text-teal-400 rounded-lg border border-slate-800 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTax(tag.id, tag.name)}
                            disabled={isPending}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- Tab 4: Media Library Panel --- */}
      {currentSubTab === 'media' && (
        <div className="space-y-6">
          {/* Uploader Box */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
              dragActive 
                ? 'border-teal-500 bg-teal-950/10' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            {uploadingMedia ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold">Cargando archivo en la biblioteca...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">
                  Arrastra una imagen aquí o <span className="text-teal-400 hover:underline">haz clic para buscar</span>
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Formatos de imagen habituales. Límite de tamaño: 5MB</p>
              </div>
            )}
          </div>

          {/* Media files grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider mb-4">Recursos Multimedia</h3>
            {mediaFiles.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Aún no has cargado ningún archivo a la biblioteca.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {mediaFiles.map(img => (
                  <div key={img.id} className="group relative bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden aspect-square flex flex-col justify-between shadow-xs">
                    {/* Visual image */}
                    <div className="flex-1 w-full h-full overflow-hidden bg-slate-950 border-b border-slate-850 flex items-center justify-center">
                      <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                    </div>

                    {/* Footer / Meta info */}
                    <div className="p-2.5 bg-slate-900/90 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-300 font-semibold truncate" title={img.filename}>
                          {img.filename}
                        </p>
                        <p className="text-[8px] text-slate-550 mt-0.5">
                          {(img.size / 1024).toFixed(1)} KB
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-1.5">
                        <button
                          onClick={() => copyToClipboard(img.url)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-teal-400 rounded-md transition-colors"
                          title="Copiar URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(img.id, img.url)}
                          disabled={isPending}
                          className="p-1 hover:bg-rose-950 text-slate-405 hover:text-rose-400 rounded-md transition-colors"
                          title="Eliminar de biblioteca"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Overlay Media Selector Modal (Used inside Post Form) --- */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-100">Seleccionar Recurso de Biblioteca</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Haz clic sobre una de las imágenes disponibles para seleccionarla.</p>
              </div>
              <button
                onClick={() => { setIsMediaModalOpen(false); setMediaPurpose(null); setEditorInsertCallback(null); }}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Files Grid */}
            <div className="p-6 overflow-y-auto flex-1 min-h-[250px]">
              {mediaFiles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-500 mb-2">No hay imágenes en la biblioteca.</p>
                  <button
                    onClick={() => { setCurrentSubTab('media'); setIsMediaModalOpen(false); }}
                    className="px-3.5 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Subir Imágenes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {mediaFiles.map(img => (
                    <div 
                      key={img.id} 
                      onClick={() => handleSelectMediaInModal(img.url)}
                      className="group cursor-pointer bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden aspect-square flex flex-col hover:border-teal-500 transition-all relative"
                    >
                      <img src={img.url} alt={img.filename} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="px-2.5 py-1 bg-teal-500 text-slate-950 text-[10px] font-bold rounded-lg shadow-sm">
                          Seleccionar
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => { setIsMediaModalOpen(false); setMediaPurpose(null); setEditorInsertCallback(null); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
