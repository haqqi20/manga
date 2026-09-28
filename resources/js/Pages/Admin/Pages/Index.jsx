import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, SearchBar, Pagination, ConfirmModal, Select } from '@/Components/Admin/UI';
import { FileText, Pencil, Trash2, Plus, Globe, FileX } from 'lucide-react';

export default function PagesIndex({ pages, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const applyFilter = () => {
        router.get('/admin/pages', { search, status }, { preserveScroll: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/pages/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <AdminLayout title="Manajemen Pages">
            <Head title="Admin - Pages" />

            <PageHeader
                title="Pages"
                description={`${pages.total} halaman tersedia`}
                action={
                    <Link href="/admin/pages/create">
                        <Button variant="primary" className="flex items-center gap-2">
                            <Plus size={16} /> Buat Halaman
                        </Button>
                    </Link>
                }
            />

            {/* Filters */}
            <Card className="p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <SearchBar
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter()}
                        placeholder="Cari judul halaman..."
                        className="flex-1"
                    />
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    >
                        <option value="all">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                    <Button variant="secondary" onClick={applyFilter}>Filter</Button>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Judul</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Slug</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Diperbarui</th>
                                <th className="text-right px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pages.data?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-slate-400">
                                        <FileX size={40} className="mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">Belum ada halaman</p>
                                    </td>
                                </tr>
                            )}
                            {pages.data?.map(page => (
                                <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <FileText size={14} className="text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-800 dark:text-white">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                                            /{page.slug}
                                        </code>
                                    </td>
                                    <td className="px-5 py-4">
                                        {page.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                                <Globe size={11} /> Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                <FileText size={11} /> Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-400">
                                        {new Date(page.updated_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/pages/${page.id}/edit`}>
                                                <button className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                                    <Pencil size={15} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget(page)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages.last_page > 1 && (
                    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                        <Pagination links={pages.links} />
                    </div>
                )}
            </Card>

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Halaman"
                message={`Yakin ingin menghapus halaman "${deleteTarget?.title}"? Tindakan ini tidak bisa dibatalkan.`}
                confirmLabel="Hapus"
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </AdminLayout>
    );
}
