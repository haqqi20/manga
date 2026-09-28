import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const DISMISS_KEY = 'discord-banner-hidden';

function DiscordLogo({ className = 'h-8 w-8' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
        </svg>
    );
}

export default function DiscordBanner({ url, title, description, enabled }) {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Ensure we only use portal on client side
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!enabled || !url) return;
        let timer;
        try {
            if (!localStorage.getItem(DISMISS_KEY)) {
                timer = setTimeout(() => {
                    setVisible(true);
                    setTimeout(() => setAnimating(true), 10);
                }, 1500);
            }
        } catch {
            timer = setTimeout(() => {
                setVisible(true);
                setTimeout(() => setAnimating(true), 10);
            }, 1500);
        }
        return () => clearTimeout(timer);
    }, [enabled, url]);

    // Lock body scroll when open
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [visible]);

    const close = (callback) => {
        setAnimating(false);
        setTimeout(() => {
            setVisible(false);
            if (callback) callback();
        }, 300);
    };

    const dismiss = () => close();

    const neverShow = () => close(() => {
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* SSR / private mode */ }
    });

    if (!visible || !mounted) return null;

    // Render via portal directly into body so it's above ALL stacking contexts
    return createPortal(
        <div
            style={{ zIndex: 2147483647 }}
            className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-300 ${animating ? 'bg-black/60 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'}`}
            onClick={dismiss}
        >
            <div
                className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl shadow-[#5865F2]/20 border border-slate-200 dark:border-slate-700/60 transition-all duration-300 ${animating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="relative bg-[#5865F2] px-6 py-7 text-center overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 w-28 h-28 bg-white/5 rounded-full -translate-x-10 -translate-y-10 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/5 rounded-full translate-x-12 translate-y-12 pointer-events-none" />

                    <button
                        onClick={dismiss}
                        aria-label="Tutup"
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-all z-10"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Discord icon circle */}
                    <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-white shadow-lg shadow-black/20">
                        <DiscordLogo className="h-8 w-8" />
                    </div>

                    <h3 className="relative text-lg font-black text-white leading-tight">
                        {title || 'Join Our Discord'}
                    </h3>
                    <p className="relative mt-1 text-sm font-semibold text-white/70">
                        Komunitas anime Indonesia
                    </p>
                </div>

                {/* ── Body ── */}
                <div className="bg-white dark:bg-slate-900 space-y-4 px-6 py-5">
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {description || 'Bergabunglah dengan server Discord kami untuk update terbaru, diskusi anime, dan dukungan langsung dari tim.'}
                    </p>

                    <div className="flex gap-3">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={dismiss}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] px-4 py-3 text-sm font-black text-white transition-all active:scale-95 shadow-md shadow-[#5865F2]/30"
                        >
                            <DiscordLogo className="h-4 w-4" />
                            Bergabung
                        </a>
                        <button
                            onClick={dismiss}
                            className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                        >
                            Lewati
                        </button>
                    </div>

                    <button
                        onClick={neverShow}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
                    >
                        Jangan tampilkan lagi
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
