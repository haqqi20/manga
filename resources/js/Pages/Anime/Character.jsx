import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Star, Users, Film, Calendar, ChevronDown, ChevronUp, ExternalLink, Heart } from 'lucide-react';

/* ── Constants ──────────────────────────────────────────────────────────── */
const ROLE_CFG = {
    Main:       { label: 'Main',       bg: 'bg-rose-500',   text: 'text-rose-500',   light: 'bg-rose-500/10 text-rose-500 border-rose-500/30' },
    Supporting: { label: 'Supporting', bg: 'bg-amber-500',  text: 'text-amber-500',  light: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
};

const TYPE_BADGE = {
    movie:   { label: 'MOVIE', cls: 'bg-purple-600' },
    ova:     { label: 'OVA',   cls: 'bg-orange-500' },
    ona:     { label: 'ONA',   cls: 'bg-sky-600'    },
    music:   { label: 'MUSIC', cls: 'bg-pink-500'   },
    tv:      { label: 'TV',    cls: 'bg-indigo-600' },
    special: { label: 'SP',    cls: 'bg-teal-600'   },
};

/* ── Parse AniList markdown: [text](url) → tokens ──────────────────────── */
function parseMd(text) {
    const tokens = [];
    const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) tokens.push({ t: 'text', v: text.slice(last, m.index) });
        tokens.push({ t: 'link', label: m[1], href: m[2] });
        last = m.index + m[0].length;
    }
    if (last < text.length) tokens.push({ t: 'text', v: text.slice(last) });
    return tokens;
}

function RichPara({ line }) {
    return (
        <p className="text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            {parseMd(line).map((tok, i) =>
                tok.t === 'link'
                    ? <a key={i} href={tok.href} target="_blank" rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline">{tok.label}</a>
                    : <span key={i}>{tok.v}</span>
            )}
        </p>
    );
}

function Description({ text }) {
    const [open, setOpen] = useState(false);
    if (!text) return null;
    const paras = text.split(/\n+/).filter(Boolean);
    const CUT = 3;
    const needs = paras.length > CUT;
    const shown = open ? paras : paras.slice(0, CUT);
    return (
        <div>
            <div className="space-y-2.5 sm:space-y-3">
                {shown.map((p, i) => <RichPara key={i} line={p} />)}
            </div>
            {needs && (
                <button onClick={() => setOpen(!open)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                    {open
                        ? <><ChevronUp size={13} /> Tampilkan lebih sedikit</>
                        : <><ChevronDown size={13} /> Tampilkan lebih banyak</>}
                </button>
            )}
        </div>
    );
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function CharacterShow({ character, anime, appearances = [], coCharacters = [], siteSlug = 'anime', isFavorited = false, favoriteCount = 0 }) {
    const { auth } = usePage().props;
    const [favorited, setFavorited] = useState(isFavorited);
    const [favCount, setFavCount]   = useState(favoriteCount);

    const handleFavorite = () => {
        if (!auth?.user) { window.location.href = '/login'; return; }
        const next = !favorited;
        setFavorited(next);
        setFavCount(v => next ? v + 1 : Math.max(0, v - 1));
        router.post(`/character/${character.id}/favorite`, {}, { preserveScroll: true });
    };

    const role    = character.role || 'Supporting';
    const roleCfg = ROLE_CFG[role] || ROLE_CFG.Supporting;

    const imageSrc   = character.image_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=ef4444&color=fff&size=400`;
    const animePoster = anime?.poster
        || (anime ? `https://ui-avatars.com/api/?name=${encodeURIComponent(anime.title)}&background=1e293b&color=fff&size=300` : null);

    const infoRows = [
        { label: 'Age',        value: character.age },
        { label: 'Gender',     value: character.gender },
        { label: 'Blood Type', value: character.blood_type },
    ].filter(r => r.value);

    return (
        <AppLayout>
            <Head title={`${character.name} — Karakter`} />

            {/* ── BANNER ─────────────────────────────────────────────── */}
            <div className="relative w-full h-40 sm:h-52 overflow-hidden bg-slate-900">
                {animePoster && (
                    <img src={animePoster} alt="" aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 scale-110 blur-md"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                {/* ── HERO: portrait left, identity right on solid bg ── */}
                <div className="flex flex-col sm:flex-row gap-0 sm:gap-6 lg:gap-8 relative z-10">

                    {/* Portrait — overlaps banner upward */}
                    <div className="flex-shrink-0 flex justify-center sm:justify-start -mt-16 sm:-mt-20 lg:-mt-24">
                        <div className="relative">
                            <img src={imageSrc} alt={character.name}
                                className="w-32 sm:w-40 lg:w-48 rounded-2xl object-cover shadow-2xl ring-2 ring-white/10 aspect-[2/3]"
                            />
                            <span className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-black uppercase tracking-wider py-1.5 rounded-b-2xl ${roleCfg.bg} text-white`}>
                                {roleCfg.label}
                            </span>
                        </div>
                    </div>

                    {/* Identity — always on page background, no dark-zone colors */}
                    <div className="flex-1 min-w-0 mt-4 sm:mt-4 text-center sm:text-left">
                        {/* Name */}
                        <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            {character.name}
                        </h1>

                        {/* Anime + AniList links */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 justify-center sm:justify-start mt-2.5">
                            {anime && (
                                <Link href={`/${siteSlug}/${anime.slug}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                                    <Film size={13} className="text-primary shrink-0" />
                                    {anime.title}
                                </Link>
                            )}
                            {character.anilist_id && (
                                <a href={`https://anilist.co/character/${character.anilist_id}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#02a9ff] transition-colors">
                                    <span className="w-3 h-3 rounded-sm bg-[#02a9ff] shrink-0" />
                                    AniList
                                    <ExternalLink size={10} />
                                </a>
                            )}
                        </div>

                        {/* Stat chips */}
                        {infoRows.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                                {infoRows.map(r => (
                                    <div key={r.label}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{r.label}</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Favorite button */}
                        <div className="flex items-center gap-3 justify-center sm:justify-start mt-4">
                            <button
                                onClick={handleFavorite}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm ${
                                    favorited
                                        ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500'
                                }`}
                            >
                                <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
                                {favorited ? 'Difavoritkan' : 'Favoritkan'}
                            </button>
                            {favCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500 font-semibold">
                                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                                    {favCount.toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── CONTENT GRID ─────────────────────────────────────── */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

                    {/* ── LEFT SIDEBAR ─────────────────────────────── */}
                    <aside className="space-y-4 order-2 lg:order-1">

                        {/* Info card */}
                        {infoRows.length > 0 && (
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Informasi</p>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                                    {infoRows.map(r => (
                                        <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{r.label}</span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Anime appearances */}
                        {appearances.length > 0 && (
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
                                    <Film size={12} className="text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Muncul Di
                                    </p>
                                    {appearances.length > 1 && (
                                        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                                            {appearances.length}
                                        </span>
                                    )}
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                                    {appearances.map(ap => {
                                        const apTb = TYPE_BADGE[(ap.type || '').toLowerCase()] || TYPE_BADGE.tv;
                                        const apPoster = ap.poster
                                            || `https://ui-avatars.com/api/?name=${encodeURIComponent(ap.title)}&background=1e293b&color=fff&size=300`;
                                        return (
                                            <Link key={ap.id} href={`/${siteSlug}/${ap.slug}`}
                                                className="group flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="relative shrink-0">
                                                    <img src={apPoster} alt={ap.title}
                                                        className="w-12 h-[72px] rounded-lg object-cover bg-slate-100 dark:bg-slate-700 shadow" />
                                                    <span className={`absolute top-1 left-1 text-[7px] font-black text-white px-1 py-0.5 rounded ${apTb.cls}`}>
                                                        {apTb.label}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                        {ap.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        {ap.release_year && (
                                                            <span className="flex items-center gap-0.5 text-xs text-slate-400">
                                                                <Calendar size={10} /> {ap.release_year}
                                                            </span>
                                                        )}
                                                        {ap.rating && (
                                                            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-semibold">
                                                                <Star size={10} className="fill-amber-400" /> {ap.rating}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {ap.studio && (
                                                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{ap.studio}</p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* ── MAIN CONTENT ─────────────────────────────── */}
                    <div className="space-y-5 order-1 lg:order-2">
                        {character.description && (
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-4 rounded-full bg-primary block shrink-0" />
                                    <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tentang</h2>
                                </div>
                                <Description text={character.description} />
                            </div>
                        )}

                        {/* If no description, show placeholder */}
                        {!character.description && (
                            <div className="bg-white dark:bg-slate-800/80 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                                <p className="text-slate-400 text-sm">Belum ada deskripsi untuk karakter ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── CO-CHARACTERS ────────────────────────────────────── */}
                {coCharacters.length > 0 && (
                    <section className="mt-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={14} className="text-primary shrink-0" />
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                Karakter Lain
                                {anime?.title && <span className="normal-case font-normal text-slate-400 dark:text-slate-500 ml-1">— {anime.title}</span>}
                            </h2>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
                            {coCharacters.map(c => {
                                const coImg = c.image_url
                                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1e293b&color=fff&size=200`;
                                const cRole = ROLE_CFG[c.role] || ROLE_CFG.Supporting;
                                return (
                                    <Link key={c.id} href={`/character/${c.id}/${c.slug || ''}`} className="group flex flex-col gap-1.5">
                                        <div className="relative w-full aspect-[2/3]">
                                            <img src={coImg} alt={c.name} loading="lazy"
                                                className="absolute inset-0 w-full h-full rounded-xl object-cover bg-slate-100 dark:bg-slate-800 group-hover:brightness-110 transition-all duration-200"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl" />
                                            <span className={`absolute bottom-1 left-0 right-0 text-center text-[8px] font-black uppercase py-0.5 ${cRole.text}`}>
                                                {cRole.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {c.name}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </AppLayout>
    );
}
