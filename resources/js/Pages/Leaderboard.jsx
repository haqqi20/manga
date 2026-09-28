import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Trophy, Tv, Heart, Crown, Medal, Award, Users } from 'lucide-react';

/* ── shimmer for top-3 rows ───────────────────────────────── */
const SHIMMER_CSS = `
@keyframes shimmer {
    0%   { transform: translateX(-120%) skewX(-15deg); }
    100% { transform: translateX(280%)  skewX(-15deg); }
}
.shimmer-row::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    left: -60%; width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
    animation: shimmer 3.5s ease-in-out infinite;
    pointer-events: none;
}
`;

/* ── top-3 row visual config ──────────────────────────────── */
const TOP3 = [
    {
        grad:     'linear-gradient(135deg, #fbbf24 0%, #f59e0b 45%, #d97706 100%)',
        shadow:   '0 4px 20px rgba(251,191,36,0.45)',
        ring:     '#fbbf24',
        textMain: '#78350f',
        textSub:  'rgba(120,53,15,0.70)',
        icon:     <Crown  className="w-4 h-4" style={{ color: '#92400e' }} />,
    },
    {
        grad:     'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 45%, #64748b 100%)',
        shadow:   '0 4px 16px rgba(100,116,139,0.40)',
        ring:     '#94a3b8',
        textMain: '#1e293b',
        textSub:  'rgba(30,41,59,0.65)',
        icon:     <Medal  className="w-4 h-4" style={{ color: '#334155' }} />,
    },
    {
        grad:     'linear-gradient(135deg, #fde68a 0%, #d97706 45%, #92400e 100%)',
        shadow:   '0 4px 16px rgba(180,83,9,0.40)',
        ring:     '#d97706',
        textMain: '#fef3c7',
        textSub:  'rgba(254,243,199,0.70)',
        icon:     <Award  className="w-4 h-4" style={{ color: '#fef9c3' }} />,
    },
];

/* ── badge config ─────────────────────────────────────────── */
const BADGE = {
    vip:       { label: 'VIP', cls: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white' },
    premium:   { label: 'PRO', cls: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'  },
    developer: { label: 'DEV', cls: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' },
};

/* ── single list row ──────────────────────────────────────── */
function UserRow({ rank, user, valueKey, valueLabel }) {
    const cfg    = rank <= 3 ? TOP3[rank - 1] : null;
    const value  = user[valueKey] ?? 0;
    const badge  = BADGE[user.badge];
    const avatar = user.avatar_url
        ? (user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff&size=64`;

    return (
        <Link
            href={user.username ? `/u/${user.username}` : '#'}
            className={[
                'relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150',
                'hover:-translate-y-0.5 hover:shadow-lg',
                cfg
                    ? 'border-transparent shimmer-row'
                    : 'bg-white dark:bg-slate-800/60 border-gray-100 dark:border-slate-700/50',
            ].join(' ')}
            style={cfg ? { background: cfg.grad, boxShadow: cfg.shadow } : {}}
        >
            {/* rank */}
            <div className="w-7 flex-shrink-0 flex items-center justify-center">
                {cfg
                    ? cfg.icon
                    : <span className="text-xs font-black text-slate-400 tabular-nums">{rank}</span>
                }
            </div>

            {/* avatar */}
            <img
                src={avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                style={cfg ? { outline: `2px solid ${cfg.ring}`, outlineOffset: '2px' } : {}}
            />

            {/* name + badge + username */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                        className={`text-sm font-bold truncate ${cfg ? '' : 'text-slate-900 dark:text-white'}`}
                        style={cfg ? { color: cfg.textMain } : {}}
                    >
                        {user.name}
                    </span>
                    {badge && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badge.cls}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    {user.username && (
                        <span
                            className={`text-[11px] truncate ${cfg ? '' : 'text-slate-400'}`}
                            style={cfg ? { color: cfg.textSub } : {}}
                        >
                            @{user.username}
                        </span>
                    )}
                    <span
                        className={`flex items-center gap-0.5 text-[10px] font-semibold ${cfg ? '' : 'text-slate-400 dark:text-slate-500'}`}
                        style={cfg ? { color: cfg.textSub } : {}}
                    >
                        <Users className="w-2.5 h-2.5 flex-shrink-0" />
                        {(user.followers_count ?? 0).toLocaleString()}
                        <span className={`mx-0.5 ${cfg ? '' : 'text-slate-300 dark:text-slate-600'}`}>·</span>
                        {(user.following_count ?? 0).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* score */}
            <div className="text-right flex-shrink-0">
                <div
                    className={`text-base font-black tabular-nums ${cfg ? '' : 'text-slate-700 dark:text-slate-200'}`}
                    style={cfg ? { color: cfg.textMain } : {}}
                >
                    {value.toLocaleString()}
                </div>
                <p
                    className={`text-[10px] font-medium ${cfg ? '' : 'text-slate-400'}`}
                    style={cfg ? { color: cfg.textSub } : {}}
                >
                    {valueLabel}
                </p>
            </div>
        </Link>
    );
}

/* ── full ranked list ─────────────────────────────────────── */
function LeaderList({ data, valueKey, valueLabel, emptyIcon: EmptyIcon }) {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <EmptyIcon className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-sm font-semibold">Belum ada data</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {data.map((user, i) => (
                <UserRow
                    key={user.id}
                    rank={i + 1}
                    user={user}
                    valueKey={valueKey}
                    valueLabel={valueLabel}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════ */
export default function Leaderboard({ topSeries = [], topEpisodes = [], topCharFavorites = [] }) {
    const [tab, setTab] = useState('series');

    const tabs = [
        { key: 'series', label: 'Series Selesai',   short: 'Series',   icon: Tv    },
        { key: 'chars',  label: 'Favorit Karakter',  short: 'Karakter', icon: Heart },
    ];

    return (
        <AppLayout>
            <Head title="Leaderboard — Penonton Terbanyak" />
            <style dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }} />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-16">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-xl shadow-amber-400/30 mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Leaderboard
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Penonton anime paling aktif di komunitas ini
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-800/80 rounded-2xl p-1.5 mb-5">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 ${
                                tab === t.key
                                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <t.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">{t.label}</span>
                            <span className="sm:hidden">{t.short}</span>
                        </button>
                    ))}
                </div>

                {/* List */}
                {tab === 'series' && (
                    <LeaderList
                        data={topSeries}
                        valueKey="series_count"
                        valueLabel="selesai"
                        emptyIcon={Tv}
                    />
                )}
                {tab === 'chars' && (
                    <LeaderList
                        data={topCharFavorites}
                        valueKey="char_fav_count"
                        valueLabel="favorit karakter"
                        emptyIcon={Heart}
                    />
                )}

            </div>
        </AppLayout>
    );
}
