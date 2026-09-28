import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, SearchBar, Pagination, ConfirmModal } from '@/Components/Admin/UI';
import { Plus, Pencil, Trash2, PlaySquare, Clock } from 'lucide-react';

export default function EpisodeIndex({ episodes, animes, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [animeId, setAnimeId] = useState(filters.anime_id || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilter = (overrides = {}) => {
        router.get('/admin/episodes', {
            search: overrides.search ?? search,
            anime_id: overrides.anime_id ?? animeId,
        }, { preserveScroll: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/episodes/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <AdminLayout title="Manajemen Episode">
            <Head title="Admin - Episode" />

            <PageHeader
                title="Episode"
                description={`${episodes.total} episode terdaftar`}
                action={
                    <Link href="/admin/episodes/create">
                        <Button>
                            <Plus size={15} />
                            Tambah Episode
                        </Button>
                    </Link>
                }
            />

            {/* Filters */}
            <Card className="p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <SearchBar
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                        placeholder="Cari episode atau anime..."
                        className="flex-1"
                    />
                    <select
                        value={animeId}
                        onChange={(e) => { setAnimeId(e.target.value); applyFilter({ anime_id: e.target.value }); }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-w-[180px]"
                    >
                        <option value="">Semua Anime</option>
                        {animes.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </select>
                    <Button variant="secondary" onClick={() => applyFilter()}>Filter</Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Episode</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Anime</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Durasi</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">Tanggal Rilis</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">Video</th>
                                <th className="text-right px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {episodes.data?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <PlaySquare size={32} className="mx-auto mb-3 opacity-40" />
                                        <p>Tidak ada episode ditemukan</p>
                                    </td>
                                </tr>
                            )}
                            {episodes.data?.map((ep) => (
                                <tr key={ep.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-500/15 rounded-lg flex items-center justify-center shrink-0">
                                                <span className="text-blue-400 text-xs font-bold">#{ep.number}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white text-sm font-medium truncate max-w-[200px]">
                                                    {ep.title || `Episode ${ep.number}`}
                                                </p>
                                                <p className="text-slate-400 text-xs md:hidden mt-0.5 truncate">
                                                    {ep.anime?.title}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm truncate max-w-[160px] block">{ep.anime?.title}</span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden lg:table-cell">
                                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                                            {ep.duration ? (
                                                <>
                                                    <Clock size={12} className="text-slate-400" />
                                                    {ep.duration}m
                                                </>
                                            ) : '—'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 hidden xl:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                                            {ep.release_date
                                                ? new Date(ep.release_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden xl:table-cell">
                                        {ep.video_url ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">Ada</span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400">Kosong</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/episodes/${ep.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="!p-2">
                                                    <Pencil size={14} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 hover:text-red-400 hover:!bg-red-500/10"
                                                onClick={() => setDeleteTarget(ep)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Pagination links={episodes.links} meta={episodes} />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Episode"
                description={`Apakah kamu yakin ingin menghapus episode #${deleteTarget?.number} dari "${deleteTarget?.anime?.title}"?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />
        </AdminLayout>
    );
}
