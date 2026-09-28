import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Film, Tv, Bookmark, Heart, Users, Eye,
    Mail, Lock, CheckCircle, AlertCircle,
    ChevronRight, Eye as EyeIcon, EyeOff,
    Settings, User, ExternalLink, Monitor, MapPin, Clock, Shield,
} from 'lucide-react';

/* ── Badge config ─────────────────────────────────────────── */
const BADGE_CONFIG = {
    vip:       { label: 'VIP', cls: 'from-amber-400 to-yellow-500' },
    premium:   { label: 'PRO', cls: 'from-blue-500 to-indigo-500'  },
    developer: { label: 'DEV', cls: 'from-emerald-500 to-teal-500' },
};

/* ── Password Input ───────────────────────────────────────── */
function PasswordInput({ id, value, onChange, error, placeholder, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        error
                            ? 'border-red-400 focus:ring-red-400/40'
                            : 'border-gray-200 dark:border-slate-700 focus:ring-primary/40 focus:border-primary'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{error}
                </p>
            )}
        </div>
    );
}

function TextInput({ id, type = 'text', value, onChange, error, placeholder, autoComplete }) {
    return (
        <div>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    error
                        ? 'border-red-400 focus:ring-red-400/40'
                        : 'border-gray-200 dark:border-slate-700 focus:ring-primary/40 focus:border-primary'
                }`}
            />
            {error && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{error}
                </p>
            )}
        </div>
    );
}

function SuccessBanner({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-5">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {message}
        </div>
    );
}

/* ── Change Email ─────────────────────────────────────────── */
function EmailSection({ user, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: user.email ?? '',
        current_password: '',
    });

    return (
        <section className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ubah Email</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Aktif:&nbsp;<span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span>
                    </p>
                </div>
            </div>

            {status === 'email-updated' && <SuccessBanner message="Email berhasil diperbarui. Silakan verifikasi email baru kamu." />}

            <form
                onSubmit={e => { e.preventDefault(); post(route('settings.email'), { onSuccess: () => reset('current_password') }); }}
                className="flex flex-col gap-3"
            >
                <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Baru</label>
                    <TextInput
                        id="email" type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        error={errors.email}
                        placeholder="email@baru.com"
                        autoComplete="email"
                    />
                </div>
                <div>
                    <label htmlFor="email_pass" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password Saat Ini</label>
                    <PasswordInput
                        id="email_pass"
                        value={data.current_password}
                        onChange={e => setData('current_password', e.target.value)}
                        error={errors.current_password}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </div>
                <div className="flex justify-end pt-1">
                    <button
                        type="submit" disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-500/30"
                    >
                        {processing ? 'Menyimpan…' : 'Simpan Email'}
                        {!processing && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </section>
    );
}

/* ── Change Password ──────────────────────────────────────── */
function PasswordSection({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <section className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ubah Password</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan password yang kuat dan unik</p>
                </div>
            </div>

            {status === 'password-updated' && <SuccessBanner message="Password berhasil diperbarui." />}

            <form
                onSubmit={e => { e.preventDefault(); post(route('settings.password'), { onSuccess: () => reset() }); }}
                className="flex flex-col gap-3"
            >
                {[
                    { key: 'current_password', label: 'Password Saat Ini', auto: 'current-password' },
                    { key: 'password',         label: 'Password Baru',     auto: 'new-password'     },
                    { key: 'password_confirmation', label: 'Konfirmasi Password Baru', auto: 'new-password' },
                ].map(f => (
                    <div key={f.key}>
                        <label htmlFor={f.key} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{f.label}</label>
                        <PasswordInput
                            id={f.key}
                            value={data[f.key]}
                            onChange={e => setData(f.key, e.target.value)}
                            error={errors[f.key]}
                            placeholder="••••••••"
                            autoComplete={f.auto}
                        />
                    </div>
                ))}
                <div className="flex justify-end pt-1">
                    <button
                        type="submit" disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-sm shadow-rose-500/30"
                    >
                        {processing ? 'Menyimpan…' : 'Simpan Password'}
                        {!processing && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </form>
        </section>
    );
}

/* ══════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════ */
function formatLoginDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60)   return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
    return formatLoginDate(dateStr);
}

export default function Dashboard({ user, stats = {}, status }) {
    const badgeCfg = BADGE_CONFIG[user?.badge];
    const avatar = user?.avatar_url
        ? (user.avatar_url.startsWith('http') ? user.avatar_url : `/storage/${user.avatar_url}`)
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? '?')}&background=ef4444&color=fff&size=128`;

    const statItems = [
        { icon: Film,     label: 'Selesai',   value: stats.watched   ?? 0 },
        { icon: Eye,      label: 'Episode',   value: stats.episodes  ?? 0 },
        { icon: Bookmark, label: 'Bookmark',  value: stats.bookmarks ?? 0 },
        { icon: Heart,    label: 'Karakter',  value: stats.charFavs  ?? 0 },
        { icon: Users,    label: 'Pengikut',  value: stats.followers ?? 0 },
        { icon: Tv,       label: 'Mengikuti', value: stats.following ?? 0 },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-20">

                {/* ── User Card ── */}
                <div className="relative bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-sm overflow-hidden mb-6">
                    {/* cover strip */}
                    {user?.cover_url ? (
                        <img src={user.cover_url.startsWith('http') ? user.cover_url : `/storage/${user.cover_url}`}
                            alt="cover" className="w-full h-20 object-cover" />
                    ) : (
                        <div className="w-full h-20 bg-gradient-to-r from-primary/60 to-rose-500/60" />
                    )}

                    <div className="px-5 pb-5">
                        <div className="flex items-end gap-4 -mt-8 mb-4">
                            <div className={`p-0.5 rounded-2xl shadow-lg flex-shrink-0 ${
                                badgeCfg ? `bg-gradient-to-br ${badgeCfg.cls}` : 'bg-white dark:bg-slate-900'
                            }`}>
                                <img src={avatar} alt={user?.name}
                                    className="w-16 h-16 rounded-[14px] object-cover block bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-base font-black text-slate-900 dark:text-white truncate">{user?.name}</span>
                                    {badgeCfg && (
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${badgeCfg.cls} uppercase tracking-wider`}>
                                            {badgeCfg.label}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">@{user?.username}</p>
                            </div>
                            <Link
                                href={route('user.profile', user?.username)}
                                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Profil
                            </Link>
                        </div>

                        {/* Stats strip */}
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {statItems.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex flex-col items-center gap-0.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl py-2.5 px-1">
                                    <Icon className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
                                    <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{value.toLocaleString()}</span>
                                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide text-center">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Quick Links ── */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                        { href: route('user.profile', user?.username), icon: User,     label: 'Profil Publik',    sub: 'Lihat halaman profilmu' },
                        { href: route('library'),                       icon: Bookmark, label: 'Library',          sub: 'Bookmark & riwayat'     },
                        { href: route('profile.user.edit'),             icon: Settings, label: 'Edit Profil',      sub: 'Foto, bio, username'    },
                        { href: route('leaderboard'),                   icon: Tv,       label: 'Leaderboard',      sub: 'Peringkat penonton'     },
                    ].map(({ href, icon: Icon, label, sub }) => (
                        <Link key={label} href={href}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 hover:border-primary/40 hover:shadow-md transition-all group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-primary/10 transition-colors flex-shrink-0">
                                <Icon className="w-4.5 h-4.5 text-slate-500 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{sub}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Login History ── */}
                {user?.login_history?.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
                                <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Aktivitas Login</h2>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                {user.login_history.length}/8 sesi
                            </span>
                        </div>
                        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 overflow-hidden shadow-sm">
                            {/* Progress bar */}
                            <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Riwayat tersimpan</span>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{user.login_history.length} dari 8</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                                        style={{ width: `${(user.login_history.length / 8) * 100}%` }}
                                    />
                                </div>
                                {user.login_history.length === 8 && (
                                    <p className="mt-1.5 text-[10px] text-amber-500 font-semibold">⚠ Riwayat penuh — login berikutnya akan mereset daftar ini.</p>
                                )}
                            </div>

                            {/* History rows */}
                            <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                {user.login_history.map((entry, i) => (
                                    <li key={i} className={`flex items-center gap-3 px-5 py-3.5 ${
                                        i === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                                    }`}>
                                        {/* Index badge */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                                            i === 0
                                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                        }`}>
                                            {i + 1}
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            i === 0
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                        }`}>
                                            <Monitor className={`w-4 h-4 ${ i === 0 ? 'text-emerald-500' : 'text-slate-400' }`} />
                                        </div>

                                        {/* Device + IP */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{entry.device}</span>
                                                {i === 0 && (
                                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Terbaru</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-mono">{entry.ip}</span>
                                                <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                                                <span className="text-[10px] text-slate-400">{timeAgo(entry.at)}</span>
                                            </div>
                                        </div>

                                        {/* Full date */}
                                        <span className="text-[10px] text-slate-400 flex-shrink-0 hidden sm:block">{formatLoginDate(entry.at)}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/60">
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    Jika ada aktivitas yang tidak kamu kenali, segera ubah password.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Account Settings Header ── */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary to-rose-500" />
                    <h2 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wide">Keamanan Akun</h2>
                </div>

                <div className="flex flex-col gap-4">
                    <EmailSection user={user} status={status} />
                    <PasswordSection status={status} />
                </div>
            </div>
        </AppLayout>
    );
}
