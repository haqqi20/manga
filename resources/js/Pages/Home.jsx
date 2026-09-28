import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import HeroSlider from '@/Components/HeroSlider';
import LatestUpdateCard from '@/Components/LatestUpdateCard';
import MangaHeroSlider from '@/Components/MangaHeroSlider';
import DiscordBanner from '@/Components/DiscordBanner';
import {
    ChevronRight,
    Clock,
    ArrowRight,
    BookOpen,
} from 'lucide-react';
import AdSlot from '@/Components/AdSlot';

export default function Home({
    featured,
    latestUpdates,
    popular,
    ongoingAnime = [],
    recommended,
    popularManga = [],
    popularNovels = [],
    trendingManga = [],
    latestMangaUpdates = [],
    latestNovelUpdates = [],
}) {
    const { siteSettings, ads } = usePage().props;
    const getPoster = (poster) => {
        if (!poster) return '';
        return poster.startsWith('http') ? poster : `/storage/${poster}`;
    };

    const getChapterNumber = (manga) => {
        const lastCh = manga.last_chapter || manga.lastChapter;
        return lastCh?.chapter_number ? parseFloat(lastCh.chapter_number).toString() : '0';
    };

    const getChapterTitle = (item) => {
        const lastCh = item.last_chapter || item.lastChapter;

        if (!lastCh) return 'Belum ada chapter';

        const rawTitle = String(lastCh.title || '').trim();

        if (rawTitle) {
    return rawTitle
        .replace(/^Ch\.\s*[-:]?\s*/i, '')
        .replace(/^Ch\s+[-:]\s*/i, '')
        .trim();
}

        if (lastCh.chapter_number) {
            return `Chapter ${parseFloat(lastCh.chapter_number).toString()}`;
        }

        return lastCh.slug || 'Chapter terbaru';
    };

    const getChapterDate = (manga) => {
        const lastCh = manga.last_chapter || manga.lastChapter;

        if (!lastCh?.created_at) return '?';

        return new Date(lastCh.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
    };

    const getRating = (item) => {
        return (parseFloat(item?.rating) || 0).toFixed(1);
    };

    const getAnimeList = () => {
        const fromOngoing = Array.isArray(ongoingAnime) ? ongoingAnime : [];

        // Data popular dari backend lama bentuknya object/group, contoh:
        // popular['Ongoing'] dan popular['Complete'].
        // Jadi jangan diperlakukan sebagai array biasa.
        const fromPopularOngoing = Array.isArray(popular?.Ongoing)
            ? popular.Ongoing
            : Array.isArray(popular?.ongoing)
                ? popular.ongoing
                : [];

        const fromPopularArray = Array.isArray(popular) ? popular : [];
        const fromLatest = Array.isArray(latestUpdates) ? latestUpdates : [];

        const source = fromOngoing.length > 0
            ? fromOngoing
            : fromPopularOngoing.length > 0
                ? fromPopularOngoing
                : fromPopularArray.length > 0
                    ? fromPopularArray
                    : fromLatest;

        return source
            .filter(Boolean)
            .filter((anime) => {
                if (fromOngoing.length > 0 || fromPopularOngoing.length > 0) return true;

                const status = String(anime?.status || anime?.anime_status || anime?.animeStatus || '').toLowerCase();
                if (!status) return true;

                return status.includes('ongoing') || status.includes('berjalan') || status.includes('airing');
            })
            .slice(0, 12);
    };

    const getAnimeEpisode = (anime) => {
        const latestEpisode = anime?.latest_episode || anime?.latestEpisode || anime?.last_episode || anime?.lastEpisode;
        const episodeNumber = latestEpisode?.episode_number
            || latestEpisode?.number
            || latestEpisode?.episode
            || anime?.latest_episode_number
            || anime?.episode_number
            || anime?.episode
            || anime?.episodes_count;

        if (!episodeNumber) return 'Episode terbaru';

        return `Ep. ${parseFloat(episodeNumber).toString()}`;
    };

    const getAnimeTypeBg = (type) => {
        if (type === 'Movie') return 'bg-amber-500';
        if (type === 'ONA') return 'bg-emerald-500';
        if (type === 'OVA') return 'bg-sky-500';
        return 'bg-fuchsia-600';
    };


    const getTypeBg = (type) => {
        if (type === 'Manhwa') return 'bg-rose-500';
        if (type === 'Manhua') return 'bg-emerald-500';
        return 'bg-fuchsia-600';
    };

    const getNovelTypeBg = (type) => {
        if (type === 'Korean') return 'bg-rose-500';
        if (type === 'Chinese') return 'bg-emerald-500';
        return 'bg-fuchsia-600';
    };

    const ongoingAnimeItems = getAnimeList();

    return (
        <AppLayout>
            <Head title="Mangaku - Baca Manga, Novel & Nonton Anime Sub Indo" />

            <div className="min-h-screen pb-12 w-full pt-0">
                {siteSettings.hero_slider_enabled && (
                    <HeroSlider featured={featured} />
                )}

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 md:mt-10 space-y-10 md:space-y-16">
                    <AdSlot code={ads?.home_top} />

                    {/* Manga Populer */}
                    {popularManga.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-fuchsia-500 via-cyan-400 to-amber-300 rounded-full"></div>

                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        Manga <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-300">Populer</span>
                                        <BookOpen className="w-5 h-5 text-fuchsia-500" />
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {popularManga.map((manga, idx) => {
                                    const chNum = getChapterNumber(manga);
                                    const rating = getRating(manga);
                                    const typeBg = getTypeBg(manga.type);

                                    return (
                                        <Link
                                            key={manga.id}
                                            href={`/manga/${manga.slug}`}
                                            className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5"
                                        >
                                            <div className="aspect-[3/4.3] relative overflow-hidden">
                                                <img
                                                    src={getPoster(manga.poster)}
                                                    alt={manga.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                <div className="absolute top-2 right-2">
                                                    <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded bg-black/60 text-white">
                                                        {idx + 1}
                                                    </div>
                                                </div>

                                                {manga.type && (
                                                    <div className="absolute top-2 left-2">
                                                        <span className={`${typeBg} text-white text-[9px] px-2 py-0.5 rounded font-bold`}>
                                                            {manga.type}
                                                        </span>
                                                    </div>
                                                )}

                                                {manga.status === 'Completed' && (
                                                    <div className="absolute top-10 right-2">
                                                        <span className="px-2 py-0.5 bg-yellow-500 text-yellow-950 text-[9px] font-bold rounded">
                                                            TAMAT
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                    <h3 className="text-white text-xs font-bold line-clamp-2">
                                                        {manga.title}
                                                    </h3>

                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-[10px] text-white/80">
                                                            Ch. {chNum}
                                                        </span>

                                                        <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1">
                                                            ⭐ {rating}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center mt-6">
                                <Link
                                    href="/manga"
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-white/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-800 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-all group shadow-sm"
                                >
                                    Lihat Semua Manga
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </section>
                    )}



                    {/* Update Manga Terbaru */}
                    {latestMangaUpdates.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <BookOpen className="text-fuchsia-500 w-6 h-6" />
                                    Update Manga Terbaru
                                </h2>

                                <Link
                                    href="/manga?sort=latest_update"
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors"
                                >
                                    Lihat Semua <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
                                {latestMangaUpdates.map((manga) => (
                                    <Link
                                        key={`latest-manga-${manga.id}`}
                                        href={`/manga/${manga.slug}`}
                                        className="group bg-white/75 dark:bg-slate-950/70 backdrop-blur-xl rounded-2xl border border-white/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                    >
                                        <div className="flex gap-3 p-4">
                                            <img
                                                src={getPoster(manga.poster)}
                                                alt={manga.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-20 h-28 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                                            />

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-fuchsia-500 transition-colors">
                                                    {manga.title}
                                                </h3>

                                                <div className="mt-3 border-t border-dashed border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            Chapter {getChapterNumber(manga)}
                                                        </span>

                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                            {getChapterDate(manga)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="text-indigo-500 font-bold">
                                                        {manga.status || 'Berjalan'}
                                                    </span>
                                                    <span>{manga.type || 'Manga'}</span>
                                                    <span>⭐ {getRating(manga)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}




                    {/* Anime Ongoing */}
                    {ongoingAnimeItems.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-fuchsia-500 via-cyan-400 to-amber-300 rounded-full"></div>

                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        Anime <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-300">Ongoing</span>
                                        <Clock className="w-5 h-5 text-fuchsia-500" />
                                    </h2>
                                </div>

                                <Link
                                    href="/explore?status=ongoing"
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors"
                                >
                                    Lihat Semua <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {ongoingAnimeItems.map((anime, idx) => {
                                    const rating = getRating(anime);
                                    const type = anime.type || anime.format || 'TV';
                                    const typeBg = getAnimeTypeBg(type);

                                    return (
                                        <Link
                                            key={`ongoing-anime-${anime.id || anime.slug || idx}`}
                                            href={`/anime/${anime.slug}`}
                                            className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/5"
                                        >
                                            <div className="aspect-[3/4.3] relative overflow-hidden">
                                                <img
                                                    src={getPoster(anime.poster || anime.cover || anime.thumbnail)}
                                                    alt={anime.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />

                                                <div className="absolute top-2 right-2">
                                                    <div className="w-7 h-7 flex items-center justify-center text-xs font-bold rounded bg-black/60 text-white">
                                                        {idx + 1}
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 left-2">
                                                    <span className={`${typeBg} text-white text-[9px] px-2 py-0.5 rounded font-bold`}>
                                                        {type}
                                                    </span>
                                                </div>

                                                <div className="absolute top-10 left-2">
                                                    <span className="px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold rounded">
                                                        ONGOING
                                                    </span>
                                                </div>

                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                    <h3 className="text-white text-xs font-bold line-clamp-2">
                                                        {anime.title}
                                                    </h3>

                                                    <div className="flex items-center justify-between mt-1 gap-2">
                                                        <span className="text-[10px] text-white/80 line-clamp-1">
                                                            {getAnimeEpisode(anime)}
                                                        </span>

                                                        <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 shrink-0">
                                                            ⭐ {rating}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}


                    {/* Update Anime Terbaru */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock className="text-fuchsia-500 w-6 h-6" />
                                Update Anime Terbaru
                            </h2>

                            <Link
                                href="/explore?sort=latest_update"
                                className="text-sm text-slate-500 dark:text-slate-400 hover:text-fuchsia-500 flex items-center gap-1 transition-colors"
                            >
                                Lihat Semua <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
                            {latestUpdates.map((anime) => (
                                <LatestUpdateCard key={`latest-${anime.id}`} anime={anime} />
                            ))}
                        </div>
                    </section>



                    {/* Manga Pilihan */}
                    <MangaHeroSlider items={trendingManga} />

                    {/* Banner Discord */}
                    <DiscordBanner
                        url={siteSettings?.discord_url}
                        title={siteSettings?.discord_title}
                        description={siteSettings?.discord_description}
                        enabled={siteSettings?.discord_enabled}
                    />

                    <AdSlot code={ads?.home_bottom} />
                </div>
            </div>
        </AppLayout>
    );
}