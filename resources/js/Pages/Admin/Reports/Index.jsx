import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, SearchBar, Pagination, ConfirmModal } from '@/Components/Admin/UI';
import { AlertTriangle, Trash2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function ReportsIndex({ reports, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilter = () => {
        const query = { search };
        if (filters.status) query.status = filters.status;
        router.get('/admin/reports', query, { preserveScroll: true, replace: true });
    };

    const handleUpdateStatus = (report, status) => {
        router.patch(`/admin/reports/${report.id}/status`, { status });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/reports/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'resolved': return 'bg-emerald-50 text-emerald-600';
            case 'ignored': return 'bg-slate-100 text-slate-500';
            default: return 'bg-amber-50 text-amber-600';
        }
    };

    return (
        <AdminLayout title="Laporan Episode">
            <Head title="Admin - Laporan Episode" />

            <PageHeader
                title="Laporan Masalah"
                description={`${reports.total} laporan dari user`}
            />

            {/* Filter */}
            <Card className="p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-3">
                    <SearchBar
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter()}
                        placeholder="Cari user atau judul anime..."
                        className="flex-1"
                    />
                    <select
                        value={filters.status || 'all'}
                        onChange={(e) => router.get('/admin/reports', { ...filters, status: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                        <option value="all">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="ignored">Ignored</option>
                    </select>
                    <Button variant="secondary" onClick={applyFilter}>Cari</Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">User</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Tipe</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Series / Unit</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Pesan</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reports.data?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-slate-400">
                                        <AlertTriangle size={32} className="mx-auto mb-3 opacity-40" />
                                        <p>Tidak ada laporan ditemukan</p>
                                    </td>
                                </tr>
                            )}
                            {reports.data?.map((report) => (
                                <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={report.user.avatar_url || `https://ui-avatars.com/api/?name=${report.user.name}&background=random`} 
                                                className="w-8 h-8 rounded-full object-cover shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white font-medium text-sm truncate">{report.user.name}</p>
                                                <p className="text-slate-400 text-[10px] truncate">{report.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {report.episode ? (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 uppercase tracking-wider">
                                                    Anime
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 uppercase tracking-wider">
                                                    Manga
                                                </span>
                                            )}
                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                {report.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {report.episode ? (
                                            <a 
                                                href={`/anime/${report.episode?.anime?.slug}/episode/${report.episode?.number}`} 
                                                target="_blank"
                                                className="group flex items-center gap-1.5 min-w-0"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-slate-900 dark:text-white font-medium text-sm truncate group-hover:text-red-500 transition-colors">
                                                        Episode {report.episode?.number}
                                                    </p>
                                                    <p className="text-slate-400 text-[10px] truncate">{report.episode?.anime?.title}</p>
                                                </div>
                                                <ExternalLink size={12} className="text-slate-300 group-hover:text-red-400 transition-colors shrink-0" />
                                            </a>
                                        ) : (
                                            <a 
                                                href={`/manga/${report.manga?.slug}`} 
                                                target="_blank"
                                                className="group flex items-center gap-1.5 min-w-0"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-slate-900 dark:text-white font-medium text-sm truncate group-hover:text-red-500 transition-colors">
                                                        {report.manga?.title}
                                                    </p>
                                                    <p className="text-slate-400 text-[10px] truncate">Manga Series</p>
                                                </div>
                                                <ExternalLink size={12} className="text-slate-300 group-hover:text-red-400 transition-colors shrink-0" />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                                            {report.message || 'Tidak ada pesan spesifik'}
                                        </p>
                                        <p className="text-slate-400 text-[10px] mt-0.5">
                                            {new Date(report.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {report.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 hover:text-emerald-400 hover:!bg-emerald-500/10 text-slate-400"
                                                        onClick={() => handleUpdateStatus(report, 'resolved')}
                                                        title="Tandai Selesai"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="!p-2 hover:text-amber-400 hover:!bg-amber-500/10 text-slate-400"
                                                        onClick={() => handleUpdateStatus(report, 'ignored')}
                                                        title="Abaikan"
                                                    >
                                                        <XCircle size={14} />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 hover:text-red-400 hover:!bg-red-500/10 text-slate-400"
                                                onClick={() => setDeleteTarget(report)}
                                                title="Hapus"
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

            <Pagination links={reports.links} meta={reports} />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Laporan"
                description="Hapus data laporan ini? Tindakan ini tidak dapat dibatalkan."
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />
        </AdminLayout>
    );
}
