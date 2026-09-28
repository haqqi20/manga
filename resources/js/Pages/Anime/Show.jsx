import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import UserAvatar from '@/Components/UserAvatar';
import { Play, Star, Calendar, Film, Tv, Heart, Clock, ChevronDown, ChevronUp, Info, Users, UserCheck, Building2, Signal, Clapperboard, Search, ArrowUpDown, ChevronLeft, ChevronRight, MessageSquareReply } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import AdSlot from '@/Components/AdSlot';

function extractYoutubeId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}


export default function Show({ anime, isBookmarked = false, comments = [], auth }) {
    const { ads } = usePage().props;
    const [synopsisExpanded, setSynopsisExpanded] = useState(false);
    const [genresExpanded, setGenresExpanded] = useState(false);
    const [epSort, setEpSort] = useState('asc');   // 'asc' | 'desc'
    const [epSearch, setEpSearch] = useState('');
    const [epPage, setEpPage] = useState(1);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const EPISODES_PER_PAGE = 21;
    const youtubeId = useMemo(() => extractYoutubeId(anime.trailer_url), [anime.trailer_url]);

    const MAX_VISIBLE_GENRES = 4;
    const visibleGenres = anime.genres?.slice(0, MAX_VISIBLE_GENRES) || [];
    const hiddenGenresCount = (anime.genres?.length || 0) - MAX_VISIBLE_GENRES;

    // Sort + filter episodes
    const sortedEpisodes = useMemo(() => {
        if (!anime.episodes) return [];
        return [...anime.episodes].sort((a, b) => a.number - b.number);
    }, [anime.episodes]);

    const filteredEpisodes = useMemo(() => {
        let eps = [...sortedEpisodes];
        if (epSearch.trim()) {
            const q = epSearch.trim().toLowerCase();
            eps = eps.filter(ep =>
                String(ep.number).includes(q) ||
                (ep.title || '').toLowerCase().includes(q)
            );
        }
        if (epSort === 'desc') eps = eps.slice().reverse();
        return eps;
    }, [sortedEpisodes, epSort, epSearch]);

    // Pagination logic
    const totalPages = Math.ceil(filteredEpisodes.length / EPISODES_PER_PAGE);
    const pagedEpisodes = useMemo(() => {
        const start = (epPage - 1) * EPISODES_PER_PAGE;
        return filteredEpisodes.slice(start, start + EPISODES_PER_PAGE);
    }, [filteredEpisodes, epPage]);

    // Reset to page 1 if search or sort changes
    useEffect(() => { setEpPage(1); }, [epSearch, epSort]);

    // First episode for "Watch Now"
    const firstEpisode = sortedEpisodes.length > 0 ? sortedEpisodes[0] : null;

    const statusColor = anime.status === 'Completed' ? 'text-blue-600 bg-blue-100/80 border-blue-200'
        : anime.status === 'Ongoing' ? 'text-emerald-600 bg-emerald-100/80 border-emerald-200'
            : 'text-yellow-600 bg-yellow-100/80 border-yellow-200';

    // --- Handlers ---
    const handleBookmark = () => {
        if (!auth?.user) {
            // redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }

        router.post(`/anime/${anime.id}/bookmark`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // optionally redirect to library, or stay on page
            }
        });
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        if (!commentText.trim()) return;

        router.post(`/anime/${anime.id}/comment`, { content: commentText }, {
            preserveScroll: true,
            onSuccess: () => setCommentText('')
        });
    };

    const handleReplySubmit = (e, parentId) => {
        e.preventDefault();
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        if (!replyText.trim()) return;

        router.post(`/anime/${anime.id}/comment`, { content: replyText, parent_id: parentId }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyText('');
                setReplyingTo(null);
            }
        });
    };

    const handleCommentDelete = (commentId) => {
        if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
            router.delete(`/comments/${commentId}`, {
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout>
            <Head title={anime.title} />

            {/* ======================== HERO SECTION ======================== */}
            <div className="relative h-[60vh] sm:h-[65vh] md:h-[75vh] lg:h-[80vh] max-h-[700px] overflow-hidden -mt-16">

                {/* Desktop: YouTube Trailer Background */}
                {youtubeId && (
                    <div className="hidden md:block absolute inset-0">
                        <div className="absolute inset-0 overflow-hidden bg-black">
                            <div className="absolute inset-0">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&iv_load_policy=3&enablejsapi=1`}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                    allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                                    title="YouTube Trailer"
                                    style={{
                                        minWidth: '100%',
                                        minHeight: '100%',
                                        width: '177.78vh',
                                        height: '56.25vw',
                                        filter: 'brightness(0.85)',
                                        border: 'none',
                                        pointerEvents: 'none',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop fallback if no trailer: poster image */}
                {!youtubeId && (
                    <div className="hidden md:block absolute inset-0">
                        {anime.poster ? (
                            <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-900" />
                        )}
                    </div>
                )}

                {/* Mobile: Poster Image Background */}
                <div className="md:hidden absolute inset-0">
                    {anime.poster ? (
                        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-900" />
                    )}
                </div>

                {/* Gradient Overlays — white in light mode, black in dark mode */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-black/90 dark:via-black/45 dark:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-black/80 dark:via-black/30 dark:to-transparent" />
                {/* Blend edge into page background */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />

                {/* Hero Content */}
                <div className="absolute inset-0 z-10 flex items-end pb-8 md:pb-12 lg:pb-16">
                    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 items-start md:items-end">

                            {/* Floating Poster (Desktop) */}
                            <div className="hidden md:block flex-shrink-0">
                                <div className="w-[180px] lg:w-[220px] xl:w-[240px] rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-2xl shadow-black/20">
                                    <div className="relative aspect-[2/3]">
                                        {anime.poster ? (
                                            <img
                                                src={anime.poster}
                                                alt={anime.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">No Image</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 space-y-4">
                                {/* Title */}
                                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold drop-shadow-lg text-slate-900 dark:text-white leading-tight break-words">
                                    {anime.title}
                                </h1>

                                {/* Info Badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Rating */}
                                    {anime.rating && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium text-slate-800 dark:text-white">{anime.rating}</span>
                                        </div>
                                    )}

                                    {/* Year */}
                                    {anime.release_year && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-white/70" />
                                            <span className="text-sm text-slate-700 dark:text-white/90">{anime.release_year}</span>
                                        </div>
                                    )}

                                    {/* Type */}
                                    {anime.type && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-sm">
                                            <Tv className="w-3.5 h-3.5 text-slate-500 dark:text-white/70" />
                                            <span className="text-sm text-slate-700 dark:text-white/90">{anime.type}</span>
                                        </div>
                                    )}

                                    {/* Episode Count */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/70 border border-blue-400/30 backdrop-blur-sm shadow-sm">
                                        <Film className="w-3.5 h-3.5 text-white" />
                                        <span className="text-sm font-medium text-white">{anime.episodes_count || sortedEpisodes.length || '?'} eps</span>
                                    </div>
                                </div>

                                {/* Genre Tags */}
                                {anime.genres && anime.genres.length > 0 && (
                                    <div className="pt-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {(genresExpanded ? anime.genres : visibleGenres).map((g, i) => {
                                                const colors = [
                                                    'bg-rose-100 text-rose-700 border-rose-200',
                                                    'bg-blue-100 text-blue-700 border-blue-200',
                                                    'bg-emerald-100 text-emerald-700 border-emerald-200',
                                                    'bg-violet-100 text-violet-700 border-violet-200',
                                                    'bg-amber-100 text-amber-700 border-amber-200',
                                                    'bg-teal-100 text-teal-700 border-teal-200',
                                                    'bg-pink-100 text-pink-700 border-pink-200',
                                                    'bg-indigo-100 text-indigo-700 border-indigo-200',
                                                    'bg-orange-100 text-orange-700 border-orange-200',
                                                    'bg-cyan-100 text-cyan-700 border-cyan-200',
                                                    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
                                                    'bg-lime-100 text-lime-700 border-lime-200',
                                                    'bg-sky-100 text-sky-700 border-sky-200',
                                                    'bg-red-100 text-red-700 border-red-200',
                                                    'bg-purple-100 text-purple-700 border-purple-200',
                                                ];
                                                return (
                                                    <span
                                                        key={g.id}
                                                        className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-semibold shadow-sm ${colors[i % colors.length]}`}
                                                    >
                                                        {g.name}
                                                    </span>
                                                );
                                            })}
                                            {hiddenGenresCount > 0 && !genresExpanded && (
                                                <button
                                                    onClick={() => setGenresExpanded(true)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-black/60 text-xs sm:text-sm font-medium transition-all shadow-sm"
                                                >
                                                    <span>+{hiddenGenresCount}</span>
                                                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </button>
                                            )}
                                            {genresExpanded && hiddenGenresCount > 0 && (
                                                <button
                                                    onClick={() => setGenresExpanded(false)}
                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-black/60 text-xs sm:text-sm font-medium transition-all shadow-sm"
                                                >
                                                    <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Synopsis */}
                                <div className="hidden md:block max-w-2xl">
                                    <div className="max-w-3xl">
                                        <div
                                            className={`text-slate-700 dark:text-white/75 text-sm sm:text-base leading-relaxed ${!synopsisExpanded ? 'line-clamp-2' : ''}`}
                                        >
                                            {anime.synopsis || 'No synopsis available.'}
                                        </div>
                                        {anime.synopsis && anime.synopsis.length > 150 && (
                                            <button
                                                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                                                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                            >
                                                {synopsisExpanded ? 'Read less' : 'Read more'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-2">
                                    {firstEpisode ? (
                                        <Link
                                            href={`/anime/${anime.slug}/episode/${firstEpisode.number}`}
                                            className="group flex items-center gap-2.5 bg-[#E50914] hover:bg-[#f40612] text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/25"
                                        >
                                            <Play className="w-5 h-5 fill-white" />
                                            <span>Watch Now</span>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-2.5 bg-gray-600 text-white/70 px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-semibold text-sm md:text-base cursor-not-allowed">
                                            <Play className="w-5 h-5" />
                                            <span>No Episodes</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleBookmark}
                                        className={`flex items-center justify-center px-4 sm:px-5 py-3 md:py-3.5 rounded-xl font-bold text-xs sm:text-sm md:text-base border transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
                                            isBookmarked
                                            ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:border-rose-600'
                                            : 'border-slate-300 dark:border-white/20 text-slate-700 dark:text-white bg-white/75 dark:bg-black/35 backdrop-blur-md hover:bg-white/95 dark:hover:bg-black/50'
                                        }`}
                                        aria-label="Toggle favorite"
                                    >
                                        <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================== CONTENT BELOW HERO ======================== */}
            <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14">

                    <AdSlot code={ads?.anime_detail_top} className="mb-8" />

                    {/* Mobile Synopsis */}
                    <div className="md:hidden mb-10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Info className="w-5 h-5 text-slate-400" /> Synopsis
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {anime.synopsis || 'No synopsis available.'}
                        </p>
                    </div>

                    {/* Anime Details Grid */}
                    {(anime.studio || anime.type || anime.status) && (
                        <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {anime.studio && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-rose-50 shrink-0">
                                        <Building2 className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Studio</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{anime.studio}</p>
                                    </div>
                                </div>
                            )}
                            {anime.type && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                                        <Film className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Format</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{anime.type}</p>
                                    </div>
                                </div>
                            )}
                            {anime.status && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-50 shrink-0">
                                        <Signal className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Status</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{anime.status}</p>
                                    </div>
                                </div>
                            )}
                            {anime.release_year && (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-violet-50 shrink-0">
                                        <Calendar className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Released</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{anime.release_year}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Characters */}
                    {anime.characters && anime.characters.length > 0 && (
                        <div className="mb-10">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-1.5 rounded-lg bg-blue-50">
                                        <Users className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Main Characters</h3>
                                </div>
                                <div className="relative">
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {anime.characters.map(char => (
                                            <Link key={char.id} href={`/character/${char.id}/${char.slug || ''}`} className="group cursor-pointer flex-shrink-0 w-[100px] sm:w-[110px]">
                                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2 shadow-sm">
                                                    {char.image_url ? (
                                                        <img
                                                            src={char.image_url}
                                                            alt={char.name}
                                                            loading="lazy"
                                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                            <Users className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    {/* Role badge */}
                                                    {char.role && (
                                                        <div className="absolute top-1.5 right-1.5">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold backdrop-blur-sm ${char.role === 'Main'
                                                                ? 'bg-blue-500/90 text-white'
                                                                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                                                }`}>
                                                                {char.role}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-center text-slate-600 dark:text-slate-300 line-clamp-2 transition-colors duration-200 group-hover:text-blue-600 font-medium">
                                                    {char.name}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Production Staff */}
                    {anime.staff && anime.staff.length > 0 && (
                        <div className="mb-10">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-1.5 rounded-lg bg-purple-50">
                                        <UserCheck className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Production Staff</h3>
                                </div>
                                <div className="relative">
                                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {anime.staff.map(member => (
                                            <div key={member.id} className="group cursor-pointer flex-shrink-0 w-[120px] sm:w-[135px]">
                                                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-150 hover:bg-blue-50 hover:border-blue-200 transition-all h-[160px] sm:h-[180px]">
                                                    {member.image_url ? (
                                                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 mb-2 ring-2 ring-slate-200">
                                                            <img
                                                                src={member.image_url}
                                                                alt={member.name}
                                                                loading="lazy"
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mb-2 ring-2 ring-slate-200">
                                                            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0 w-full text-center flex flex-col justify-center">
                                                        <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                                                            {member.position}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Episode List Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        {/* Title */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 shadow-md shadow-blue-600/30">
                                <Film className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight">Daftar Episode</h2>
                                <p className="text-xs text-slate-400 font-medium">{sortedEpisodes.length} episode tersedia</p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-[260px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                                <input
                                    type="text"
                                    value={epSearch}
                                    onChange={e => setEpSearch(e.target.value)}
                                    placeholder="Cari judul / nomor ep…"
                                    className="w-full h-10 pl-10 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium shadow-sm outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
                                />
                                {epSearch && (
                                    <button
                                        onClick={() => setEpSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                                    >
                                        <span className="text-[11px] font-bold leading-none">✕</span>
                                    </button>
                                )}
                            </div>

                            {/* Sort toggle */}
                            <button
                                onClick={() => setEpSort(v => v === 'asc' ? 'desc' : 'asc')}
                                title={epSort === 'asc' ? 'Tampilkan Terbaru Dulu' : 'Tampilkan Terlama Dulu'}
                                className={`flex items-center gap-2 h-10 px-3.5 rounded-xl border font-semibold text-xs transition-all duration-200 shrink-0 ${
                                    epSort === 'desc'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25 hover:bg-blue-700'
                                        : 'bg-slate-100 dark:bg-slate-800/80 border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:text-white'
                                }`}
                            >
                                <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-300 ${epSort === 'desc' ? 'rotate-180' : ''}`} />
                                <span className="hidden sm:inline">{epSort === 'asc' ? 'Terlama' : 'Terbaru'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Episode Grid with Pagination */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pagedEpisodes.map(ep => (
                            <Link
                                key={ep.id}
                                href={`/anime/${anime.slug}/episode/${ep.number}`}
                                className="group flex items-center p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all duration-200 shadow-sm"
                            >
                                <div className="w-14 h-11 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 text-slate-400 transition-all duration-200 flex-shrink-0">
                                    <Play className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors text-sm truncate">
                                        Episode {ep.number}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ep.title || `Episode ${ep.number}`}</p>
                                </div>
                                {ep.duration && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 ml-3 flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        <span>{ep.duration}</span>
                                    </div>
                                )}
                            </Link>
                        ))}
                        {pagedEpisodes.length === 0 && (
                            <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Film className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                {epSearch
                                    ? <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada episode yang cocok dengan "{epSearch}"</p>
                                    : <p className="text-slate-500 dark:text-slate-400 font-medium">No episodes available yet</p>
                                }
                                <p className="text-slate-400 text-sm mt-1">{epSearch ? '' : 'Check back later for updates'}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 select-none">
                            <button
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setEpPage(p => Math.max(1, p - 1))}
                                disabled={epPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Sebelumnya</span>
                            </button>
                            {/* Page numbers, show first, last, and window around current */}
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const page = i + 1;
                                // Show first, last, current, and window of 2 around current
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - epPage) <= 2
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${epPage === page ? 'bg-blue-600 border-blue-600 text-white shadow' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50'}`}
                                            onClick={() => setEpPage(page)}
                                            disabled={epPage === page}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                // Ellipsis for skipped pages
                                if (
                                    (page === epPage - 3 && page > 1) ||
                                    (page === epPage + 3 && page < totalPages)
                                ) {
                                    return <span key={page} className="px-2 text-slate-400">…</span>;
                                }
                                return null;
                            })}
                            <button
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setEpPage(p => Math.min(totalPages, p + 1))}
                                disabled={epPage === totalPages}
                            >
                                <span>Berikutnya</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div className="mt-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-xl rounded-[32px] p-6 md:p-10">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 uppercase tracking-wider">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        Komentar ({comments?.length || 0})
                    </h3>

                    {/* Comment Form */}
                    <div className="mb-8">
                        {auth?.user ? (
                            <form onSubmit={handleCommentSubmit} className="flex gap-4">
                                <UserAvatar user={auth.user} sizeClass="w-12 h-12" showBadge={false} />
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Tambahkan komentar..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 transition-all resize-none"
                                        rows="3"
                                    ></textarea>
                                    <div className="mt-2 text-right">
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50"
                                        >
                                            Kirim
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Silakan login untuk menambahkan komentar.</p>
                                <Link href="/login" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all">
                                    Login Sekarang
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {comments?.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="group bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                                    <div className="flex gap-4">
                                        <UserAvatar user={comment.user} sizeClass="w-10 h-10" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{comment.user.name}</h4>
                                                <span className="text-xs text-slate-400 shrink-0">
                                                    {new Date(comment.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap mb-2">{comment.content}</p>

                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                        setReplyText('');
                                                    }}
                                                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                >
                                                    <MessageSquareReply className="w-3.5 h-3.5" />
                                                    Balas
                                                </button>

                                                {(auth?.user?.id === comment.user_id || auth?.user?.is_admin) && (
                                                    <button
                                                        onClick={() => handleCommentDelete(comment.id)}
                                                        className="text-red-500 hover:text-red-700 transition-opacity"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            {replyingTo === comment.id && (
                                                <div className="mt-4 flex gap-3">
                                                    <UserAvatar user={auth?.user} sizeClass="w-8 h-8" showBadge={false} />
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={`Membalas ${comment.user.name}...`}
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                            rows="2"
                                                        ></textarea>
                                                        <div className="mt-2 flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 font-medium"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleReplySubmit(e, comment.id)}
                                                                disabled={!replyText.trim()}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
                                                            >
                                                                Kirim Balasan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Replies List */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 ml-14 space-y-4">
                                            {comment.replies.map(reply => (
                                                <div key={reply.id} className="flex gap-4">
                                                    <UserAvatar user={reply.user} sizeClass="w-8 h-8" showBadge={false} />
                                                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{reply.user.name}</h4>
                                                                <span className="text-xs text-slate-400 shrink-0">
                                                                    {new Date(reply.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            {(auth?.user?.id === reply.user_id || auth?.user?.is_admin) && (
                                                                <button
                                                                    onClick={() => handleCommentDelete(reply.id)}
                                                                    className="text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                Belum ada komentar. Jadilah yang pertama berkomentar!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
