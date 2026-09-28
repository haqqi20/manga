import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdsComponent from "@/Components/AdsComponent";

const LETTERS = ['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

export default function NovelIndex({ mangas = { data: [], links: [], total: 0, prev_page_url: null, next_page_url: null, last_page: 1 }, genres = [], filters = {} }) {
    const data  = Array.isArray(mangas.data) ? mangas.data : [];
    const links = Array.isArray(mangas.links) ? mangas.links : [];
    const total = mangas.total || 0;

    const [search, setSearch] = useState(filters.search || '');
    const [sort, setSort] = useState(filters.sort || 'latest_update');
    const [status, setStatus] = useState(filters.status || 'all');
    const [origin, setOrigin] = useState(filters.type || 'all');
    const [letter, setLetter] = useState(filters.letter || '');
    const [selectedGenres, setSelectedGenres] = useState(filters.genre ? (Array.isArray(filters.genre) ? filters.genre : [filters.genre]) : []);

    const isFiltered = !!(search || sort !== 'latest_update' || status !== 'all' || origin !== 'all' || letter || selectedGenres.length > 0);

    const apply = (overrides = {}) => {
        const params = {
            search: overrides.search !== undefined ? overrides.search : search,
            sort:   overrides.sort   !== undefined ? overrides.sort   : sort,
            status: overrides.status !== undefined ? overrides.status : status,
            type:   overrides.type   !== undefined ? overrides.type   : origin,
            letter: overrides.letter !== undefined ? overrides.letter : letter,
            genre:  overrides.genre  !== undefined ? overrides.genre  : selectedGenres,
        };

        Object.keys(params).forEach(k => {
            if (
                !params[k] ||
                params[k] === 'all' ||
                params[k] === 'latest_update' ||
                (Array.isArray(params[k]) && params[k].length === 0)
            ) {
                delete params[k];
            }
        });

        router.get('/novel', params, { preserveScroll: true });
    };

    const handleLetter = (l) => {
        const newLetter = letter === l ? '' : l;
        setLetter(newLetter);
        apply({ letter: newLetter });
    };

    const clearAll = () => {
        setSearch('');
        setSort('latest_update');
        setStatus('all');
        setOrigin('all');
        setLetter('');
        setSelectedGenres([]);

        router.get('/novel', {}, { preserveScroll: true });
    };

    const getImgSrc = (poster) => {
        if (!poster) return '';
        if (poster.startsWith('http')) return poster;
        return '/storage/' + poster;
    };

    const getChapter = (manga) => {
        if (!manga) return 'Update';
        const last = manga.last_chapter || manga.lastChapter || manga.latestChapter || manga.latest_chapter || manga.chapters?.[0];
        return last?.title || manga.last_chapter_title || 'Update';
    };

    const getRating = (manga) => {
        if (!manga) return '0.0';
        return (parseFloat(manga.rating) || 0).toFixed(1);
    };

    const getTypeBadgeColor = (type) => {
        if (type === 'Korean') return 'bg-rose-600';
        if (type === 'Chinese') return 'bg-emerald-600';
        return 'bg-sky-600';
    };

    return (
        <AppLayout>
            <Head title="Novel Catalog" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-screen">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Novel Catalog</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{total} novel ditemukan</p>
                    </div>

                    {isFiltered && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex-1 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul novel..."
                            className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-sky-400"
                        />
                    </form>

                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            apply({ sort: e.target.value });
                        }}
                        className="h-10 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm"
                    >
                        <option value="latest_update">Chapter Terbaru</option>
                        <option value="new_manga">Novel Terbaru</option>
                        <option value="popular">Terpopuler</option>
                        <option value="rating">Rating</option>
                        <option value="title">A-Z</option>
                    </select>
                </div>

                {/* Category Filter */}
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {['All', 'Jepang', 'Korean', 'Chinese'].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    if (type === 'All') {
                                        router.get('/novel', {}, { preserveScroll: true });
                                        setOrigin('all');
                                        setLetter('');
                                        setSearch('');
                                        setSort('latest_update');
                                        setStatus('all');
                                        setSelectedGenres([]);
                                    } else {
                                        setOrigin(type);
                                        apply({ type });
                                    }
                                }}
                                className={`px-4 h-9 rounded-lg font-semibold text-sm transition-all duration-150 ${
                                    origin === (type === 'All' ? 'all' : type)
                                        ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Letter Filter */}
                <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                        {LETTERS.map(l => (
                            <button
                                key={l}
                                onClick={() => handleLetter(l)}
                                className={`w-9 h-9 rounded-lg font-semibold text-sm transition-all duration-150 ${
                                    letter === l
                                        ? 'bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 [content-visibility:auto]">
                        {data.map((m) => (
                            <Link
                                key={m.id}
                                href={'/novel/' + m.slug}
                                className="group block relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border sm:hover:-translate-y-1 sm:hover:shadow-md transition-transform duration-200"
                            >
                                <div className="aspect-[3/4.3] relative overflow-hidden">
                                    <img
                                        src={getImgSrc(m.poster)}
                                        className="w-full h-full object-cover will-change-transform transition-transform duration-300 sm:group-hover:scale-105"
                                        alt={m.title}
                                        loading="lazy"
                                        decoding="async"
                                    />

                                    {m.type && (
                                        <div className="absolute top-2 left-2">
                                            <span className={`${getTypeBadgeColor(m.type)} text-white text-[9px] px-2 py-1 rounded-md`}>
                                                {m.type}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16">
                                        <h3 className="text-white text-xs sm:text-sm line-clamp-2 mb-1">{m.title}</h3>
                                        <div className="flex items-center justify-between text-[10px] text-white/80">
                                            <span>{getChapter(m)}</span>
                                            <span>⭐ {getRating(m)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400">
                        Tidak ada novel ditemukan
                    </div>
                )}

                <center><AdsComponent /></center>

                {/* Pagination */}
                {mangas.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-10 select-none">
                        <a
                            href={mangas.prev_page_url || '#'}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${!mangas.prev_page_url ? 'opacity-40 pointer-events-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                        >
                            <ChevronLeft className="w-4 h-4" /> Sebelumnya
                        </a>

                        {links.slice(1, -1).map((link, i) => (
                            <a
                                key={i}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${link.active ? 'bg-red-600 border-red-600 text-white shadow' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}

                        <a
                            href={mangas.next_page_url || '#'}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${!mangas.next_page_url ? 'opacity-40 pointer-events-none' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-red-50 shadow-sm'}`}
                        >
                            Berikutnya <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}