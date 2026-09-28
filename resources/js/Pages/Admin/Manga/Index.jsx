import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';

import { 
    Plus, Search, Edit2, Trash2, BookOpen, 
    MoreVertical, Star,
    Layers, Calendar, User,
    Download, RefreshCw
} from 'lucide-react';

export default function Index({ mangas }) {
    const [search, setSearch] = useState('');
    const [checkingId, setCheckingId] = useState(null);

    const deleteManga = (id) => {
        if (confirm('Are you sure you want to delete this manga?')) {
            router.delete(route('admin.manga.destroy', id));
        }
    };

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter') {
            router.get(route('admin.manga.index'), {
                search: search
            }, {
                preserveState: true,
                replace: true
            });
        }
    };

    const checkNewChapters = async (mangaId) => {
        setCheckingId(mangaId);

        try {
            const res = await axios.get(
                route('admin.manga.chapters.check-updates', mangaId)
            );

            const missing = res.data.missing_chapters || [];

            if (missing.length === 0) {
                alert('Semua chapter sudah terbaru!');
                return;
            }

            if (
                confirm(
                    `Ditemukan ${missing.length} chapter baru.\n\nImport sekarang?`
                )
            ) {
                const toImport = [...missing].sort(
                    (a, b) => a.number - b.number
                );

                for (let i = 0; i < toImport.length; i++) {
                    const ch = toImport[i];

                    await axios.post(
                        route('admin.manga.importer.chapter', mangaId),
                        {
                            url: ch.url,
                            number: ch.number,
                            title: ch.title
                        }
                    );
                }

                alert('Berhasil import chapter baru!');
                router.reload();
            }
        } catch (err) {
            console.error(err);
            alert('Gagal cek chapter baru.');
        } finally {
            setCheckingId(null);
        }
    };

    return (
        <AdminLayout title="Kelola Manga">
            <Head title="Kelola Manga" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>

                        <input
                            type="text"
                            placeholder="Cari manga..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchEnter}
                        />
                    </div>

                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        <Link
                            href={route('admin.manga.create')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={18} />
                            Tambah Manga
                        </Link>

                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

                        <Link
                            href={route('admin.manga.importer')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Download size={18} />
                            Import Manga
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Manga
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Tipe / Status
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                                        Stats
                                    </th>

                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {mangas.data.map((manga) => (
                                    <tr
                                        key={manga.id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors group"
                                    >
                                        {/* Manga */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                    {manga.poster ? (
                                                        <img
                                                            src={manga.poster}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <BookOpen size={20} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                                                        {manga.title}
                                                    </h3>

                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <User size={12} />
                                                            {manga.author || 'N/A'}
                                                        </span>

                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {manga.release_year || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4 text-xs font-medium">
                                            <div className="flex flex-col gap-1.5">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full w-min whitespace-nowrap
                                                    ${
                                                        manga.type === 'Manga'
                                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
                                                            : manga.type === 'Manhwa'
                                                            ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10'
                                                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                                    }`}
                                                >
                                                    {manga.type}
                                                </span>

                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full border w-min
                                                    ${
                                                        manga.status === 'Ongoing'
                                                            ? 'border-emerald-200 text-emerald-600 bg-emerald-50/30 dark:border-emerald-500/20'
                                                            : 'border-slate-200 text-slate-600 bg-slate-50 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {manga.status}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Stats */}
                                        <td className="px-6 py-4 text-xs text-center">
                                            <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {manga.chapters_count || 0}
                                                    </span>

                                                    <span className="text-[10px] uppercase tracking-wider">
                                                        Chapter
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {manga.views_count || 0}
                                                    </span>

                                                    <span className="text-[10px] uppercase tracking-wider">
                                                        Views
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">

                                                {/* Featured */}
                                                <button
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                'admin.manga.featured.toggle',
                                                                manga.id
                                                            )
                                                        )
                                                    }
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        manga.is_featured
                                                            ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                                                            : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10'
                                                    }`}
                                                    title={
                                                        manga.is_featured
                                                            ? 'Hapus dari Hero Slider'
                                                            : 'Tampilkan di Hero Slider'
                                                    }
                                                >
                                                    <Star
                                                        size={18}
                                                        className={
                                                            manga.is_featured
                                                                ? 'fill-current'
                                                                : ''
                                                        }
                                                    />
                                                </button>

                                                {/* Check Chapter */}
                                                <button
                                                    onClick={() =>
                                                        checkNewChapters(manga.id)
                                                    }
                                                    disabled={
                                                        checkingId === manga.id
                                                    }
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Cek Chapter Baru"
                                                >
                                                    {checkingId === manga.id ? (
                                                        <RefreshCw
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <RefreshCw size={18} />
                                                    )}
                                                </button>

                                                {/* Chapter */}
                                                <Link
                                                    href={route(
                                                        'admin.manga.chapters.index',
                                                        manga.id
                                                    )}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    title="Kelola Chapter"
                                                >
                                                    <Layers size={18} />
                                                </Link>

                                                {/* Edit */}
                                                <Link
                                                    href={route(
                                                        'admin.manga.edit',
                                                        manga.id
                                                    )}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    onClick={() =>
                                                        deleteManga(manga.id)
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="group-hover:hidden">
                                                <MoreVertical
                                                    size={18}
                                                    className="text-slate-400 ml-auto"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {mangas.links && (
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-center">
                            <div className="flex gap-2 text-sm">
                                {mangas.prev_page_url && (
                                    <Link
                                        href={mangas.prev_page_url}
                                        className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Prev
                                    </Link>
                                )}

                                {mangas.next_page_url && (
                                    <Link
                                        href={mangas.next_page_url}
                                        className="px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}