import { Link } from '@inertiajs/react';
import { Eye, Clock, Sparkles } from 'lucide-react';

function relativeTime(dateStr) {
    if (!dateStr) return null;
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} bln lalu`;
    return `${Math.floor(diff / 31536000)} thn lalu`;
}

export default function AnimeCard({ anime, isDarkTheme = false, showLastUpdate = false }) {
    let epText = '';
    let title = anime.title;

    if (title && title.includes(' - Ep ')) {
        const parts = title.split(' - Ep ');
        epText = `Episode ${parts[1]}`;
        title = parts[0];
    } else if (anime.episodes) {
        epText = `Episode ${anime.episodes}`;
    }

    const statusStr = (anime.status || '').toLowerCase();
    const typeStr = (anime.type || '').toLowerCase();
    const typeBadge = typeStr === 'movie' || statusStr === 'movie'
        ? 'Movie'
        : statusStr.includes('complete') || statusStr.includes('tamat')
            ? 'Tamat'
            : 'Ongoing';
    const tone = typeBadge === 'Movie' ? 'from-rose-500 to-orange-400' : typeBadge === 'Tamat' ? 'from-emerald-500 to-cyan-400' : 'from-fuchsia-500 to-indigo-500';
    const isHot = Number(anime.rating || 0) > 8.5;

    return (
        <article className="group relative h-full rounded-[1.35rem] p-[1px] bg-gradient-to-br from-white/80 via-white/30 to-slate-200/80 dark:from-white/15 dark:via-white/5 dark:to-transparent shadow-sm hover:shadow-2xl hover:shadow-fuchsia-900/10 transition-all duration-300">
            <div className="relative h-full rounded-[1.3rem] overflow-hidden bg-white/80 dark:bg-slate-950/70 backdrop-blur flex flex-col border border-white/70 dark:border-white/10">
                <Link href={`/anime/${anime.slug}`} className="relative block aspect-[3/4] overflow-hidden rounded-b-[1.4rem] bg-slate-200 dark:bg-slate-800">
                    {anime.poster ? (
                        <img
                            src={anime.poster}
                            alt={title}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-semibold">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent opacity-85"></div>

                    <div className={`absolute left-2 top-2 rounded-full bg-gradient-to-r ${tone} px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg`}>
                        {typeBadge}
                    </div>

                    {anime.rating && (
                        <div className="absolute right-2 top-2 rounded-full bg-black/55 backdrop-blur px-2 py-1 text-[10px] font-black text-amber-300 ring-1 ring-white/15">
                            ★ {anime.rating}
                        </div>
                    )}

                    {isHot && (
                        <div className="absolute left-2 bottom-12 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-rose-600 shadow">
                            <Sparkles className="h-3 w-3" /> HOT
                        </div>
                    )}

                    {epText && (
                        <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur px-3 py-2 text-center text-[11px] font-black text-slate-900 dark:text-white shadow-lg truncate">
                            {epText}
                        </div>
                    )}
                </Link>

                <div className="flex flex-1 flex-col p-3">
                    <h3 className={`line-clamp-2 text-[13px] md:text-[14px] font-black leading-snug ${isDarkTheme ? 'text-white' : 'text-slate-900 dark:text-white'}`} title={title}>
                        <Link href={`/anime/${anime.slug}`} className="hover:text-fuchsia-600 dark:hover:text-fuchsia-300 transition-colors">
                            {title}
                        </Link>
                    </h3>

                    <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        {showLastUpdate && anime.latest_episode_at ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 px-2 py-1 font-semibold">
                                <Clock className="h-3 w-3" /> {relativeTime(anime.latest_episode_at)}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 px-2 py-1 font-semibold">
                                <Eye className="h-3 w-3" /> {anime.views_count != null ? new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(anime.views_count) : '0'}
                            </span>
                        )}
                        <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${tone}`}></span>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block absolute z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 w-[290px] rounded-3xl p-4 shadow-2xl top-1/2 -translate-y-1/2 left-[104%] ml-2 pointer-events-none border border-white/70 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
                <div className={`mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${tone}`}></div>
                <h4 className="font-black text-sm mb-2 text-slate-900 dark:text-white">{title}</h4>
                <p className="text-xs line-clamp-4 text-slate-500 dark:text-slate-400 leading-relaxed">{anime.synopsis || 'Sinopsis belum tersedia.'}</p>
            </div>
        </article>
    );
}
