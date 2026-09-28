import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users2, Search, ExternalLink, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

const ROLE_MAP = {
    MAIN:       { label: 'Main',       cls: 'bg-violet-100 text-violet-700' },
    SUPPORTING: { label: 'Supporting', cls: 'bg-blue-100 text-blue-700' },
    BACKGROUND: { label: 'Background', cls: 'bg-slate-100 text-slate-500' },
};

function RoleBadge({ role }) {
    const r = ROLE_MAP[role?.toUpperCase()] || { label: role || '—', cls: 'bg-slate-100 text-slate-500' };
    return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.cls}`}>{r.label}</span>;
}

export default function CharactersIndex({ characters, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole]     = useState(filters.role || '');

    const applyFilters = (newSearch, newRole) => {
        router.get('/admin/characters', { search: newSearch, role: newRole }, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters(search, role);
    };

    const handleRole = (val) => {
        setRole(val);
        applyFilters(search, val);
    };

    const { data, current_page, last_page, from, to, total, links } = characters;

    return (
        <AdminLayout title="Karakter">
            <Head title="Admin - Karakter" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center">
                        <Users2 size={18} className="text-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-slate-900 dark:text-white font-bold text-lg">Karakter</h1>
                        <p className="text-slate-400 text-xs">{total?.toLocaleString()} karakter terdaftar</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-5 flex flex-wrap gap-3 items-center">
                <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari nama karakter..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff2e2e]/30 focus:border-[#ff2e2e]"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#ff2e2e] hover:bg-[#e82828] text-white text-sm font-semibold rounded-xl transition-colors">
                        Cari
                    </button>
                </form>

                <div className="flex gap-1.5">
                    {['', 'MAIN', 'SUPPORTING', 'BACKGROUND'].map(r => (
                        <button
                            key={r}
                            onClick={() => handleRole(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                role === r
                                    ? 'bg-[#ff2e2e] text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {r === '' ? 'Semua' : r.charAt(0) + r.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Karakter</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Anime</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                        Tidak ada karakter ditemukan.
                                    </td>
                                </tr>
                            ) : data.map((char, i) => (
                                <tr key={char.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-5 py-3 text-slate-400 text-xs">{(from || 0) + i}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {char.image_url ? (
                                                <img
                                                    src={char.image_url}
                                                    alt={char.name}
                                                    className="w-9 h-12 object-cover rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800"
                                                />
                                            ) : (
                                                <div className="w-9 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                                                    <Users2 size={14} className="text-slate-300" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/character/${char.id}/${char.slug || char.id}`}
                                                    target="_blank"
                                                    className="text-slate-900 dark:text-white font-medium hover:text-[#ff2e2e] transition-colors truncate block"
                                                >
                                                    {char.name}
                                                </Link>
                                                {char.anilist_id && (
                                                    <span className="text-slate-400 text-xs">AniList #{char.anilist_id}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        {char.anime ? (
                                            <Link
                                                href={`/admin/anime/${char.anime.id}/edit`}
                                                className="text-slate-600 dark:text-slate-300 hover:text-[#ff2e2e] transition-colors text-sm flex items-center gap-1 group"
                                            >
                                                <span className="truncate max-w-[180px] block">{char.anime.title}</span>
                                                <ExternalLink size={11} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <RoleBadge role={char.role} />
                                    </td>
                                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize text-xs">
                                        {char.gender || '—'}
                                    </td>
                                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">
                                        {char.age || '—'}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {char.anime && (
                                            <Link
                                                href={`/admin/anime/${char.anime.id}/edit`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                <Edit2 size={12} />
                                                Edit
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {last_page > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400">
                            Menampilkan {from}–{to} dari {total?.toLocaleString()} karakter
                        </p>
                        <div className="flex items-center gap-1">
                            {links.map((link, i) => {
                                if (link.label === '&laquo; Previous') {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`p-1.5 rounded-lg transition-colors ${link.url ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 cursor-default pointer-events-none'}`}
                                        >
                                            <ChevronLeft size={14} />
                                        </Link>
                                    );
                                }
                                if (link.label === 'Next &raquo;') {
                                    return (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`p-1.5 rounded-lg transition-colors ${link.url ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-300 cursor-default pointer-events-none'}`}
                                        >
                                            <ChevronRight size={14} />
                                        </Link>
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                                            link.active
                                                ? 'bg-[#ff2e2e] text-white'
                                                : link.url
                                                    ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    : 'text-slate-300 cursor-default pointer-events-none'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
