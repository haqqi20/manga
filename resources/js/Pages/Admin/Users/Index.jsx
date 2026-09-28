import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, SearchBar, Pagination, ConfirmModal } from '@/Components/Admin/UI';
import { Users, Trash2, ShieldCheck, ShieldOff, LogIn } from 'lucide-react';

export default function UsersIndex({ users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(null);

    const applyFilter = () => {
        const query = { search };
        if (filters.badge) query.badge = filters.badge;
        router.get('/admin/users', query, { preserveScroll: true, replace: true });
    };

    const handleToggleAdmin = (user) => {
        setToggling(user.id);
        router.patch(`/admin/users/${user.id}/toggle-admin`, {}, {
            onFinish: () => setToggling(null),
        });
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/users/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    const handleUpdateBadge = (user, newBadge) => {
        router.patch(`/admin/users/${user.id}/badge`, { badge: newBadge });
    };

    const handleImpersonate = (user) => {
        router.post(`/admin/users/${user.id}/impersonate`);
    };

    const titleLabel = filters.badge && filters.badge !== 'all'
        ? `Users - ${filters.badge.charAt(0).toUpperCase() + filters.badge.slice(1)}`
        : 'Users';

    return (
        <AdminLayout title="Manajemen Users">
            <Head title={`Admin - ${titleLabel}`} />

            <PageHeader
                title={titleLabel}
                description={`${users.total} user terdaftar`}
            />

            {/* Search */}
            <Card className="p-4 mb-5">
                <div className="flex gap-3">
                    <SearchBar
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilter()}
                        placeholder="Cari nama atau email..."
                        className="flex-1"
                    />
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
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Bergabung</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Role</th>
                                <th className="text-left px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Badge</th>
                                <th className="text-right px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-slate-400">
                                        <Users size={32} className="mx-auto mb-3 opacity-40" />
                                        <p>Tidak ada user ditemukan</p>
                                    </td>
                                </tr>
                            )}
                            {users.data?.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0 w-10 h-10">
                                                <div className={`w-full h-full outline outline-2 outline-offset-1 transition-all rounded-full overflow-hidden ${user.badge === 'vip' ? 'outline-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : user.badge === 'premium' ? 'outline-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : user.badge === 'developer' ? 'outline-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'outline-transparent'}`}>
                                                    <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-full h-full object-cover" />
                                                    {(user.badge === 'vip' || user.badge === 'premium' || user.badge === 'developer') && (
                                                        <div className="absolute inset-0 w-full h-full pointer-events-none animate-vip-sheen mix-blend-overlay" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
                                                    )}
                                                </div>
                                                {user.badge === 'vip' && (
                                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[8px] font-bold border border-white shadow-sm pointer-events-none z-10 leading-none">VIP</span>
                                                )}
                                                {user.badge === 'premium' && (
                                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[8px] font-bold border border-white shadow-sm pointer-events-none z-10 leading-none">PRO</span>
                                                )}
                                                {user.badge === 'developer' && (
                                                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[8px] font-bold border border-white shadow-sm pointer-events-none z-10 leading-none">DEV</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-900 dark:text-white font-medium text-sm truncate">{user.name}</p>
                                                <p className="text-slate-400 text-xs md:hidden mt-0.5 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 hidden md:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</span>
                                    </td>
                                    <td className="px-5 py-3.5 hidden lg:table-cell">
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {user.is_admin ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff2e2e]/10 text-[#ff2e2e] flex items-center gap-1 w-fit">
                                                <ShieldCheck size={11} />
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-fit block">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <select
                                            value={user.badge || 'null'}
                                            onChange={(e) => handleUpdateBadge(user, e.target.value)}
                                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        >
                                            <option value="null">Regular</option>
                                            <option value="premium">Premium</option>
                                            <option value="vip">VIP</option>
                                            <option value="developer">Developer</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {!user.is_admin && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="!p-2 hover:text-emerald-400 hover:!bg-emerald-500/10"
                                                    onClick={() => handleImpersonate(user)}
                                                    title="Login sebagai user"
                                                >
                                                    <LogIn size={14} />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`!p-2 ${user.is_admin ? 'hover:text-amber-400 hover:!bg-amber-500/10' : 'hover:text-blue-400 hover:!bg-blue-500/10'}`}
                                                onClick={() => handleToggleAdmin(user)}
                                                loading={toggling === user.id}
                                                title={user.is_admin ? 'Cabut admin' : 'Jadikan admin'}
                                            >
                                                {user.is_admin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="!p-2 hover:text-red-400 hover:!bg-red-500/10"
                                                onClick={() => setDeleteTarget(user)}
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

            <Pagination links={users.links} meta={users} />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus User"
                description={`Hapus user "${deleteTarget?.name}" (${deleteTarget?.email})? Aksi ini tidak dapat dibatalkan.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />
        </AdminLayout>
    );
}
