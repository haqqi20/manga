import { useState, useEffect } from 'react';
import { Cat, Flame, Star, Zap, Heart, Tv, Play, Moon, Crown, Eye, Compass, Sparkles, Sword, Shield, Ghost, Skull, Wand2, Rabbit, Bird, Fish, Squirrel, Bug, Rocket, Atom, Book, BookOpen, Gamepad2, Joystick, Music, Mic, Video, Camera, Coffee, Pizza, Cherry, Hexagon, Diamond, Leaf, Sun, Facebook, Twitter, Instagram, Users } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const LOGO_ICON_MAP = { cat: Cat, flame: Flame, star: Star, zap: Zap, heart: Heart, tv: Tv, play: Play, moon: Moon, crown: Crown, eye: Eye, compass: Compass, sparkles: Sparkles, sword: Sword, shield: Shield, ghost: Ghost, skull: Skull, wand2: Wand2, rabbit: Rabbit, bird: Bird, fish: Fish, squirrel: Squirrel, bug: Bug, rocket: Rocket, atom: Atom, sun: Sun, video: Video, camera: Camera, music: Music, mic: Mic, gamepad2: Gamepad2, joystick: Joystick, book: Book, bookopen: BookOpen, coffee: Coffee, pizza: Pizza, cherry: Cherry, hexagon: Hexagon, diamond: Diamond, leaf: Leaf };

export default function Footer() {
    const { props: pageProps } = usePage();
    const siteSettings = pageProps.siteSettings || {};

    const showStats = !!siteSettings.show_visitor_stats;
    const [stats, setStats] = useState({ online: 0, total: 0 });

useEffect(() => {
    // =====================
    // HISTATS TRACKING (versi baru)
    // =====================
    window._Hasync = window._Hasync || [];
    window._Hasync.push(['Histats.start', '1,5049466,4,0,0,0,00010000']);
    window._Hasync.push(['Histats.fasi', '1']);
    window._Hasync.push(['Histats.track_hits', '']);

    (function () {
        const hs = document.createElement('script');
        hs.type = 'text/javascript';
        hs.async = true;
        hs.src = '//s10.histats.com/js15_as.js';
        (document.getElementsByTagName('head')[0] || document.body).appendChild(hs);
    })();

    // =====================
    // VISITOR STATS (punya kamu)
    // =====================
    if (!showStats) return;

    fetch('/api/stats/track', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            'Accept': 'application/json'
        },
    }).then(r => r.json()).then(d => setStats(d)).catch(() => { });

    const timer = setInterval(() => {
        fetch('/api/stats', { headers: { 'Accept': 'application/json' } })
            .then(r => r.json()).then(d => setStats(d)).catch(() => { });
    }, 30000);

    return () => {
        clearInterval(timer);
    };
}, [showStats]);

    const siteName = siteSettings.site_name || 'Zurui';
    const logoColor = siteSettings.logo_color || '#ef4444';
    const LogoIcon = LOGO_ICON_MAP[siteSettings.logo_icon || 'cat'] || Cat;
    let splitIndex = Math.ceil(siteName.length / 2);
    if (siteName.includes(' ')) splitIndex = siteName.indexOf(' ');
    const firstHalf = siteName.slice(0, splitIndex);
    const secondHalf = siteName.slice(splitIndex).trim();

    const footerDescription = siteSettings.footer_description
        || `${siteName} adalah tempat terbaik untuk streaming anime sub Indo dengan kualitas HD secara gratis. Nikmati update episode terbaru setiap harinya.`;
    const footerCopyright = siteSettings.footer_copyright
        || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
    const footerCredit = siteSettings.footer_credit || 'Dibuat dengan ❤ untuk wibu.';

    const navLinks = Array.isArray(siteSettings.nav_links) && siteSettings.nav_links.length > 0
        ? siteSettings.nav_links
        : [
            { label: 'Beranda', href: '/' },
            { label: 'Daftar Anime', href: '/explore' },
            { label: 'Jadwal Rilis', href: '/schedule' },
            { label: 'Request Anime', href: '/request' },
        ];
    const legalLinks = Array.isArray(siteSettings.legal_links) && siteSettings.legal_links.length > 0
        ? siteSettings.legal_links
        : [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'DMCA', href: '/dmca' },
            { label: 'Kontak Kami', href: '/contact' },
        ];
    return (
        <footer className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-t border-white/80 dark:border-white/10 mt-16 py-12 relative z-20 overflow-hidden">
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl"></div>
            <div className="pointer-events-none absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <LogoIcon className="w-8 h-8" style={{ color: logoColor }} />
                            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">{firstHalf}<span style={{ color: logoColor }}>{secondHalf}</span></span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
                            {footerDescription}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {siteSettings.social_facebook && (
                                <a href={siteSettings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-fuchsia-500 transition"><Facebook className="w-5 h-5" /></a>
                            )}
                            {siteSettings.social_twitter && (
                                <a href={siteSettings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-fuchsia-500 transition"><Twitter className="w-5 h-5" /></a>
                            )}
                            {siteSettings.social_instagram && (
                                <a href={siteSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-fuchsia-500 transition"><Instagram className="w-5 h-5" /></a>
                            )}
                            {!siteSettings.social_facebook && !siteSettings.social_twitter && !siteSettings.social_instagram && (<>
                                <a href="#" className="text-slate-400 hover:text-fuchsia-500 transition"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-fuchsia-500 transition"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-fuchsia-500 transition"><Instagram className="w-5 h-5" /></a>
                            </>)}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4">Navigasi</h3>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            {navLinks.map((link, i) => (
                                <li key={i}><a href={link.href} className="hover:text-fuchsia-500 transition font-medium">{link.label}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            {legalLinks.map((link, i) => (
                                <li key={i}><a href={link.href} className="hover:text-fuchsia-500 transition font-medium">{link.label}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/80 dark:border-white/10 mt-10 pt-8 text-center flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-3">
                    <p>{footerCopyright}</p>
                    {showStats && (
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                                <span>{stats.online.toLocaleString('id-ID')} online</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Users className="w-3 h-3" />
                                <span>{stats.total.toLocaleString('id-ID')} pengunjung</span>
                            </span>
                        </div>
                    )}
                    <p className="mt-2 md:mt-0 flex items-center justify-center gap-1">{footerCredit}</p>
                </div>
            </div>

            {/* Footer Character Image */}
            {siteSettings.footer_image && (
                <div className="absolute right-0 bottom-0 pointer-events-none select-none z-10 opacity-60 dark:opacity-40 hidden lg:block">
                    <img
                        src={siteSettings.footer_image}
                        alt="Footer Mascot"
                        className="h-64 md:h-80 object-contain object-bottom transition-all duration-700 hover:scale-105 hover:opacity-100"
                    />
                </div>
            )}
        </footer>
    );
}
