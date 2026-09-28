import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AnimeCard from '@/Components/AnimeCard';
import { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

const LETTERS = ['#', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const SORT_OPTIONS = [
    { value: 'latest',  label: 'Terbaru' },
    { value: 'popular', label: 'Terpopuler' },
    { value: 'rating',  label: 'Rating Tertinggi' },
    { value: 'title',   label: 'Judul (A-Z)' },
];
const STATUS_OPTIONS = [
    { value: 'all',       label: 'Semua Status' },
    { value: 'Ongoing',   label: 'Ongoing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Hiatus',    label: 'Hiatus' },
];

export default function Movies({ animes, genres, filters = {} }) {
    const [search,       setSearch]       = useState(filters.search  || '');
    const [sort,         setSort]         = useState(filters.sort    || 'latest');
    const [status,       setStatus]       = useState(filters.status  || 'all');
    const [letter,       setLetter]       = useState(filters.letter  || '');
    const [genre,        setGenre]        = useState(filters.genre   || '');
    const [filterOpen,   setFilterOpen]   = useState(false);

    const apply = (overrides = {}) => {
        const params = {
            search: overrides.search  !== undefined ? overrides.search  : search,
            sort:   overrides.sort    !== undefined ? overrides.sort    : sort,
            status: overrides.status  !== undefined ? overrides.status  : status,
            letter: overrides.letter  !== undefined ? overrides.letter  : letter,
            genre:  overrides.genre   !== undefined ? overrides.genre   : genre,
        };
        // Strip blank values
        Object.keys(params).forEach(k => { if (!params[k] || params[k] === 'all') delete params[k]; });
        router.get('/movies', params, { preserveScroll: true, replace: true });
    };

    const handleLetter = (l) => {
        const newLetter = letter === l ? '' : l;
        setLetter(newLetter);
        apply({ letter: newLetter });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        apply();
    };

    const clearAll = () => {
        setSearch(''); setSort('latest'); setStatus('all'); setLetter(''); setGenre('');
        router.get('/movies', {}, { preserveScroll: true, replace: true });
    };

    const hasFilters = search || sort !== 'latest' || status !== 'all' || letter || genre;

    return (
        <AppLayout>
            <Head title="Movie Anime List" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Movie Anime List</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{animes.total} anime ditemukan</p>
                    </div>
                    {hasFilters && (
                        <button onClick={clearAll} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all">
                            <X className="w-3.5 h-3.5" /> Reset Filter
                        </button>
                    )}
                </div>

                {/* Search + Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari judul anime..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                        />
                        {search && (
                            <button type="button" onClick={() => { setSearch(''); apply({ search: '' }); }} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-200">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="flex items-center gap-2 shrink-0">
                        <select value={sort} onChange={e => { setSort(e.target.value); apply({ sort: e.target.value }); }}
                            className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 shadow-sm cursor-pointer">
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => setFilterOpen(v => !v)}
                            className={`flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${filterOpen ? 'bg-red-600 border-red-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
                            <SlidersHorizontal className="w-4 h-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {filterOpen && (
                    <div className="mb-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Status</label>
                                <select value={status} onChange={e => { setStatus(e.target.value); apply({ status: e.target.value }); }}
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400">
                                    {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Genre</label>
                                <select value={genre} onChange={e => { setGenre(e.target.value); apply({ genre: e.target.value }); }}
                                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400">
                                    <option value="">Semua Genre</option>
                                    {(genres || []).map(g => <option key={g.id} value={g.slug}>{g.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Letter Filter */}
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {LETTERS.map(l => (
                            <button
                                key={l}
                                onClick={() => handleLetter(l)}
                                className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all duration-150 ${
                                    letter === l
                                        ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg shadow-red-500/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:text-slate-100'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Anime Grid */}
                {animes.data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {animes.data.map(anime => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Search className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">Tidak ada anime ditemukan</p>
                        <p className="text-slate-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
                        <button onClick={clearAll} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                            Reset Filter
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {animes.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-10 select-none">
                        {/* Prev */}
                        <a
                            href={animes.prev_page_url || '#'}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${!animes.prev_page_url ? 'opacity-40 pointer-events-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Sebelumnya
                        </a>

                        {animes.links.slice(1, -1).map((link, i) => (
                            <a
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${link.active ? 'bg-red-600 border-red-600 text-white shadow' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}

                        {/* Next */}
                        <a
                            href={animes.next_page_url || '#'}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${!animes.next_page_url ? 'opacity-40 pointer-events-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                        >
                            Berikutnya <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
