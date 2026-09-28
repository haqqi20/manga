import { usePage, router } from '@inertiajs/react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AppBottomNav from '../Components/AppBottomNav';

export default function AppLayout({ children }) {
    const { isImpersonating, auth } = usePage().props;

    return (
        <div className="min-h-screen flex flex-col bg-[#f7f4ff] dark:bg-[#070914] text-slate-700 dark:text-slate-200 font-sans antialiased overflow-x-clip pb-20 md:pb-0 relative">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 -left-24 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/15"></div>
                <div className="absolute top-32 -right-32 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/15"></div>
                <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl dark:bg-indigo-500/10"></div>
            </div>

            {isImpersonating && (
                <div className="sticky top-0 z-[70] flex items-center justify-between gap-3 bg-amber-300 text-amber-950 px-4 py-2 text-sm font-semibold shadow-md">
                    <span>👤 Kamu sedang login sebagai <strong>{auth?.user?.name}</strong></span>
                    <button
                        onClick={() => {
                            if (typeof route === 'function' && typeof router !== 'undefined') {
                                router.post(route('impersonate.stop'));
                            }
                        }}
                        className="shrink-0 rounded-full bg-amber-950/15 hover:bg-amber-950/25 px-4 py-1.5 text-xs font-bold transition-colors"
                    >
                        Kembali ke Admin
                    </button>
                </div>
            )}
            <Navbar />
            <main className="flex-1 w-full flex flex-col relative z-20">
                {children}
            </main>
            <Footer />
            <AppBottomNav />
        </div>
    );
}
