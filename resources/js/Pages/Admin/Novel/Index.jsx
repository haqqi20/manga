import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, BookOpen, Download, Star, RefreshCw, CheckSquare, Square, Database, ListRestart } from 'lucide-react';

export default function Index({ novels, filters = {} }) {
    const { errors, flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selected, setSelected] = useState([]);
    const [bulkAction, setBulkAction] = useState('metadata');

    const rows = novels?.data || [];
    const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

    const go = () => router.get(route('admin.novel.index'), { search }, { preserveState: true });

    const toggleAll = () => {
        setSelected(allSelected ? [] : rows.map((row) => row.id));
    };

    const toggleOne = (id) => {
        setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    };

    const refreshMetadata = (novel) => {
        if (!confirm(`Refresh metadata "${novel.title}" dari API?\n\nYang diupdate: judul, sinopsis, cover, status, author, artist, genre, tag, dan type Jepang/Korean/Chinese.\nChapter tidak disentuh.`)) return;
        router.post(route('admin.novel.refresh.metadata', novel.id), {}, { preserveScroll: true });
    };

    const refreshChapters = (novel) => {
        if (!confirm(`Refresh chapter "${novel.title}" dari API?\n\nHanya menambahkan chapter yang belum ada. Isi chapter tetap live dari API dan tidak disimpan ke DB.`)) return;
        router.post(route('admin.novel.refresh.chapters', novel.id), {}, { preserveScroll: true });
    };

    const refreshBoth = (novel) => {
        if (!confirm(`Refresh metadata + chapter "${novel.title}" dari API?`)) return;
        router.post(route('admin.novel.refresh.api', novel.id), {}, { preserveScroll: true });
    };

    const refreshSelected = () => {
        if (selected.length === 0) return;

        const label = bulkAction === 'chapters'
            ? 'chapter'
            : bulkAction === 'both'
                ? 'metadata + chapter'
                : 'metadata';

        if (!confirm(`${selected.length} novel yang dipilih akan direfresh ${label} sekarang.\n\nTidak memakai cron dan tidak berjalan otomatis. Lanjut?`)) return;

        router.post(route('admin.novel.refresh.selected'), { ids: selected, action: bulkAction }, {
            preserveScroll: true,
            onSuccess: () => setSelected([]),
        });
    };

    return (
        <AdminLayout title="Kelola Novel">
            <Head title="Kelola Novel" />

            <div className="space-y-6">
                {(flash?.success || errors?.refresh) && (
                    <div className={`whitespace-pre-line rounded-2xl border px-5 py-4 text-sm font-bold ${errors?.refresh ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                        {errors?.refresh || flash?.success}
                    </div>
                )}

                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
                    Refresh Novel sekarang <b>hanya berjalan saat tombol diklik</b>. Tidak ada proses cron/otomatis dari halaman ini.
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
                            placeholder="Cari novel..."
                            className="w-full rounded-xl border-slate-200 pl-10 dark:border-slate-700 dark:bg-slate-900"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            className="rounded-xl border-slate-200 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                        >
                            <option value="metadata">Refresh Metadata</option>
                            <option value="chapters">Refresh Chapters</option>
                            <option value="both">Refresh Metadata + Chapters</option>
                        </select>

                        <button
                            onClick={refreshSelected}
                            disabled={selected.length === 0}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"
                        >
                            <RefreshCw size={17} /> Refresh Selected ({selected.length})
                        </button>

                        <Link href={route('admin.novel.create')} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">
                            <Plus size={18} /> Tambah Novel
                        </Link>

                        <Link href={route('admin.novel.importer')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <Download size={18} /> Import API
                        </Link>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50">
                                    <th className="w-12 p-4">
                                        <button onClick={toggleAll} className="text-slate-500 hover:text-red-500">
                                            {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </th>
                                    <th className="p-4 text-xs uppercase text-slate-500">Novel</th>
                                    <th className="p-4 text-xs uppercase text-slate-500">Chapter</th>
                                    <th className="p-4 text-xs uppercase text-slate-500">Type</th>
                                    <th className="p-4 text-xs uppercase text-slate-500">Last Sync</th>
                                    <th className="p-4 text-right text-xs uppercase text-slate-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rows.map((n) => (
                                    <tr key={n.id} className="align-top">
                                        <td className="p-4">
                                            <button onClick={() => toggleOne(n.id)} className="mt-5 text-slate-500 hover:text-red-500">
                                                {selected.includes(n.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-3 items-center">
                                                <div className="flex h-16 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    {n.poster ? <img src={n.poster} className="h-full w-full object-cover" /> : <BookOpen size={18} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                                                    <div className="text-xs text-slate-400">/{n.slug}</div>
                                                    {n.api_sync_error && <div className="mt-1 max-w-md whitespace-pre-line text-xs text-red-500">{n.api_sync_error}</div>}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 text-sm font-bold">{n.chapters_count || 0}</td>

                                        <td className="p-4 text-sm">
                                            <div className="font-bold">{n.type || '-'}</div>
                                            <div className="text-xs text-slate-400">{n.status} {n.is_featured ? <Star size={14} className="inline fill-amber-400 text-amber-400" /> : null}</div>
                                        </td>

                                        <td className="p-4">
                                            <div className="text-[11px] text-slate-400">
                                                {n.last_api_synced_at ? new Date(n.last_api_synced_at).toLocaleString('id-ID') : 'Belum pernah sync'}
                                            </div>
                                        </td>

                                        <td className="p-4 text-right">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <button
                                                    onClick={() => refreshMetadata(n)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                                                    title="Refresh metadata dari API"
                                                >
                                                    <Database size={14} /> Metadata
                                                </button>
                                                <button
                                                    onClick={() => refreshChapters(n)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-black text-white"
                                                    title="Refresh chapter dari API"
                                                >
                                                    <ListRestart size={14} /> Chapters
                                                </button>
                                                <button
                                                    onClick={() => refreshBoth(n)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-black text-white"
                                                    title="Refresh metadata dan chapter"
                                                >
                                                    <RefreshCw size={14} /> Both
                                                </button>
                                                <Link href={route('admin.novel.edit', n.id)} className="inline-flex p-2 text-sky-500" title="Edit">
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button onClick={() => confirm('Hapus novel ini?') && router.delete(route('admin.novel.destroy', n.id))} className="inline-flex p-2 text-red-500" title="Hapus">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {rows.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-sm text-slate-400">
                                            Belum ada novel.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {novels?.links && (
                    <div className="flex flex-wrap gap-2">
                        {novels.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                className={`rounded-lg px-3 py-2 text-xs font-bold ${link.active ? 'bg-red-600 text-white' : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-300'} disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
