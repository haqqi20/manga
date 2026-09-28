import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Mail, Lock, User } from 'lucide-react';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 39.819 -11.514 38.529 -14.754 38.529 C -19.444 38.529 -23.494 41.229 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
        </g>
    </svg>
);

export default function Register({ backgroundPosters = [] }) {
    const { siteSettings } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-white font-sans">
            <Head title="Daftar Akun" />

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
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Daftar Akun Baru</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Bergabung dan mulai petualangan serumu</p>
                    </div>

                    {siteSettings?.google_login_enabled && (
                        <a
                            href={route('auth.google')}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-medium py-3 px-4 rounded-xl transition-all duration-200 mb-6 shadow-sm"
                        >
                            <GoogleIcon />
                            Daftar dengan Google
                        </a>
                    )}

                    <div className="relative flex items-center justify-center mb-6">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                        <div className="absolute bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">ATAU</div>
                    </div>

                    <form onSubmit={submit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="name">Nama Lengkap</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#ff2e2e] transition-colors" />
                                </div>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:bg-white dark:bg-slate-900 focus:outline-none focus:border-[#ff2e2e] focus:ring-4 focus:ring-[#ff2e2e]/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="Nama kamu"
                                    autoComplete="name"
                                    required
                                />
                            </div>
                            {errors.name && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.name}</p>}
                        </div>

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
                                    required
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
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5" htmlFor="password_confirmation">Konfirmasi Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#ff2e2e] transition-colors" />
                                </div>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:bg-white dark:bg-slate-900 focus:outline-none focus:border-[#ff2e2e] focus:ring-4 focus:ring-[#ff2e2e]/10 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            {errors.password_confirmation && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.password_confirmation}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full py-3.5 px-4 bg-[#ff2e2e] hover:bg-[#e02020] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-[#ff2e2e]/25 hover:shadow-[#ff2e2e]/40 hover:-translate-y-0.5 ${processing ? 'opacity-75 cursor-wait' : ''}`}
                        >
                            {processing ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="font-bold text-[#ff2e2e] hover:text-[#e02020] transition-all relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#ff2e2e] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
