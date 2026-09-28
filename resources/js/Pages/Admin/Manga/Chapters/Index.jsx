import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { 
    Plus, Trash2, ArrowLeft, Image as ImageIcon, 
    FileUp, CheckCircle2, AlertCircle, X, 
    ChevronRight, BookOpen, Clock, Play, Edit, 
    Link as LinkIcon, RefreshCw, Layers, Save, Move
} from 'lucide-react';
import Modal from '@/Components/Modal';
import axios from 'axios';

export default function Index({ manga, chapters }) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedImages, setSelectedImages] = useState([]);

    // Gallery Modal State
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [currentChapter, setCurrentChapter] = useState(null);
    const [chapterImages, setChapterImages] = useState([]);
    const [autoScrapeUrl, setAutoScrapeUrl] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0, active: false });
    const [htmlContent, setHtmlContent] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        chapter_number: '',
        images: []
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setData('images', files);
        
        // Previews
        const previews = files.map(file => URL.createObjectURL(file));
        setSelectedImages(previews);
    };

    const submit = (e) => {
        e.preventDefault();
        setIsUploading(true);
        post(route('admin.manga.chapters.store', manga.id), {
            onSuccess: () => {
                reset();
                setSelectedImages([]);
                setIsUploading(false);
            },
            onError: () => setIsUploading(false),
            forceFormData: true,
        });
    };

    const deleteChapter = (id) => {
        if (confirm('Hapus chapter ini beserta semua gambarnya?')) {
            router.delete(route('admin.manga.chapters.destroy', id), {
                preserveScroll: true
            });
        }
    };

    // --- Gallery Functions ---

    const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'embed'

    const openGallery = async (chapter) => {
        setCurrentChapter(chapter);
        setHtmlContent(chapter.content || '');
        
        let initialUrl = chapter.source_url || '';
        if (!initialUrl && manga.source_url && manga.source_url.includes('komiku.org')) {
            const slug = manga.source_url.replace(/\/$/, '').split('/').pop();
            const num = chapter.chapter_number.toString().replace('.', '-');
            initialUrl = `https://komiku.org/${slug}-chapter-${num}/`;
        }
        
        setAutoScrapeUrl(initialUrl);
        setIsGalleryOpen(true);
        setActiveTab(chapter.content ? 'embed' : 'gallery');
        fetchChapterImages(chapter.id);
    };

    const saveHtmlContent = async () => {
        try {
            await axios.put(route('admin.manga.chapters.update', currentChapter.id), {
                title: currentChapter.title,
                chapter_number: currentChapter.chapter_number,
                source_url: autoScrapeUrl,
                content: htmlContent
            });
            alert('HTML Content saved!');
            // Refresh local data
            router.reload({ preserveScroll: true });
        } catch (err) {
            alert('Failed to save HTML content.');
        }
    };

    const generateHtmlFromGallery = (force = false) => {
        if (chapterImages.length === 0) {
            if (force) alert('Tidak ada gambar di galeri.');
            return;
        }
        
        // Confirm if already has content and it's not a force sync from tab switch
        if (htmlContent && force && !confirm('Ini akan menimpa HTML yang sudah ada. Lanjutkan?')) return;

        let html = '';
        chapterImages.forEach((img, idx) => {
            let src = img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`;
            
            // If external link, use our proxy
            if (src.startsWith('http')) {
                src = `/image-proxy?url=${encodeURIComponent(src)}`;
            }

            html += `<div class="w-full flex justify-center mb-4"><img src="${src}" class="w-full h-auto" alt="Page ${idx+1}" loading="lazy"></div>\n`;
        });
        setHtmlContent(html);
        if (force) setActiveTab('embed');
    };

    // Auto-generate if switching to embed tab and content is empty
    useEffect(() => {
        if (activeTab === 'embed' && !htmlContent && chapterImages.length > 0) {
            generateHtmlFromGallery(false);
        }
    }, [activeTab, chapterImages]);

    const fetchChapterImages = async (id) => {
        setGalleryLoading(true);
        try {
            const response = await axios.get(route('admin.chapters.images', id));
            setChapterImages(response.data.images || []);
        } catch (err) {
            console.error(err);
        } finally {
            setGalleryLoading(false);
        }
    };

    const deleteImage = async (imageId) => {
        if (!confirm('Hapus gambar ini?')) return;
        try {
            await axios.delete(route('admin.chapters.images.delete', imageId));
            setChapterImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            alert('Gagal menghapus gambar.');
        }
    };

    const handleQuickUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image_file', file);
        
        try {
            await axios.post(route('admin.chapters.images.store', currentChapter.id), formData);
            fetchChapterImages(currentChapter.id);
        } catch (err) {
            alert('Gagal mengupload gambar.');
        }
    };

    const handleAddUrlImage = async () => {
        if (!newImageUrl) return;
        try {
            await axios.post(route('admin.chapters.images.store', currentChapter.id), {
                image_url: newImageUrl
            });
            setNewImageUrl('');
            fetchChapterImages(currentChapter.id);
        } catch (err) {
            alert('Gagal menambahkan link gambar.');
        }
    };

    const handleAutoScrape = async () => {
        if (!autoScrapeUrl) return;
        if (!confirm('Ini akan MENGHAPUS semua gambar lama dan mengambil ulang dari URL baru. Lanjutkan?')) return;
        
        setIsScraping(true);
        try {
            const res = await axios.post(route('admin.manga.importer.chapter', manga.id), {
                url: autoScrapeUrl,
                number: currentChapter.chapter_number,
                title: currentChapter.title
            });
            if (res.data.success) {
                setAutoScrapeUrl('');
                fetchChapterImages(currentChapter.id);
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Gagal mengambil gambar scraper.');
        } finally {
            setIsScraping(false);
        }
    };

    return (
        <AdminLayout title={`Kelola Chapter — ${manga.title}`}>
            <Head title={`Kelola Chapter — ${manga.title}`} />

            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Header Context */}
                <div className="flex items-center gap-4 mb-2">
                    <Link 
                        href={route('admin.manga.index')} 
                        className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-red-500 transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen size={20} className="text-red-500" />
                            Kelola Chapter: {manga.title}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Tambah bab baru dan unggah halaman komik di sini.</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        {importProgress.active && (
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-300" 
                                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">
                                    {importProgress.current}/{importProgress.total}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={async () => {
                                setIsScraping(true);
                                try {
                                    const res = await axios.get(route('admin.manga.chapters.check-updates', manga.id));
                                    const missing = res.data.missing_chapters;
                                    
                                    if (missing.length === 0) {
                                        alert('Semua chapter sudah ter-import!');
                                    } else {
                                        if (confirm(`Ditemukan ${missing.length} chapter baru. Import sekarang?`)) {
                                            setImportProgress({ current: 0, total: missing.length, active: true });
                                            
                                            // Process in reverse to import oldest first (if needed, but usually we just append)
                                            // Actually, missing_chapters is sorted descending (latest first) in controller
                                            // For importing, it's better to import oldest first so they appear in correct order?
                                            // The DB sorts by chapter_number anyway.
                                            
                                            const toImport = [...missing].sort((a,b) => a.number - b.number);
                                            
                                            for (let i = 0; i < toImport.length; i++) {
                                                const ch = toImport[i];
                                                setImportProgress(prev => ({ ...prev, current: i + 1 }));
                                                await axios.post(route('admin.manga.importer.chapter', manga.id), {
                                                    url: ch.url,
                                                    number: ch.number,
                                                    title: ch.title
                                                });
                                            }
                                            alert('Berhasil mengimport semua chapter baru!');
                                            router.reload();
                                        }
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('Gagal memeriksa atau mengimport update.');
                                } finally {
                                    setIsScraping(false);
                                    setImportProgress(prev => ({ ...prev, active: false }));
                                }
                            }}
                            disabled={isScraping}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
                        >
                            {isScraping ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                            {isScraping ? 'Memproses...' : 'Cek Chapter Baru'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Upload */}
                    <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm h-fit sticky top-20">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Plus size={16} className="text-red-500" />
                                Chapter Baru
                            </h2>
                        </div>
                        <form onSubmit={submit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nomor Bab</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm font-bold"
                                    placeholder="Contoh: 1, 2.5, 100"
                                    value={data.chapter_number}
                                    onChange={e => setData('chapter_number', e.target.value)}
                                />
                                {errors.chapter_number && <p className="text-red-500 text-[10px] pl-1">{errors.chapter_number}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Judul Bab (Opsi)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm"
                                    placeholder="Awal dari Perjalanan..."
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5 mt-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Upload Halaman</label>
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className={`relative group cursor-pointer aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all
                                        ${selectedImages.length > 0 
                                            ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-500/5' 
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-red-500/50'}`}
                                >
                                    {selectedImages.length > 0 ? (
                                        <>
                                            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{selectedImages.length} Halaman Terpilih</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Klik untuk mengganti file</p>
                                        </>
                                    ) : (
                                        <>
                                            <FileUp size={32} className="text-slate-300 group-hover:text-red-400 mb-2 transition-colors" />
                                            <p className="text-xs font-bold text-slate-500">Pilih Gambar</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Halaman komik (JPG, PNG)</p>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        multiple 
                                        hidden 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*"
                                    />
                                </div>
                                {errors.images && <p className="text-red-500 text-[10px] pl-1">{errors.images}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || isUploading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold font-display shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isUploading ? 'Mengunggah...' : (
                                    <>
                                        <Plus size={18} />
                                        Tambah Chapter
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Chapter List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Daftar Bab</h3>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">{chapters.data.length} Bab</span>
                        </div>

                        {chapters.data.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center text-center shadow-sm">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                                    <BookOpen size={30} className="text-slate-200" />
                                </div>
                                <h4 className="text-slate-900 dark:text-white font-bold">Belum Ada Bab</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Silakan tambahkan chapter pertama untuk memulai.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {chapters.data.map((chapter) => (
                                    <div key={chapter.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:shadow-md hover:border-red-500/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex flex-col items-center justify-center border border-red-100 dark:border-red-500/20 shrink-0">
                                                <span className="text-xs font-black text-red-600 dark:text-red-400">CH</span>
                                                <span className="text-sm font-bold text-red-700 dark:text-red-300 -mt-1">{chapter.chapter_number}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                    {chapter.title || `Chapter ${chapter.chapter_number}`}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <ImageIcon size={10} />
                                                        {chapter.images_count || 0} Halaman
                                                    </span>
                                                    <span className="flex items-center gap-1 capitalize">
                                                        <Clock size={10} />
                                                        {new Date(chapter.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link 
                                                href={route('admin.manga.chapters.edit', chapter.id)}
                                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                                title="Edit Halaman"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => deleteChapter(chapter.id)}
                                                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                                title="Hapus Chapter"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <Link 
                                                href={route('manga.read', { slug: manga.slug, number: chapter.chapter_number })}
                                                target="_blank"
                                                className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all active:scale-90"
                                                title="Buka di Website"
                                            >
                                                <Play size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {chapters.next_page_url && (
                            <div className="pt-2 flex justify-center">
                                <Link 
                                    href={chapters.next_page_url} 
                                    className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full text-xs font-bold transition-all"
                                >
                                    Muat Lebih Banyak
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDITOR MODAL (zuruimanga Style) */}
            <Modal show={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} maxWidth="5xl">
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col h-[85vh]">
                    {/* Dark Header */}
                    <div className="bg-slate-900 dark:bg-black p-5 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                <Layers className="text-red-500" size={20} />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg leading-tight">Editor Halaman</h2>
                                <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider">
                                    {currentChapter?.title || `Chapter ${currentChapter?.chapter_number}`} — {manga.title}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="text-white/40" size={24} />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 flex flex-wrap items-center gap-4 justify-between">
                        <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl">
                            <button 
                                onClick={() => setActiveTab('gallery')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'gallery' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <ImageIcon size={14} />
                                    Galeri Grid
                                </div>
                            </button>
                            <button 
                                onClick={() => setActiveTab('embed')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'embed' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={14} />
                                    HTML Embed (zuruimanga)
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeTab === 'gallery' ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="text" 
                                                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none w-48 font-mono text-slate-400 focus:ring-2 focus:ring-sky-500"
                                                placeholder="Link Scraper..."
                                                value={autoScrapeUrl}
                                                onChange={e => setAutoScrapeUrl(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={handleAutoScrape}
                                            disabled={isScraping || !autoScrapeUrl}
                                            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                                        >
                                            {isScraping ? <RefreshCw className="animate-spin w-3 h-3" /> : <RefreshCw size={14} />}
                                            Scraper
                                        </button>
                                    </div>
                                    <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-2 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => generateHtmlFromGallery(true)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <Layers size={14} />
                                        Ambil Dari Galeri
                                    </button>
                                    <button 
                                        onClick={saveHtmlContent}
                                        className="px-6 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
                                    >
                                        <Save size={14} />
                                        Simpan HTML
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-950">
                        {activeTab === 'gallery' ? (
                            galleryLoading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                    <RefreshCw className="animate-spin mb-4" size={40} />
                                    <p className="text-sm font-bold">Memuat Halaman...</p>
                                </div>
                            ) : chapterImages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                                    <ImageIcon size={64} className="mb-6 text-slate-200 dark:text-slate-800" />
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Halaman Masih Kosong</h3>
                                    <p className="text-sm text-slate-500 mb-8 max-w-sm font-medium">
                                        Gunakan <b>Scraper</b> atau ganti ke mode <b>HTML Embed (zuruimanga)</b> untuk menggunakan link eksternal atau memanipulasi HTML.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {chapterImages.map((img, idx) => (
                                        <div key={img.id} className="relative group aspect-[2/3] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                                            <img 
                                                src={img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    onClick={() => deleteImage(img.id)}
                                                    className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 shadow-xl transform scale-75 group-hover:scale-100 transition-all font-bold"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                                                #{idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="h-full flex flex-col space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                                        <LinkIcon size={12} />
                                        HTML Code (Prioritas Tinggi)
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">
                                        * Jika diisi, pembaca akan menggunakan kode ini (Bypass Otomatis).
                                    </p>
                                </div>
                                <textarea 
                                    className="flex-1 w-full p-6 rounded-3xl border-2 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 font-mono text-[11px] leading-relaxed focus:ring-4 focus:ring-red-500/10 outline-none transition-all dark:text-sky-400"
                                    value={htmlContent}
                                    onChange={e => setHtmlContent(e.target.value)}
                                    placeholder="<img src='...'>"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-400">
                        <div className="flex items-center gap-4">
                            <span>{chapterImages.length} Halaman Terdeteksi</span>
                            <span>ID: #{currentChapter?.id}</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-red-500" onClick={() => fetchChapterImages(currentChapter.id)}>
                            <RefreshCw size={12} />
                            Segarkan
                        </div>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
