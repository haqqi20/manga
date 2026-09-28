import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Modal from './Modal';

const DISMISS_KEY = 'discord-popup-hidden';

function DiscordLogo({ className = 'h-8 w-8' }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
        </svg>
    );
}

export default function DiscordPopup({ url, title, description, enabled }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!enabled || !url) return;

        // Show after a short delay for better UX
        const timer = setTimeout(() => {
            try {
                if (!localStorage.getItem(DISMISS_KEY)) {
                    setShow(true);
                }
            } catch {
                setShow(true);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [enabled, url]);

    const close = () => setShow(false);

    const neverShowAgain = () => {
        try {
            localStorage.setItem(DISMISS_KEY, '1');
        } catch (e) {
            console.warn('Could not save dismissal state', e);
        }
        setShow(false);
    };

    if (!enabled || !url) return null;

    return (
        <Modal show={show} onClose={close} maxWidth="sm">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/60 transition-all">
                {/* ── Header ── */}
                <div className="relative bg-[#5865F2] px-6 py-8 text-center overflow-hidden">
                    {/* Background Pattern/Glow */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[#4752c4] opacity-20 transform -rotate-12 translate-y-8"></div>

                    <button
                        onClick={close}
                        aria-label="Tutup"
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/25 text-white transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Discord icon circle */}
                    <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-white shadow-inner animate-in zoom-in duration-500">
                        <DiscordLogo className="h-10 w-10 drop-shadow-md" />
                    </div>

                    <h3 className="relative text-2xl font-black text-white leading-tight drop-shadow-sm">
                        {title || 'Join Our Discord'}
                    </h3>
                    <p className="relative mt-2 text-sm font-bold text-white/80 uppercase tracking-widest leading-none">
                        Komunitas anime Indonesia
                    </p>
                </div>

                {/* ── Body ── */}
                <div className="bg-white dark:bg-slate-900 space-y-6 px-8 py-8">
                    <p className="text-center text-base font-semibold text-slate-600 dark:text-slate-400 leading-relaxed italic px-2">
                        "{description || 'Bergabunglah dengan server Discord kami untuk update terbaru, diskusi anime, dan dukungan langsung dari tim.'}"
                    </p>

                    <div className="flex flex-col gap-3 pt-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={close}
                            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] px-6 py-4 text-base font-black text-white transition-all active:scale-95 shadow-lg shadow-[#5865F2]/30 hover:shadow-[#5865F2]/40"
                        >
                            <DiscordLogo className="h-5 w-5" />
                            Bergabung Sekarang
                        </a>
                        <button
                            onClick={close}
                            className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 text-base font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                        >
                            Nanti Saja
                        </button>
                    </div>

                    <div className="pt-2 text-center">
                        <button
                            onClick={neverShowAgain}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-[#5865F2] transition-colors group"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#5865F2]"></span>
                            Jangan tampilkan lagi
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
