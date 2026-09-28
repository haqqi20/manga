import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Mail, Lock, LogIn } from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export default function Login({ status, canResetPassword, backgroundPosters = [] }) {
    const { siteSettings } = usePage().props;
    const googleEnabled = siteSettings?.google_login_enabled ?? false;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const posters = backgroundPosters.length >= 12 ? backgroundPosters : [
        'https://cdn.myanimelist.net/images/anime/1100/138338.jpg',
        'https://cdn.myanimelist.net/images/anime/1015/138006.jpg',
        'https://cdn.myanimelist.net/images/anime/1908/135431.jpg',
        'https://cdn.myanimelist.net/images/anime/1806/126216.jpg',
        'https://cdn.myanimelist.net/images/anime/1935/127974.jpg',
        'https://cdn.myanimelist.net/images/anime/1122/96435.jpg',
        'https://cdn.myanimelist.net/images/anime/1439/93480.jpg',
        'https://cdn.myanimelist.net/images/anime/1337/99013.jpg',
        'https://cdn.myanimelist.net/images/anime/1079/138156.jpg',
        'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
        'https://cdn.myanimelist.net/images/anime/1764/126627.jpg',
        'https://cdn.myanimelist.net/images/anime/1160/122627.jpg',
    ];

    const getPosterUrl = (url) => {
        if (!url) return '';
        return url.startsWith('http') ? url : '/storage/' + url;
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-white font-sans">
            {/* Left/Top Decor Panel */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff2e2e]/20 to-slate-900/90 z-0"></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff2e2e]/20 rounded-full blur-[100px] z-0"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] z-0"></div>

                {/* Anime Cards Background Decor */}
                <div className="absolute inset-0 z-0 overflow-hidden flex transform -rotate-12 scale-110 opacity-20 pointer-events-none">
                    <div className="flex flex-col gap-4 animate-marquee whitespace-nowrap -ml-24">
                        <div className="flex gap-4">
                            {posters.slice(0, 4).map((url, i) => (
                                <img key={i} src={getPosterUrl(url)} className="w-32 h-44 object-cover rounded-xl" />
                            ))}
                        </div>
                        <div className="flex gap-4 ml-12">
                            {posters.slice(4, 8).map((url, i) => (
                                <img key={i} src={getPosterUrl(url)} className="w-32 h-44 object-cover rounded-xl" />
                            ))}
                        </div>
                        <div className="flex gap-4 ml-6">
                            {posters.slice(8, 12).map((url, i) => (
                                <img key={i} src={getPosterUrl(url)} className="w-32 h-44 object-cover rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-white">
                    <Link href="/">
                        <ApplicationLogo className="w-10 h-10 text-[#ff2e2e] fill-current" />
                    </Link>
                </div>

                <div className="relative z-10 mb-12 text-white">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Selamat Datang<br />di {siteSettings?.site_name || 'Zurui'}!</h1>
                    <p className="text-slate-300 text-lg leading-relaxed max-w-sm">Tempat terbaik untuk nonton anime subtitle Indonesia favoritmu dengan cepat dan nyaman.</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-slate-900">
                <div className="w-full max-w-md relative z-10">
                    <div className="lg:hidden flex justify-center mb-8">
                        <Link href="/">
                            <ApplicationLogo className="w-10 h-10 text-[#ff2e2e] fill-current" />
                        </Link>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Masuk ke Akun</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Mulai sesi nontonmu hari ini</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                            {status}
                        </div>
                    )}

                    {googleEnabled && (
                        <a
                            href={route('auth.google')}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 mb-6 shadow-sm"
                        >
                            <GoogleIcon />
                            Lanjutkan dengan Google
                        </a>
                    )}

                    <div className="relative flex items-center justify-center mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                        <div className="relative bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Atau dengan Email
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="email">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#ff2e2e] transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:bg-white dark:bg-slate-900 focus:outline-none focus:border-[#ff2e2e] focus:ring-4 focus:ring-[#ff2e2e]/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="nama@email.com"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="password">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#ff2e2e] transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:bg-white dark:bg-slate-900 focus:outline-none focus:border-[#ff2e2e] focus:ring-4 focus:ring-[#ff2e2e]/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="w-[18px] h-[18px] rounded border-slate-300 text-[#ff2e2e] focus:ring-[#ff2e2e]/20 outline-none transition-colors cursor-pointer cursor-pointer"
                                />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm font-bold text-[#ff2e2e] hover:text-[#e02020] hover:underline transition-all"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 bg-[#ff2e2e] hover:bg-[#e02020] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-70 shadow-lg shadow-[#ff2e2e]/25 mt-2"
                        >
                            <LogIn size={18} />
                            {processing ? 'Memproses...' : 'Masuk Sekarang'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                            Belum punya akun?{' '}
                            <Link href={route('register')} className="font-bold text-[#ff2e2e] hover:text-[#e02020] transition-all relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#ff2e2e] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
                                Daftar di sini
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
