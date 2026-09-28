import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Search, Import, BookOpen, Layers, 
    CheckCircle2, AlertCircle, Loader2,
    ChevronRight, ArrowLeft, Trash2,
    ExternalLink, Download
} from 'lucide-react';
import axios from 'axios';

export default function ImportManga() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [scrapedData, setScrapedData] = useState(null);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
    const [finished, setFinished] = useState(false);

    const fetchManga = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setScrapedData(null);
        setFinished(false);

        try {
            const response = await axios.post(route('admin.manga.importer.fetch'), { url });
            setScrapedData(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengambil data manga.');
        } finally {
            setLoading(false);
        }
    };

    const startImport = async () => {
        if (!scrapedData) return;
        
        setImporting(true);
        setProgress({ current: 0, total: scrapedData.chapters.length, status: 'Menyimpan detail manga...' });

        try {
            // 1. Store Manga Detail
            const mangaRes = await axios.post(route('admin.manga.importer.store'), {
                title: scrapedData.title,
                synopsis: scrapedData.synopsis,
                poster: scrapedData.poster,
                type: scrapedData.type,
                status: scrapedData.status,
                source_url: url, // Standardize source link
                author: scrapedData.author,
                artist: scrapedData.artist,
                genres: scrapedData.genres,
            });

            const mangaId = mangaRes.data.id;

            // 2. Import Chapters one by one
            for (let i = 0; i < scrapedData.chapters.length; i++) {
                const chapter = scrapedData.chapters[i];
                setProgress(prev => ({ 
                    ...prev, 
                    current: i + 1, 
                    status: `Mengimpor ${chapter.title}...` 
                }));

                await axios.post(route('admin.manga.importer.chapter', mangaId), {
                    url: chapter.url,
                    number: chapter.number,
                    title: chapter.title
                });
            }

            setFinished(true);
            setProgress(prev => ({ ...prev, status: 'Impor selesai!' }));
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengimpor manga.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <AdminLayout title="Import Manga">
            <Head title="Import Manga - Admin" />

            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link 
                        href={route('admin.manga.index')} 
                        className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                {/* Search Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Import dari <span className="text-red-600 underline">Komiku</span></h1>
                    <p className="text-slate-500 text-sm mb-8 italic">Tempelkan URL manga dari komiku.org (contoh: https://komiku.org/manga/one-piece/)</p>
                    
                    <form onSubmit={fetchManga} className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="url"
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://komiku.org/manga/..."
                                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            />
                            {loading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600">
                                    <Loader2 className="animate-spin" size={20} />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading || importing}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Mencari...' : <><Search size={18} /> Cek URL</>}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Preview Card */}
                {scrapedData && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 pb-0">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-48 shrink-0">
                                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/50">
                                        <img src={scrapedData.poster} className="w-full h-full object-cover" alt="" />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{scrapedData.title}</h2>
                                            <p className="text-slate-400 text-sm italic">{scrapedData.author} | {scrapedData.artist}</p>
                                        </div>
                                        <div className="flex gap-2">
                                             <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase tracking-widest ${
                                                 scrapedData.type === 'Manhwa' ? 'bg-indigo-50 text-indigo-600' :
                                                 scrapedData.type === 'Manhua' ? 'bg-emerald-50 text-emerald-600' :
                                                 'bg-sky-50 text-sky-600'
                                             }`}>
                                                 {scrapedData.type}
                                             </span>
                                             <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg uppercase">{scrapedData.status}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 leading-relaxed italic">{scrapedData.synopsis}</p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {scrapedData.genres.map(g => (
                                            <span key={g} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-wider">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 mt-8 bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Total {scrapedData.chapters_count} Chapters</h3>
                                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Siap Diimpor</p>
                                    </div>
                                </div>
                                
                                {!finished ? (
                                    <button
                                        onClick={startImport}
                                        disabled={importing}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {importing ? (
                                            <><Loader2 className="animate-spin" size={18} /> Sedang Mengimpor...</>
                                        ) : (
                                            <><Download size={18} /> Mulai Impor Sekarang</>
                                        )
                                        }
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-xl">
                                            <CheckCircle2 size={18} /> Berhasil Diimpor
                                        </div>
                                        <Link 
                                            href={route('admin.manga.index')}
                                            className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl"
                                        >
                                            Lihat Daftar
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Progress bar */}
                            {importing && (
                                <div className="space-y-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-600 uppercase tracking-wider italic flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-red-500" />
                                            {progress.status}
                                        </span>
                                        <span className="text-slate-400">{progress.current} / {progress.total}</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-red-600 to-indigo-600 transition-all duration-500 rounded-full shadow-lg shadow-indigo-500/10"
                                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
