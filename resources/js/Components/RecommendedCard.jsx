import { Link } from '@inertiajs/react';
import { Star, TrendingUp, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function RecommendedCard({ anime }) {
    if (!anime) return null;

    // 🔥 Amanin rating
    const safeRating = useMemo(() => {
        const r = parseFloat(anime.rating);
        return isNaN(r) ? 0 : r;
    }, [anime.rating]);

    // 🔥 Match score aman
    const matchScore = useMemo(() => {
        return safeRating ? Math.floor(safeRating * 10) : 85;
    }, [safeRating]);

    const scoreColor = useMemo(() => {
        if (matchScore >= 95) return "bg-purple-500 from-purple-500 to-indigo-500";
        if (matchScore >= 90) return "bg-blue-500 from-blue-500 to-cyan-500";
        return "bg-emerald-500 from-emerald-500 to-emerald-400";
    }, [matchScore]);

    const taglines = useMemo(() => ([
        { icon: <TrendingUp className="w-3 h-3 shrink-0" />, text: "Trending right now" },
        { icon: <Star className="w-3 h-3 shrink-0" />, text: "Highly rated by community" },
        { icon: <Sparkles className="w-3 h-3 shrink-0" />, text: "Editor's Pick" },
        { icon: <AlertCircle className="w-3 h-3 shrink-0" />, text: "Don't miss this one" }
    ]), []);

    const tagline = taglines[(anime.id || 0) % taglines.length];

    // 🔥 Poster aman
    const posterUrl = anime.poster
        ? (anime.poster.startsWith('http') ? anime.poster : `/storage/${anime.poster}`)
        : 'https://placehold.co/200x300/1e293b/475569';

    return (
        <Link
            href={anime.slug ? `/anime/${anime.slug}` : '#'}
            className="group relative flex-shrink-0 w-[140px] h-[210px] md:w-[190px] md:h-[285px] snap-start rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block touch-manipulation"
        >
            <img
                src={posterUrl}
                alt={anime.title || 'Anime'}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x300/1e293b/475569'; }}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />

            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent pointer-events-none opacity-90"></div>

            {/* Score */}
            <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10">
                <div className={`px-2 py-0.5 rounded-md bg-gradient-to-br ${scoreColor} text-white font-black text-[9px] uppercase flex items-center gap-1`}>
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    {matchScore}%
                </div>
            </div>

            {/* Rating */}
            <div className="absolute top-2 right-2 z-10">
                <div className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur text-yellow-400 font-bold text-[10px] flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {safeRating ? safeRating.toFixed(1) : 'N/A'}
                </div>
            </div>

            {/* Play */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-purple-600/80 rounded-full p-3 text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200">
                    <PlayCircle className="w-6 h-6" strokeWidth={2.5} />
                </div>
            </div>

            {/* Bottom */}
            <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end z-20">
                <h3 className="text-white font-black text-xs md:text-sm line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">
                    {anime.title || 'Untitled'}
                </h3>

                <div className="flex items-center text-[9px] text-purple-400">
                    {tagline.icon}
                    <span className="ml-1 truncate uppercase text-[8px]">
                        {tagline.text}
                    </span>
                </div>
            </div>
        </Link>
    );
}