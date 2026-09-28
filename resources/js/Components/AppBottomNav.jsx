import { Link, usePage } from '@inertiajs/react';
import { Home, Sparkles, Library, BookOpen } from 'lucide-react';

export default function AppBottomNav() {
    const { url } = usePage();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Manga', href: '/manga', icon: BookOpen },
        { name: 'Anime', href: '/explore', icon: Sparkles },
        { name: 'Library', href: '/library', icon: Library },
    ];

    return (
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-50">
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/70 dark:border-white/10 bg-white/85 dark:bg-slate-950/80 backdrop-blur-2xl shadow-2xl shadow-fuchsia-900/10 flex justify-around items-center h-[68px] px-2">
                <div className="absolute inset-x-8 -top-10 h-16 bg-gradient-to-r from-fuchsia-400/25 via-cyan-400/25 to-amber-300/25 blur-2xl"></div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = url === item.href || url.startsWith(item.href !== '/' ? item.href : '/___impossible');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${isActive ? 'text-fuchsia-600 dark:text-fuchsia-300 -translate-y-0.5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            {isActive && <span className="absolute top-2 h-1 w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"></span>}
                            <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow' : ''}`} strokeWidth={isActive ? 2.7 : 2} />
                            <span className="text-[10px] font-bold">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
