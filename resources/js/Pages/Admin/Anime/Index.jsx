import { useState } from 'react';
import axios from 'axios';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, StatusBadge, SearchBar, Pagination, ConfirmModal } from '@/Components/Admin/UI';
import { Plus, Pencil, Trash2, Film, Star, Filter, ListVideo, LayoutTemplate } from 'lucide-react';
import ScrapeEpisodeModal from '@/Components/Admin/ScrapeEpisodeModal';

export default function AnimeIndex({ animes, filters }) {
    const { siteSettings } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [scrapeTarget, setScrapeTarget] = useState(null);

    const applyFilter = (overrides = {}) => {
        router.get('/admin/anime', {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            type: overrides.type ?? type,
        }, { preserveScroll: true, replace: true });
    };

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter') applyFilter();
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/anime/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    const handleToggleSlider = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        console.log('DEBUG: handleToggleSlider triggered');
        const settings = siteSettings || {};
        console.log('DEBUG: Current siteSettings:', settings);

        const data = {
            ...settings,
            nav_links: typeof settings.nav_links === 'string' ? settings.nav_links : JSON.stringify(settings.nav_links || []),
            legal_links: typeof settings.legal_links === 'string' ? settings.legal_links : JSON.stringify(settings.legal_links || []),
            hero_slider_enabled: !settings.hero_slider_enabled
        };

        console.log('DEBUG: Sending update to settings:', data);

        router.post(route('admin.settings.update'), data, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => console.log('DEBUG: Update Success'),
            onError: (errors) => console.log('DEBUG: Update Error:', errors),
        });
    };

    const handleToggleFeatured = (anime) => {
        // Use window.axios if it's global, or import it. In this project it's usually global.
        (window.axios || axios).post(`/admin/anime/${anime.id}/toggle-featured`)
            .then(res => {
                router.reload({ only: ['animes'] });
            })
            .catch(err => {
                alert(err.response?.data?.error || 'Gagal mengubah status featured.');
            });
    };

    return (
        <AdminLayout title="Manajemen Anime">
            <Head title="Admin - Anime" />

            <PageHeader
                title="Anime"
                description={`${animes.total} anime terdaftar`}
                action={
                    <Link href="/admin/anime/create">
                        <Button>
                            <Plus size={15} />
                            Tambah Anime
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
                        onKeyDown={handleSearchEnter}
                        placeholder="Cari judul anime..."
                        className="flex-1"
                    />
                    <div className="flex gap-3">
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); applyFilter({ status: e.target.value }); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Semua Status</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                        <select
                            value={type}
                            onChange={(e) => { setType(e.target.value); applyFilter({ type: e.target.value }); }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Semua Tipe</option>
                            <option value="TV">TV</option>
                            <option value="Movie">Movie</option>
                            <option value="OVA">OVA</option>
                            <option value="ONA">ONA</option>
                            <option value="Special">Special</option>
                        </select>
                        <Button variant="secondary" onClick={() => applyFilter()} size="md">
                            <Filter size={14} />
                            Filter
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Anime</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Tipe</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Status</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">Rating</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">Eps</th>
                                <th className="text-right px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {animes.data?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <Film size={32} className="mx-auto mb-3 opacity-40" />
                                        <p>Tidak ada anime ditemukan</p>
                                    </td>
                                </tr>
                            )}
                            {animes.data?.map((anime) => (
                                <tr key={anime.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            {anime.poster ? (
                                                <img
                                                    src={anime.poster}
                                                    alt={anime.title}
                                                    className="w-9 h-12 object-cover rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800"
                                                />
                                            ) : (
                                                <div className="w-9 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                                                    <Film size={14} className="text-slate-300" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white font-medium text-sm truncate max-w-[200px]">
                                                    {anime.title}
                                                </p>
                                                <p className="text-slate-400 text-xs mt-0.5">
                                                    {anime.studio || '—'} · {anime.release_year || '—'}
                                                </p>
                                                {/* Mobile extras */}
                                                <div className="flex items-center gap-1.5 mt-1 md:hidden">
                                                    <span className="text-slate-400 text-xs">{anime.type}</span>
                                                    <span className="text-slate-300">·</span>
                                                    <StatusBadge status={anime.status} />
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleFeatured(anime)}
                                                className={`shrink-0 p-1 rounded-lg transition-all ${anime.is_featured ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-100'}`}
                                                title={anime.is_featured ? "Hapus dari Slider" : "Tambahkan ke Slider"}
                                            >
                                                <Star size={16} fill={anime.is_featured ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">{anime.type}</span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden lg:table-cell">
                                        <StatusBadge status={anime.status} />
                                    </td>
                                    <td className="px-5 py-3.5 hidden xl:table-cell">
                                        <span className="text-amber-400 text-sm font-medium">
                                            {anime.rating ? `★ ${parseFloat(anime.rating).toFixed(1)}` : '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden xl:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">{anime.episodes_count ?? 0}</span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 hover:text-blue-400 hover:!bg-blue-500/10"
                                                onClick={() => setScrapeTarget(anime)}
                                                title="Atur Episode (Scrape Otakudesu)"
                                            >
                                                <ListVideo size={14} />
                                            </Button>
                                            <Link href={`/admin/anime/${anime.id}/edit`}>
                                                <Button variant="ghost" size="sm" className="!p-2">
                                                    <Pencil size={14} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 hover:text-red-400 hover:!bg-red-500/10"
                                                onClick={() => setDeleteTarget(anime)}
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

            <Pagination links={animes.links} meta={animes} />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Anime"
                description={`Apakah kamu yakin ingin menghapus "${deleteTarget?.title}"? Semua episode terkait juga akan dihapus.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />

            {scrapeTarget && (
                <ScrapeEpisodeModal
                    anime={scrapeTarget}
                    onClose={() => { setScrapeTarget(null); router.reload({ only: ['animes'] }); }}
                />
            )}
        </AdminLayout>
    );
}
