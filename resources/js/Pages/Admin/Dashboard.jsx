import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Film, BookOpen, PlaySquare, Layers, Tag, Users, Users2, Star, Clock, TrendingUp, ArrowRight, Plus, AlertTriangle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, href }) {
    return (
        <Link
            href={href}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-300 transition-all duration-200 hover:shadow-sm"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
                <p className="text-slate-900 dark:text-white font-bold text-2xl mt-0.5">{value?.toLocaleString()}</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 dark:text-slate-400 transition-colors shrink-0" />
        </Link>
    );
}

function StatusBadge({ status }) {
    const map = {
        ongoing:   { label: 'Ongoing',   cls: 'bg-blue-50 text-blue-600' },
        completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
        upcoming:  { label: 'Upcoming',  cls: 'bg-amber-50 text-amber-600' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
            {label}
        </span>
    );
}

export default function Dashboard({ stats, recentAnimes, recentMangas, recentEpisodes }) {
    const statCards = [
        { icon: Film,      label: 'Total Anime',     value: stats.animes,         color: 'bg-violet-500/20 text-violet-400',   href: '/admin/anime' },
        { icon: BookOpen,  label: 'Total Manga',     value: stats.mangas,         color: 'bg-indigo-500/20 text-indigo-400',   href: '/admin/manga' },
        { icon: PlaySquare, label: 'Total Episode',  value: stats.episodes,       color: 'bg-blue-500/20 text-blue-400',       href: '/admin/episodes' },
        { icon: Layers,    label: 'Total Chapter',   value: stats.chapters,       color: 'bg-emerald-500/20 text-emerald-400', href: '/admin/manga' },
        { icon: Users2,    label: 'Total Karakter',  value: stats.characters,     color: 'bg-pink-500/20 text-pink-400',       href: '/admin/characters' },
        { icon: Tag,        label: 'Total Genre',    value: stats.genres,         color: 'bg-amber-500/20 text-amber-400',     href: '/admin/genres' },
        { icon: Users,      label: 'Total User',     value: stats.users,          color: 'bg-emerald-500/20 text-emerald-400', href: '/admin/users' },
        { icon: Star,       label: 'Anime Featured', value: stats.featured_anime, color: 'bg-[#ff2e2e]/20 text-[#ff2e2e]',    href: '/admin/anime' },
        { icon: AlertTriangle, label: 'Laporan Masalah', value: stats.reports,        color: 'bg-orange-500/20 text-orange-400',   href: '/admin/reports' },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin - Dashboard" />

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Link
                    href="/admin/anime/create"
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff2e2e] hover:bg-[#e82828] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#ff2e2e]/20"
                >
                    <Plus size={15} />
                    Tambah Anime
                </Link>
                <Link
                    href="/admin/manga/create"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={15} />
                    Tambah Manga
                </Link>
                <Link
                    href="/admin/episodes/create"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <Plus size={15} />
                    Tambah Episode
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 mb-8">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Anime */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Film size={16} className="text-violet-500" />
                            <h2 className="text-slate-900 dark:text-white font-semibold text-sm">Anime Terbaru</h2>
                        </div>
                        <Link href="/admin/anime" className="text-slate-400 hover:text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 transition-colors">
                            Lihat semua <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentAnimes.map((anime) => (
                            <div key={anime.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                                {anime.poster ? (
                                    <img src={anime.poster} alt={anime.title} className="w-9 h-12 object-cover rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800" />
                                ) : (
                                    <div className="w-9 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                                        <Film size={14} className="text-slate-300" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{anime.title}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{anime.type} · {anime.release_year || '—'}</p>
                                </div>
                                <StatusBadge status={anime.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Manga */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-500" />
                            <h2 className="text-slate-900 dark:text-white font-semibold text-sm">Manga Terbaru</h2>
                        </div>
                        <Link href="/admin/manga" className="text-slate-400 hover:text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 transition-colors">
                            Lihat semua <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentMangas.map((manga) => (
                            <div key={manga.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                {manga.poster ? (
                                    <img src={manga.poster} alt={manga.title} className="w-9 h-12 object-cover rounded-lg shrink-0 bg-slate-100 dark:bg-slate-800" />
                                ) : (
                                    <div className="w-9 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 flex items-center justify-center">
                                        <BookOpen size={14} className="text-slate-300" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{manga.title}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">{manga.type} · {manga.release_year || '—'}</p>
                                </div>
                                <StatusBadge status={manga.status?.toLowerCase()} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Episodes */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <PlaySquare size={16} className="text-blue-500" />
                            <h2 className="text-slate-900 dark:text-white font-semibold text-sm">Episode Terbaru</h2>
                        </div>
                        <Link href="/admin/episodes" className="text-slate-400 hover:text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 transition-colors">
                            Lihat semua <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentEpisodes.map((ep) => (
                            <div key={ep.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center shrink-0">
                                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">#{ep.number}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
                                        {ep.title || `Episode ${ep.number}`}
                                    </p>
                                    <p className="text-slate-400 text-xs mt-0.5 truncate">
                                        {ep.anime?.title || '—'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
