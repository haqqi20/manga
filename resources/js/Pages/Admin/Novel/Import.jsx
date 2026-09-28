import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Search, Save, Loader2, Settings } from 'lucide-react';

export default function Import({ novelSettings = {} }) {
    const defaultApi = novelSettings.api_base_url || 'https://novel.kiryuuid.net/wp-json/kiryuu/v1';
    const defaultSource = novelSettings.source_domain || 'https://novel.kiryuuid.net';
    const defaultMode = novelSettings.chapter_mode || 'live_api';

    const [url, setUrl] = useState('');
    const [api, setApi] = useState(defaultApi);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [importChapters, setImportChapters] = useState(defaultMode === 'import_db');
    const [importContent, setImportContent] = useState(false);

    const fetchData = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setData(null);
        try {
            const r = await axios.post(route('admin.novel.importer.fetch'), {
                url,
                api_base_url: api,
                load_chapters: true,
            });
            setData(r.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal mengambil data novel');
        } finally {
            setLoading(false);
        }
    };

    const save = async () => {
        setLoading(true);
        setError('');
        try {
            await axios.post(route('admin.novel.importer.store'), {
                ...data,
                api_base_url: api || data.api_base_url,
                import_chapters: importChapters,
                import_chapter_content: importContent,
            });
            alert('Novel berhasil diimport');
            setData(null);
            setUrl('');
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal menyimpan novel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title="Import Novel API">
            <Head title="Import Novel API" />
            <div className="max-w-5xl mx-auto py-6 space-y-6">
                <Link href={route('admin.novel.index')} className="text-sm text-slate-500 flex gap-1"><ArrowLeft size={16} /> Back</Link>

                <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 rounded-3xl p-5 flex gap-4">
                    <Settings className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-sky-900 dark:text-sky-100">
                        <div className="font-black">Global Novel API aktif</div>
                        <div className="text-xs mt-1 opacity-80">Source: <b>{defaultSource}</b></div>
                        <div className="text-xs mt-1 opacity-80">API: <b>{defaultApi}</b></div>
                        <div className="text-xs mt-2 opacity-75">Bisa diubah dari Admin Settings → Scraper → Novel API Settings.</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Import Novel dari API WordPress Madara</h1>
                    <form onSubmit={fetchData} className="space-y-4">
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder={`${defaultSource}/novelmanga/slug/ atau slug`}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <input
                            value={api}
                            onChange={e => setApi(e.target.value)}
                            placeholder={defaultApi}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <button disabled={loading} className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-sm flex gap-2">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Ambil Data
                        </button>
                    </form>
                    {error && <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold">{error}</div>}
                </div>

                {data && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 grid md:grid-cols-[180px_1fr] gap-6">
                        <img src={data.poster} className="w-full rounded-2xl" />
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{data.title}</h2>
                            <div className="text-sm text-slate-500">Slug: {data.slug}</div>
                            <div className="text-sm text-slate-500">API: {api || data.api_base_url}</div>
                            <div className="text-sm text-slate-500">First: {data.first_chapter?.title || '-'} / {data.first_chapter?.slug || '-'}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300 max-h-40 overflow-auto prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: data.synopsis }} />
                            <div className="text-sm font-bold">Chapter terdeteksi: {data.chapters?.length || 0}</div>
                            <label className="flex gap-2 text-sm"><input type="checkbox" checked={importChapters} onChange={e => setImportChapters(e.target.checked)} /> Simpan list chapter ke DB</label>
                            <label className="flex gap-2 text-sm"><input type="checkbox" checked={importContent} onChange={e => setImportContent(e.target.checked)} /> Sekalian scrape isi chapter dan simpan ke DB</label>
                            <p className="text-xs text-slate-500">Catatan: jika opsi isi chapter tidak dicentang, halaman baca akan ambil isi chapter live dari API.</p>
                            <button onClick={save} disabled={loading} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm flex gap-2"><Save size={18} /> Simpan Novel</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
