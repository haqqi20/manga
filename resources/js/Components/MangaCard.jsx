import React from 'react';
import { Link } from '@inertiajs/react';
import { Star, BookOpen } from 'lucide-react';

export default function MangaCard({ manga }) {
    if (!manga) return null;

    const formatChapter = (num) => {
        if (!num) return '0';
        const parsed = parseFloat(num);
        return isNaN(parsed) ? '0' : parsed.toString();
    };

    const posterUrl = manga.poster
        ? (manga.poster.startsWith('http') ? manga.poster : `/storage/${manga.poster}`)
        : '';

    const latestChapter = manga.last_chapter_number ||
        manga.last_chapter?.chapter_number ||
        manga.lastChapter?.chapter_number ||
        manga.latestChapter?.chapter_number ||
        manga.latest_chapter?.chapter_number ||
        (manga.chapters?.[0]?.chapter_number) ||
        manga.chapters_count ||
        '0';

    const isOngoing = (manga.status || '').toLowerCase().includes('ongoing');

    return (
        <article className="group relative h-full rounded-[1.4rem] bg-white/75 dark:bg-slate-950/70 border border-white/80 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-cyan-900/10 overflow-hidden transition-all duration-300">
            <div className="relative aspect-[3/4.25] overflow-hidden bg-slate-200 dark:bg-slate-800">
                <Link href={manga.slug ? `/manga/${manga.slug}` : '#'} className="block h-full">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={manga.title || 'Manga'}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                    )}
                </Link>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/10"></div>

                <div className="absolute left-2 top-2 flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/95 px-2 py-1 text-[9px] font-black text-white shadow">
                        <BookOpen className="h-3 w-3" /> {manga.type || 'MANGA'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur px-2 py-1 text-[9px] font-black text-amber-300 ring-1 ring-white/10">
                        <Star size={10} className="fill-amber-300" /> {Number(manga.rating || 0).toFixed(1)}
                    </span>
                </div>

                <div className="absolute inset-x-3 bottom-3">
                    <div className="rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur px-3 py-2 text-center text-[11px] font-black text-slate-900 dark:text-white shadow-lg">
                        Chapter {formatChapter(latestChapter)}
                    </div>
                </div>
            </div>

            <div className="p-3 flex flex-col flex-1 gap-2">
                <Link href={manga.slug ? `/manga/${manga.slug}` : '#'}>
                    <h3 className="font-black text-slate-900 dark:text-white text-[12px] md:text-[13px] line-clamp-2 leading-snug hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                        {manga.title || 'Untitled'}
                    </h3>
                </Link>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {manga.status || 'Ongoing'}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${isOngoing ? 'bg-cyan-400' : 'bg-emerald-400'} shadow-[0_0_12px_currentColor]`}></span>
                </div>
            </div>
        </article>
    );
}
