import { Link } from '@inertiajs/react';
import { Clock, Star, Eye, List, PlayCircle } from 'lucide-react';

export default function LatestUpdateCard({ anime }) {
    const status = anime.status || 'Ongoing';
    const eps = anime.episodes || [];
    const isOngoing = status.toLowerCase() === 'ongoing';

    return (
        <article className="group relative h-full overflow-hidden rounded-[1.6rem] border border-white/80 dark:border-white/10 bg-white/75 dark:bg-slate-950/70 backdrop-blur shadow-sm hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-cyan-400/20 blur-2xl"></div>
            <div className="flex gap-3 items-start flex-1 p-3 md:p-4 relative">
                <Link href={`/anime/${anime.slug}`} className="shrink-0">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 w-[72px] h-[104px] md:w-[86px] md:h-[124px] shadow-md">
                        <img
                            src={anime.poster || 'https://placehold.co/200x300?text=No+Image'}
                            alt={anime.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>
                    </div>
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                    <Link
                        href={`/anime/${anime.slug}`}
                        className="font-black text-[13px] md:text-base leading-tight text-slate-900 dark:text-white hover:text-fuchsia-600 dark:hover:text-fuchsia-300 transition mb-2"
                        title={anime.title}
                    >
                        <span className="line-clamp-2">{anime.title}</span>
                    </Link>

                    <div className="mb-2 h-px bg-gradient-to-r from-fuchsia-300/60 via-cyan-300/40 to-transparent dark:from-fuchsia-500/30 dark:via-cyan-500/20"></div>

                    <ul className="space-y-1.5">
                        {eps.slice(0, 2).map((ep) => (
                            <li key={ep.id}>
                                <Link
                                    href={`/anime/${anime.slug}/episode/${ep.number}`}
                                    className="group/ep flex items-center gap-2 rounded-full bg-slate-100/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 px-2.5 py-1.5 transition-colors"
                                >
                                    <PlayCircle className="h-3.5 w-3.5 text-fuchsia-500 shrink-0" />
                                    <span className="min-w-0 flex-1 truncate text-[11px] md:text-xs font-bold text-slate-700 dark:text-slate-200 group-hover/ep:text-fuchsia-600">
                                        Episode {ep.number}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                                        {new Date(ep.release_date || ep.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </Link>
                            </li>
                        ))}
                        {eps.length === 0 && (
                            <li className="text-xs text-slate-500 dark:text-slate-400 italic rounded-2xl bg-slate-100/80 dark:bg-white/5 p-2">Belum ada episode</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-5 items-center px-2 py-2.5 bg-slate-50/75 dark:bg-white/[0.03] text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 shrink-0 border-t border-white/80 dark:border-white/10">
                <div className="flex justify-center">
                    <span className={`font-black ${isOngoing ? 'text-fuchsia-600 dark:text-fuchsia-300' : 'text-emerald-600 dark:text-emerald-300'}`}>{status}</span>
                </div>
                <div className="flex items-center justify-center gap-1" title="Latest Episode"><List className="w-3.5 h-3.5 opacity-70" /><span>{eps.length > 0 ? eps[0].number : 0} Eps</span></div>
                <div className="flex items-center justify-center gap-1" title="Views"><Eye className="w-3.5 h-3.5 opacity-70" /><span className="truncate">{anime.views_count != null ? new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(anime.views_count) : '0'}</span></div>
                <div className="flex items-center justify-center gap-1" title="Rating"><Star className="w-3.5 h-3.5 opacity-70" /><span className="font-bold text-slate-700 dark:text-slate-200">{anime.rating || '-'}</span></div>
                <div className="flex items-center justify-center gap-1" title="Duration"><Clock className="w-3.5 h-3.5 opacity-70" /><span>{eps.length > 0 && eps[0].duration ? `${eps[0].duration}m` : '?'}</span></div>
            </div>
        </article>
    );
}
