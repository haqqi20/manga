import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { siteSettings } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-white font-sans">
            <Head title="Lupa Password" />

            {/* Left/Top Decor Panel */}
            <div className="hidden lg:flex w-5/12 bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff2e2e]/20 to-slate-900/90 z-0"></div>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff2e2e]/20 rounded-full blur-[100px] z-0"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] z-0"></div>

                {/* Anime Cards Background Decor */}
                <div className="absolute inset-0 z-0 overflow-hidden flex transform -rotate-12 scale-110 opacity-20 pointer-events-none">
                    <div className="flex flex-col gap-4 animate-marquee whitespace-nowrap -ml-24">
                        <div className="flex gap-4">
                            <img src="https://cdn.myanimelist.net/images/anime/1100/138338.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1015/138006.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1908/135431.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1806/126216.jpg" className="w-32 h-44 object-cover rounded-xl" />
                        </div>
                        <div className="flex gap-4 ml-12">
                            <img src="https://cdn.myanimelist.net/images/anime/1935/127974.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1122/96435.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1439/93480.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1337/99013.jpg" className="w-32 h-44 object-cover rounded-xl" />
                        </div>
                        <div className="flex gap-4 ml-6">
                            <img src="https://cdn.myanimelist.net/images/anime/1079/138156.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1171/109222.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1764/126627.jpg" className="w-32 h-44 object-cover rounded-xl" />
                            <img src="https://cdn.myanimelist.net/images/anime/1160/122627.jpg" className="w-32 h-44 object-cover rounded-xl" />
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
                        <Link href={route('login')} className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#ff2e2e] mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Masuk
                        </Link>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Lupa Password?</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">Jangan khawatir. Masukkan email kamu di bawah dan kami akan mengirimkan tautan untuk mengatur ulang password barumu.</p>
                    </div>

                    {status && (
                        <div className="mb-6 text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                            {status}
                        </div>
                    )}

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
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-sm text-red-500 font-medium">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`mt-2 w-full py-3.5 px-4 bg-[#ff2e2e] hover:bg-[#e02020] text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-[#ff2e2e]/25 hover:shadow-[#ff2e2e]/40 hover:-translate-y-0.5 ${processing ? 'opacity-75 cursor-wait' : ''}`}
                        >
                            {processing ? 'Mengirim Tautan...' : 'Kirim Tautan Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
