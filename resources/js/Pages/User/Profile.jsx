import { useState, useCallback } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AvatarFrame from '@/Components/AvatarFrame';
import {
    Bookmark, Clock, Edit, Star, Lock,
    Calendar, Play, UserPlus, UserCheck,
    MessageSquare, Heart, Settings, Film,
    ChevronLeft, ChevronRight, Share2, Copy, Check, X, BookOpen,
} from 'lucide-react';

const PER_PAGE = 10;

function Pagination({ page, total, onChange }) {
    const pages = Math.ceil(total / PER_PAGE);
    if (pages <= 1) return null;
    return (
        <div className="flex items-center justify-center gap-1.5 mt-8">
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button
                    key={p}
                    onClick={() => onChange(p)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        p === page
                            ? 'bg-primary text-white shadow-sm shadow-primary/30'
                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === pages}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

/* ─── constants ─────────────────────────────────────────────── */
const BADGE_CONFIG = {
    vip:       { label: 'VIP', grad: 'from-amber-400 to-yellow-500', bg: 'bg-gradient-to-r from-amber-400 to-yellow-500' },
    premium:   { label: 'PRO', grad: 'from-blue-500 to-indigo-600',  bg: 'bg-gradient-to-r from-blue-500 to-indigo-600'  },
    developer: { label: 'DEV', grad: 'from-emerald-500 to-teal-500', bg: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
};

const TYPE_BADGE = {
    movie: { label: 'MOVIE', cls: 'bg-purple-600' },
    ova:   { label: 'OVA',   cls: 'bg-orange-500' },
    ona:   { label: 'ONA',   cls: 'bg-sky-500'    },
    music: { label: 'MUSIC', cls: 'bg-pink-500'   },
    tv:    { label: 'TV',    cls: 'bg-indigo-600'  },
};

/* ─── sub-components ─────────────────────────────────────────── */
function PosterCard({ anime, lastEpisode, lastChapter, itemType = 'anime' }) {
    const siteSlug = usePage().props.siteSettings?.site_slug || 'anime';
    const isManga = itemType === 'manga' || anime.item_type === 'manga';
    
    const tb = TYPE_BADGE[(anime.type || '').toLowerCase()] || TYPE_BADGE.tv;
    const poster = anime.poster
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(anime.title || '?')}&background=ef4444&color=fff&size=300`;

    const href = isManga 
        ? `/manga/${anime.slug}${lastChapter ? '/chapter/' + lastChapter : ''}` 
        : `/${siteSlug}/${anime.slug}${lastEpisode ? '/episode/' + lastEpisode : ''}`;

    const typeCls = isManga 
        ? (anime.type === 'Manhwa' ? 'bg-rose-600' : (anime.type === 'Manhua' ? 'bg-emerald-600' : 'bg-sky-600'))
        : tb.cls;

    return (
        <Link
            href={href}
            className="group relative block rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        >
            {/* Poster */}
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={poster.startsWith('http') ? poster : `/storage/${poster}`}
                    alt={anime.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-95 group-hover:brightness-75"
                />

                {/* always-on subtle gradient at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* type badge — top left */}
                <span className={`absolute top-2 left-2 text-white text-[8px] font-black px-1.5 py-[3px] rounded-md backdrop-blur-sm bg-opacity-90 ${typeCls}`}>
                    {isManga ? (anime.type || 'MANGA').toUpperCase() : tb.label}
                </span>

                {/* rating — top right */}
                {anime.rating && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm text-yellow-400 text-[9px] font-bold px-1.5 py-[3px] rounded-md">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 flex-shrink-0" />{Number(anime.rating).toFixed(1)}
                    </span>
                )}

                {/* title + meta — always visible at bottom */}
                <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 pt-6">
                    <p className="text-[11px] sm:text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
                        {anime.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                        {anime.release_year && (
                            <span className="text-[9px] text-white/50 font-medium">{anime.release_year}</span>
                        )}
                        {(lastEpisode || lastChapter) && (
                            <span className={`flex items-center gap-0.5 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md ml-auto ${isManga ? 'bg-orange-600' : 'bg-primary/90'}`}>
                                {isManga ? <BookOpen size={8} className="fill-white" /> : <Play className="w-1.5 h-1.5 fill-white" />}
                                {isManga ? 'Ch.' : 'Eps.'}{lastEpisode || lastChapter}
                            </span>
                        )}
                    </div>
                </div>

                {/* hover play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-xl">
                        {isManga ? <BookOpen className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 fill-white text-white ml-0.5" />}
                    </div>
                </div>
            </div>
        </Link>
    );
}

function CharacterCard({ character }) {
    const ROLE_COLOR = { Main: 'bg-primary', Supporting: 'bg-amber-500' };
    const img = character.image_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=ef4444&color=fff&size=300`;

    return (
        <Link
            href={`/character/${character.id}${character.slug ? '/' + character.slug : ''}`}
            className="group relative block rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300"
        >
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={img}
                    alt={character.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-95 group-hover:brightness-75"
                />

                {/* always-on gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {/* role badge — top left */}
                <span className={`absolute top-2 left-2 text-white text-[8px] font-black px-1.5 py-[3px] rounded-md ${ROLE_COLOR[character.role] || 'bg-slate-600'}`}>
                    {character.role || 'Char'}
                </span>

                {/* name at bottom */}
                <div className="absolute bottom-0 inset-x-0 px-2.5 pb-2.5 pt-6">
                    <p className="text-[11px] sm:text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-sm">
                        {character.name}
                    </p>
                </div>

                {/* hover heart */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-xl">
                        <Heart className="w-4 h-4 fill-white text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ─── ShareModal ─────────────────────────────────────────────── */
function ShareModal({ profileUser, avatarSrc, onClose }) {
    const profileUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/u/${profileUser.username}`
        : `/u/${profileUser.username}`;

    const text = `Lihat profil anime ${profileUser.name} di sini!`;
    const [copied, setCopied] = useState(false);

    const copyLink = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const el = document.createElement('input');
            el.value = profileUrl;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [profileUrl]);

    const nativeShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: profileUser.name, text, url: profileUrl });
            } catch {
                /* user cancelled */
            }
        }
    }, [profileUrl, text, profileUser.name]);

    const platforms = [
        {
            name: 'WhatsApp',
            color: 'bg-[#25D366] hover:bg-[#1ebe5d]',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L.057 23.5a.5.5 0 0 0 .623.604l5.806-1.525A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.823 9.823 0 0 1-5.002-1.367l-.358-.213-3.715.976.992-3.624-.233-.372A9.789 9.789 0 0 1 2.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z"/>
                </svg>
            ),
            url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + profileUrl)}`,
        },
        {
            name: 'Telegram',
            color: 'bg-[#0088cc] hover:bg-[#007ab8]',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
            ),
            url: `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(text)}`,
        },
        {
            name: 'X / Twitter',
            color: 'bg-black hover:bg-slate-800',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
        },
        {
            name: 'Facebook',
            color: 'bg-[#1877f2] hover:bg-[#1569d3]',
            icon: (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
        },
    ];

    return (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" onClick={onClose}>
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <img src={avatarSrc} alt={profileUser.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700" />
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{profileUser.name}</p>
                            <p className="text-xs text-slate-400">@{profileUser.username}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* copy link */}
                <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 truncate font-medium">{profileUrl}</p>
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                            copied
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }`}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                </div>

                {/* social platforms */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Bagikan ke</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {platforms.map(p => (
                        <a
                            key={p.name}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-white transition-all active:scale-95 ${p.color}`}
                        >
                            {p.icon}
                            <span className="text-[9px] font-bold">{p.name}</span>
                        </a>
                    ))}
                </div>

                {/* native share (mobile) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                        onClick={nativeShare}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-primary to-rose-500 text-white font-bold text-sm shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        <Share2 className="w-4 h-4" />
                        Bagikan via aplikasi lain
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, message, sub }) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Icon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{message}</p>
                {sub && <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

function CommentCard({ comment }) {
    const siteSlug = usePage().props.siteSettings?.site_slug || 'anime';
    const { anime, episode, manga, chapter, content, created_at, type } = comment;

    // Build link and poster based on comment type
    let href = '#';
    let poster = null;
    let titleText = null;
    let subText = null;

    if (type === 'manga' && manga) {
        // Link ke chapter reader jika ada chapter, atau ke manga detail
        href = chapter
            ? `/manga/${manga.slug}/chapter/${chapter.number}`
            : `/manga/${manga.slug}`;
        poster = manga.poster
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(manga.title || '?')}&background=ef4444&color=fff&size=128`;
        titleText = manga.title;
        subText = chapter ? `Chapter ${chapter.number}` : null;
    } else if (anime) {
        href = episode
            ? `/${siteSlug}/${anime.slug}/episode/${episode.number}`
            : `/${siteSlug}/${anime.slug}`;
        poster = anime.poster
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(anime.title || '?')}&background=ef4444&color=fff&size=128`;
        titleText = anime.title;
        subText = episode ? `Ep. ${episode.number}` : null;
    }

    return (
        <Link
            href={href}
            className="flex gap-3.5 p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200 group"
        >
            {/* Poster thumbnail */}
            {poster ? (
                <div className="flex-shrink-0 w-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 self-start" style={{aspectRatio:'2/3'}}>
                    <img
                        src={poster.startsWith('http') ? poster : `/storage/${poster}`}
                        alt={titleText || ''}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="flex-shrink-0 w-11 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center self-start" style={{aspectRatio:'2/3'}}>
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                    {titleText ? (
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-primary group-hover:underline line-clamp-1">
                                {titleText}
                            </p>
                            {subText && (
                                <p className="text-[10px] text-slate-400 mt-0.5">{subText}</p>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs font-bold text-slate-400">Komentar</span>
                    )}
                    <time className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{created_at}</time>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{content}</p>
            </div>
        </Link>
    );
}

/* ─── main ───────────────────────────────────────────────────── */
export default function UserProfile({
    profileUser,
    bookmarks          = [],
    watchHistories     = [],
    comments           = [],
    characterFavorites = [],
    stats              = {},
    isOwner            = false,
    isFollowing: initFollowing = false,
}) {
    const [activeTab, setActiveTab]         = useState('bookmarks');
    const [following, setFollowing]         = useState(initFollowing);
    const [followers, setFollowers]         = useState(stats.followers ?? 0);
    const [followPending, setFollowPending] = useState(false);
    const [pages, setPages] = useState({ bookmarks: 1, history: 1, char_favorites: 1, comments: 1 });
    const [showShare, setShowShare]         = useState(false);

    const setPage = (tab, p) => setPages(prev => ({ ...prev, [tab]: p }));
    const switchTab = (key) => { setActiveTab(key); setPages(prev => ({ ...prev, [key]: 1 })); };

    const paginate = (arr, tab) => arr.slice((pages[tab] - 1) * PER_PAGE, pages[tab] * PER_PAGE);

    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    const coverUrl = profileUser.cover_url
        ? (profileUser.cover_url.startsWith('http') ? profileUser.cover_url : `/storage/${profileUser.cover_url}`)
        : null;
    const avatarSrc = profileUser.avatar_url
        ? (profileUser.avatar_url.startsWith('http') ? profileUser.avatar_url : `/storage/${profileUser.avatar_url}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=ef4444&color=fff&size=300`;

    const badgeCfg = BADGE_CONFIG[profileUser.badge];

    const handleFollow = () => {
        if (followPending) return;
        setFollowPending(true);
        router.post(`/u/${profileUser.username}/follow`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                const next = !following;
                setFollowing(next);
                setFollowers(f => next ? f + 1 : Math.max(0, f - 1));
            },
            onFinish: () => setFollowPending(false),
        });
    };

    const tabs = [
        { key: 'bookmarks',      label: 'Bookmark',  icon: Bookmark,      count: stats.bookmarks           || 0 },
        { key: 'history',        label: 'Riwayat',   icon: Clock,         count: stats.watched             || 0 },
        { key: 'char_favorites', label: 'Karakter',  icon: Heart,         count: characterFavorites.length || 0 },
        { key: 'comments',       label: 'Komentar',  icon: MessageSquare, count: stats.comments            || 0 },
    ];

    const statItems = [
        { value: stats.watched   || 0, label: 'Selesai',   icon: Film,      color: 'text-violet-500',  bg: 'bg-violet-50  dark:bg-violet-500/10' },
        { value: stats.episodes  || 0, label: 'Episode',   icon: Play,      color: 'text-sky-500',     bg: 'bg-sky-50     dark:bg-sky-500/10'    },
        { value: stats.bookmarks || 0, label: 'Bookmark',  icon: Bookmark,  color: 'text-amber-500',   bg: 'bg-amber-50   dark:bg-amber-500/10'  },
        { value: followers,            label: 'Pengikut',  icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10'},
        { value: stats.following ?? 0, label: 'Mengikuti', icon: UserPlus,  color: 'text-rose-500',    bg: 'bg-rose-50    dark:bg-rose-500/10'   },
    ];

    return (
        <AppLayout>
            <Head title={`${profileUser.name} - Profil`} />

            {/* Share modal (portal-style, always on top) */}
            {showShare && (
                <ShareModal
                    profileUser={profileUser}
                    avatarSrc={avatarSrc}
                    onClose={() => setShowShare(false)}
                />
            )}

            {/* ── COVER ──────────────────────────────────────────── */}
            <div className="relative h-44 sm:h-56 lg:h-64 overflow-hidden">
                {coverUrl ? (
                    <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a1a3e 100%)' }}>
                        <div className="absolute top-0 left-0 w-80 h-80 bg-violet-500/25 rounded-full blur-[90px]" />
                        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/20 rounded-full blur-[90px]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-28 bg-indigo-600/20 blur-3xl" />
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                        />
                    </div>
                )}
                {/* subtle dark vignette on bottom edge only */}
                <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />

                {/* owner quick-edit — top right */}
                {isOwner && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex gap-2">
                        <Link
                            href="/profile/edit"
                            className="flex items-center gap-1.5 bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all shadow"
                        >
                            <Edit className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit Profil</span>
                        </Link>
                        <Link
                            href={route('settings')}
                            className="flex items-center justify-center w-8 h-8 bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/25 text-white rounded-full transition-all shadow"
                        >
                            <Settings className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* ── PROFILE PANEL ──────────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Avatar + action button row */}
                    <div className="flex items-end justify-between -mt-10 sm:-mt-12 lg:-mt-14 mb-4">

                        {/* Avatar */}
                        <div className="relative z-10 flex-shrink-0">
                            {/* aura glow */}
                            {badgeCfg && (
                                <div className={`absolute inset-0 rounded-full blur-2xl opacity-45 scale-[1.5] -z-10 bg-gradient-to-br ${badgeCfg.grad}`} />
                            )}
                            {/* photo with clean white ring */}
                            <div className="relative rounded-full p-[4px] bg-white dark:bg-slate-900 shadow-2xl">
                                <img
                                    src={avatarSrc}
                                    alt={profileUser.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover block bg-slate-200 dark:bg-slate-800"
                                />
                            </div>
                            {/* ornamental SVG frame (badged users only) */}
                            {badgeCfg && <AvatarFrame tier={profileUser.badge} />}
                            {/* badge label */}
                            {badgeCfg && (
                                <span className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.18em] text-white px-3 py-1 rounded-full shadow-lg z-30 ${badgeCfg.bg}`}>
                                    {badgeCfg.label}
                                </span>
                            )}
                        </div>

                        {/* Action */}
                        <div className="pb-2 flex items-center gap-2">
                            {isOwner ? (
                                <div className="flex gap-2">
                                    <Link
                                        href="/profile/edit"
                                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Edit Profil</span>
                                    </Link>
                                    <Link
                                        href={route('settings')}
                                        className="flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition-all"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            ) : isLoggedIn ? (
                                <button
                                    onClick={handleFollow}
                                    disabled={followPending}
                                    className={`flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-xl transition-all duration-200 disabled:opacity-60 ${
                                        following
                                            ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-red-500 hover:border-red-300 dark:hover:border-red-600'
                                            : 'bg-gradient-to-r from-primary to-rose-500 text-white shadow-lg shadow-primary/30 hover:brightness-110'
                                    }`}
                                >
                                    {following
                                        ? <><UserCheck className="w-4 h-4" /> Mengikuti</>
                                        : <><UserPlus  className="w-4 h-4" /> Ikuti</>
                                    }
                                </button>
                            ) : null}

                            {/* Share button — always visible */}
                            <button
                                onClick={() => setShowShare(true)}
                                className="flex items-center justify-center w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all"
                                title="Bagikan profil"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="mb-3">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {profileUser.name}
                            </h1>
                            {badgeCfg && (
                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] text-white px-2.5 py-1 rounded-full ${badgeCfg.bg}`}>
                                    {badgeCfg.label}
                                </span>
                            )}
                            {!profileUser.profile_public && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    <Lock className="w-2.5 h-2.5" /> Privat
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500">@{profileUser.username}</p>
                        {profileUser.bio && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-lg">{profileUser.bio}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 dark:text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                Bergabung {profileUser.joined_at}
                            </span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar pb-5">
                        <div className="flex gap-2.5 w-max sm:w-auto sm:flex-wrap">
                            {statItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.label} className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                                            <Icon className={`w-4 h-4 ${item.color}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-base font-black text-slate-900 dark:text-white tabular-nums leading-none">{Number(item.value).toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 leading-none">{item.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── TABS + CONTENT ─────────────────────────────────── */}
            <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-28">

                    {/* Tab bar — underline style */}
                    <div className="-mx-4 sm:mx-0 overflow-x-auto no-scrollbar mb-6">
                        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-0 w-max sm:w-auto">
                            {tabs.map(tab => {
                                const active = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => switchTab(tab.key)}
                                        className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                                            active
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <tab.icon className="w-3.5 h-3.5" />
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                                                active
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content panels */}
                    {activeTab === 'bookmarks' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {bookmarks.length === 0
                                    ? <EmptyState icon={Bookmark} message="Belum ada bookmark" sub="Anime yang kamu simpan akan muncul di sini" />
                                    : paginate(bookmarks, 'bookmarks').map(a => <PosterCard key={a.id} anime={a} />)
                                }
                            </div>
                            <Pagination page={pages.bookmarks} total={bookmarks.length} onChange={p => setPage('bookmarks', p)} />
                        </>
                    )}
                    {activeTab === 'history' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {watchHistories.length === 0
                                    ? <EmptyState icon={Clock} message="Belum ada riwayat" sub="Anime yang kamu tonton akan tercatat di sini" />
                                    : paginate(watchHistories, 'history').map(wh => (
                                        <PosterCard 
                                            key={wh.id} 
                                            anime={wh} 
                                            lastEpisode={wh.last_episode} 
                                            lastChapter={wh.last_chapter} 
                                            itemType={wh.item_type} 
                                        />
                                    ))
                                }
                            </div>
                            <Pagination page={pages.history} total={watchHistories.length} onChange={p => setPage('history', p)} />
                        </>
                    )}
                    {activeTab === 'char_favorites' && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                {characterFavorites.length === 0
                                    ? <EmptyState icon={Heart} message="Belum ada favorit" sub="Karakter favoritmu akan tampil di sini" />
                                    : paginate(characterFavorites, 'char_favorites').map(c => <CharacterCard key={c.id} character={c} />)
                                }
                            </div>
                            <Pagination page={pages.char_favorites} total={characterFavorites.length} onChange={p => setPage('char_favorites', p)} />
                        </>
                    )}
                    {activeTab === 'comments' && (
                        <>
                            <div className="flex flex-col gap-3">
                                {comments.length === 0
                                    ? <EmptyState icon={MessageSquare} message="Belum ada komentar" sub="Komentar yang kamu tulis akan muncul di sini" />
                                    : paginate(comments, 'comments').map(c => <CommentCard key={c.id} comment={c} />)
                                }
                            </div>
                            <Pagination page={pages.comments} total={comments.length} onChange={p => setPage('comments', p)} />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
