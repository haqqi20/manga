import React, { useState, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { ArrowLeft, Trash2, Code, Save, RefreshCw, Layers } from 'lucide-react';
import axios from 'axios';

export default function Edit({ manga, chapter }) {
    const [images, setImages] = useState(chapter.images || []);
    const [isScraping, setIsScraping] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        title: chapter.title || '',
        chapter_number: chapter.chapter_number || '',
        slug: chapter.slug || '',
        content: chapter.content || '',
        source_url: chapter.source_url || ''
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.manga.chapters.update', chapter.id), {
            preserveScroll: true,
            onSuccess: () => alert('Chapter updated successfully.')
        });
    };

    const generateHtmlFromImages = () => {
        if (images.length === 0) {
            alert('Tidak ada gambar di galeri.');
            return;
        }
        
        if (data.content && !confirm('Ini akan menimpa HTML yang sudah ada. Lanjutkan?')) {
            return;
        }

        let html = '';
        images.forEach((img, idx) => {
            let src = img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`;
            if (src.startsWith('http')) {
                src = `/image-proxy?url=${encodeURIComponent(src)}`;
            }
            html += `<img src="${src}" class="w-full h-auto" alt="Page ${idx+1}" loading="lazy">\n`;
        });
        
        setData('content', html);
    };

    const fetchImages = async () => {
        try {
            const res = await axios.get(route('admin.chapters.images', chapter.id));
            setImages(res.data.images || []);
        } catch (e) {
            console.error(e);
        }
    };

    const deleteAllImages = async () => {
        if (!confirm('Anda yakin ingin menghapus SEMUA gambar untuk chapter ini?')) return;
        
        try {
            // Delete sequentially to avoid timeout or overload, or use a bulk endpoint if available.
            // Since we don't have bulk delete, we do it in parallel
            await Promise.all(images.map(img => axios.delete(route('admin.chapters.images.delete', img.id))));
            setImages([]);
            alert('Semua gambar berhasil dihapus.');
        } catch (e) {
            alert('Terjadi kesalahan saat menghapus gambar.');
        }
    };

    const deleteSingleImage = async (id) => {
        if (!confirm('Hapus gambar ini?')) return;
        try {
            await axios.delete(route('admin.chapters.images.delete', id));
            setImages(imgs => imgs.filter(img => img.id !== id));
        } catch (e) {
            alert('Gagal menghapus gambar.');
        }
    };

    return (
        <AdminLayout title={`Edit Chapter: ${manga.title} - ${chapter.chapter_number}`}>
            <Head title={`Edit Chapter: ${chapter.chapter_number} - ${manga.title}`} />

            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Edit Chapter: <span className="font-normal">{chapter.title ? `${chapter.title} (Chapter ${chapter.chapter_number})` : `Chapter ${chapter.chapter_number}`}</span>
                    </h1>
                    <Link 
                        href={route('admin.manga.chapters.index', manga.id)} 
                        className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mt-2 flex items-center gap-1 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 outline-none text-slate-900 dark:text-white"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chapter Number</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 outline-none text-slate-900 dark:text-white"
                                value={data.chapter_number}
                                onChange={e => setData('chapter_number', e.target.value)}
                                required
                            />
                            {errors.chapter_number && <p className="text-red-500 text-xs mt-1">{errors.chapter_number}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slug</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 outline-none text-slate-900 dark:text-white"
                                value={data.slug}
                                onChange={e => setData('slug', e.target.value)}
                                disabled // Slug update relies on the update method logic typically, but making it editable if we want
                            />
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom HTML Content (Optional)</label>
                            </div>
                            <textarea
                                className="w-full px-4 py-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 outline-none min-h-[160px] text-slate-700 dark:text-sky-300 leading-relaxed"
                                value={data.content}
                                onChange={e => setData('content', e.target.value)}
                                placeholder="<img src='...' />"
                            ></textarea>
                            <p className="text-xs text-slate-500 mt-2">
                                Paste raw HTML here if you want to use external image URLs or custom layout. This will override uploaded images.
                            </p>
                            
                            <button
                                type="button"
                                onClick={generateHtmlFromImages}
                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#0e9f6e] hover:bg-emerald-600 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                            >
                                <Code size={14} /> Generate HTML from Images
                            </button>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-colors"
                            >
                                {processing ? 'Updating...' : 'Update Chapter'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Scraped Images Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="text-[#2563eb]" size={20} />
                            Scraped Images ({images.length})
                        </h2>
                        {images.length > 0 && (
                            <button
                                onClick={deleteAllImages}
                                className="mt-3 sm:mt-0 flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                                <Trash2 size={16} /> Delete Scraped Images
                            </button>
                        )}
                    </div>

                    {images.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-sm text-slate-500">Belum ada gambar yang diunggah atau di-scrape.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {images.map((img, idx) => (
                                <div key={img.id} className="relative group aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={img.image_path.startsWith('http') ? img.image_path : `/storage/${img.image_path}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        alt={`Page ${idx+1}`}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => deleteSingleImage(img.id)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full scale-75 group-hover:scale-100 transition-all font-bold shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur text-white text-[10px] rounded font-bold">
                                        {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
