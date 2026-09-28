import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, ChevronRight, User, Settings } from 'lucide-react';

/* ── small helpers ─────────────────────────────────────────────── */
function InputField({ label, id, type = 'text', value, onChange, error, ...rest }) {
    const [show, setShow] = useState(false);
    const isPass = type === 'password';
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={isPass && show ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                        error
                            ? 'border-red-400 focus:ring-red-400/40'
                            : 'border-gray-200 dark:border-slate-700 focus:ring-primary/40 focus:border-primary'
                    }`}
                    {...rest}
                />
                {isPass && (
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>
    );
}

function SuccessBanner({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {message}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   Email Section
══════════════════════════════════════════════════════════════════ */
function EmailSection({ user, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: user.email ?? '',
        current_password: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('settings.email'), {
            onSuccess: () => reset('current_password'),
        });
    }

    return (
        <section className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ubah Email</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email aktif: <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span></p>
                </div>
            </div>

            {status === 'email-updated' && (
                <div className="mb-4">
                    <SuccessBanner message="Email berhasil diperbarui. Silakan verifikasi email baru kamu." />
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <InputField
                    label="Email Baru"
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    error={errors.email}
                    placeholder="email@baru.com"
                    autoComplete="email"
                />
                <InputField
                    label="Konfirmasi dengan Password Saat Ini"
                    id="email_current_password"
                    type="password"
                    value={data.current_password}
                    onChange={e => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={processing}
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

/* ══════════════════════════════════════════════════════════════════
   Password Section
══════════════════════════════════════════════════════════════════ */
function PasswordSection({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('settings.password'), {
            onSuccess: () => reset(),
        });
    }

    return (
        <section className="bg-white dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ubah Password</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pastikan password baru kamu cukup kuat</p>
                </div>
            </div>

            {status === 'password-updated' && (
                <div className="mb-4">
                    <SuccessBanner message="Password berhasil diperbarui." />
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <InputField
                    label="Password Saat Ini"
                    id="current_password"
                    type="password"
                    value={data.current_password}
                    onChange={e => setData('current_password', e.target.value)}
                    error={errors.current_password}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <InputField
                    label="Password Baru"
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={e => setData('password', e.target.value)}
                    error={errors.password}
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                <InputField
                    label="Konfirmasi Password Baru"
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={e => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    placeholder="••••••••"
                    autoComplete="new-password"
                />
                <div className="flex justify-end pt-1">
                    <button
                        type="submit"
                        disabled={processing}
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

/* ══════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════ */
export default function UserSettings({ user, status }) {
    return (
        <AppLayout>
            <Head title="Pengaturan Akun" />

            <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 pb-20">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pengaturan Akun</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Kelola email dan password kamu</p>
                    </div>
                </div>

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
                    <Link href={route('user.profile', user.username)} className="hover:text-primary transition-colors flex items-center gap-1">
                        <User className="w-3 h-3" />@{user.username}
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Pengaturan</span>
                </nav>

                <div className="flex flex-col gap-5">
                    <EmailSection user={user} status={status} />
                    <PasswordSection status={status} />
                </div>
            </div>
        </AppLayout>
    );
}
