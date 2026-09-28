import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AdminProfileModal from '@/Components/Admin/AdminProfileModal';
import {
    LayoutDashboard, Film, PlaySquare, Tag, Users, Users2, Menu, X, Settings,
    ChevronRight, ChevronDown, LogOut, Bell, ExternalLink, Zap, Key,
    Cat, Flame, Star, Heart, Tv, Play, Moon, Crown, Eye, Compass, Sparkles,
    Sword, Shield, Ghost, Skull, Wand2, Rabbit, Bird, Fish, Squirrel, Bug,
    Rocket, Atom, Book, BookOpen, Gamepad2, Joystick, Music, Mic, Video, Camera,
    Coffee, Pizza, Cherry, Hexagon, Diamond, Leaf, Sun, FileText, AlertTriangle,
    ArrowUpCircle, Megaphone, ClipboardList, FileWarning
} from 'lucide-react';

const LOGO_ICON_MAP = { cat: Cat, flame: Flame, star: Star, zap: Zap, heart: Heart, tv: Tv, play: Play, moon: Moon, crown: Crown, eye: Eye, compass: Compass, sparkles: Sparkles, sword: Sword, shield: Shield, ghost: Ghost, skull: Skull, wand2: Wand2, rabbit: Rabbit, bird: Bird, fish: Fish, squirrel: Squirrel, bug: Bug, rocket: Rocket, atom: Atom, sun: Sun, video: Video, camera: Camera, music: Music, mic: Mic, gamepad2: Gamepad2, joystick: Joystick, book: Book, bookopen: BookOpen, coffee: Coffee, pizza: Pizza, cherry: Cherry, hexagon: Hexagon, diamond: Diamond, leaf: Leaf };

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/admin',
        routeName: 'admin.dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Anime',
        href: '/admin/anime',
        routeName: 'admin.anime.index',
        icon: Film,
        subItems: [
            { label: 'Semua Anime', href: '/admin/anime', routeMatch: '/admin/anime' },
            { label: 'Cek Episode Massal', href: '/admin/anime-mass-update', routeMatch: '/admin/anime-mass-update' },
        ],
    },
    {
        label: 'Karakter',
        href: '/admin/characters',
        routeName: 'admin.character.index',
        icon: Users2,
    },
    {
        label: 'Manga',
        href: '/admin/manga',
        routeName: 'admin.manga.index',
        icon: BookOpen,
        subItems: [
            { label: 'Semua Manga', href: '/admin/manga', routeMatch: 'admin.manga.index' },
            { label: 'Import Manga', href: '/admin/manga-importer', routeMatch: 'admin.manga.importer' },
            { label: 'Cek Chapter Massal', href: '/admin/manga-mass-check', routeMatch: 'admin.manga.mass-check' },
            { label: 'Log Gagal', href: '/admin/manga-mass-check#log-gagal', routeMatch: 'admin.manga.mass-check.logs' },
        ]
    },
    {
        label: 'Episode',
        href: '/admin/episodes',
        routeName: 'admin.episode.index',
        icon: PlaySquare,
    },
    {
        label: 'Genre',
        href: '/admin/genres',
        routeName: 'admin.genre.index',
        icon: Tag,
    },
    {
        label: 'Users',
        href: '/admin/users',
        routeName: 'admin.user.index',
        icon: Users,
        subItems: [
            { label: 'All Users', href: '/admin/users', routeMatch: 'all' },
            { label: 'Premium', href: '/admin/users?badge=premium', routeMatch: 'premium' },
            { label: 'VIP', href: '/admin/users?badge=vip', routeMatch: 'vip' },
            { label: 'Regular', href: '/admin/users?badge=regular', routeMatch: 'regular' },
        ]
    },
    {
        label: 'Pages',
        href: '/admin/pages',
        routeName: 'admin.page.index',
        icon: FileText,
    },
    {
        label: 'Reports',
        href: '/admin/reports',
        routeName: 'admin.report.index',
        icon: AlertTriangle,
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        routeName: 'admin.settings.index',
        icon: Settings,
    },
    {
        label: 'Pengaturan Iklan',
        href: '/admin/ads',
        routeName: 'admin.ads.index',
        icon: Megaphone,
    },
];

function Sidebar({ isOpen, onClose, currentRoute }) {
    const { url, props } = usePage();
    const currentUrlParams = new URLSearchParams(url.split('?')[1]);
    const currentBadge = currentUrlParams.get('badge') || 'all';

    const siteName = props.siteSettings?.site_name || 'Zurui';
    let splitIndex = Math.ceil(siteName.length / 2);
    if (siteName.includes(' ')) {
        splitIndex = siteName.indexOf(' ');
    }
    const firstHalf = siteName.slice(0, splitIndex);
    const secondHalf = siteName.slice(splitIndex).trim();
    const logoIconName = props.siteSettings?.logo_icon || 'cat';
    const logoColor = props.siteSettings?.logo_color || '#ef4444';
    const logoImage = props.siteSettings?.logo_image;
    const LogoIcon = LOGO_ICON_MAP[logoIconName] || Cat;

    // Auto expand menu if any subItem matches
    const [expandedMenus, setExpandedMenus] = useState(() => {
        const initialState = {};
        NAV_ITEMS.forEach(item => {
            if (item.subItems) {
                const isParentActive = currentRoute === item.routeName ||
                    (item.routeName !== 'admin.dashboard' && currentRoute?.startsWith(item.routeName.replace('.index', '')));
                initialState[item.label] = isParentActive;
            }
        });
        return initialState;
    });

    const toggleMenu = (label) => {
        setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
                    bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:z-auto`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <Link href="/" className="flex items-center gap-2.5 group overflow-hidden">
                        {logoImage ? (
                            <img src={logoImage} alt={siteName} className="h-8 w-auto object-contain shrink-0" />
                        ) : (
                            <>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shrink-0" style={{ backgroundColor: logoColor, boxShadow: `0 4px 10px ${logoColor}4d` }}>
                                    <LogoIcon size={16} className="text-white" />
                                </div>
                                <div className="min-w-0 flex whitespace-nowrap">
                                    <span className="text-slate-900 dark:text-white font-bold text-base tracking-wide">{firstHalf}</span>
                                    <span className="font-bold text-base tracking-wide" style={{ color: logoColor }}>{secondHalf}</span>
                                </div>
                            </>
                        )}
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wider shrink-0" style={{ backgroundColor: `${logoColor}1a`, color: logoColor }}>
                            ADMIN
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <div className="px-3 py-1 mb-2">
                        <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                            Menu Utama
                        </span>
                    </div>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentRoute === item.routeName ||
                            (item.routeName !== 'admin.dashboard' && currentRoute?.startsWith(item.routeName.replace('.index', '')));

                        const isExpanded = expandedMenus[item.label] || false;

                        return (
                            <div key={item.label}>
                                {item.subItems ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                                            ${isActive
                                                ? 'bg-red-50 text-[#ff2e2e]'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800'
                                            }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={`shrink-0 transition-colors ${isActive ? 'text-[#ff2e2e]' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-300'}`}
                                        />
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${isActive ? 'text-[#ff2e2e]' : 'text-slate-400'}`} />
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                                            ${isActive
                                                ? 'bg-red-50 text-[#ff2e2e]'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800'
                                            }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={`shrink-0 transition-colors ${isActive ? 'text-[#ff2e2e]' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-300'}`}
                                        />
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <ChevronRight size={14} className="text-[#ff2e2e] shrink-0" />
                                        )}
                                    </Link>
                                )}

                                {/* SubItems Dropdown */}
                                {item.subItems && isExpanded && (
                                    <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-1">
                                        {item.subItems.map((sub) => {
                                            const isSubActive = sub.routeMatch === 'admin.manga.mass-check'
                                                ? currentRoute === 'admin.manga.mass-check' && !url.includes('#log-gagal')
                                                : sub.routeMatch === 'admin.manga.mass-check.logs'
                                                    ? currentRoute === 'admin.manga.mass-check' && url.includes('#log-gagal')
                                                    : isActive && currentBadge === sub.routeMatch;
                                            return (
                                                <Link
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={onClose}
                                                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                                                        ${isSubActive
                                                            ? 'text-[#ff2e2e] bg-red-50/50'
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:bg-slate-950'
                                                        }`}
                                                >
                                                    {sub.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 transition-all group"
                    >
                        <ExternalLink size={16} className="text-slate-400 group-hover:text-slate-600 dark:text-slate-300" />
                        <span>Lihat Website</span>
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group"
                    >
                        <LogOut size={16} className="text-slate-400 group-hover:text-red-500" />
                        <span>Logout</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}

export default function AdminLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [flashMsg, setFlashMsg] = useState(null);
    const [theme, setTheme] = useState('light');

    // Theme setup
    useEffect(() => {
        const stored = localStorage.getItem('theme') || 'light';
        setTheme(stored);
        if (stored === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };
    const currentRoute = usePage().component;

    // Map component path to route name
    const componentToRoute = {
        'Admin/Dashboard': 'admin.dashboard',
        'Admin/Anime/Index': 'admin.anime.index',
        'Admin/Anime/Create': 'admin.anime.create',
        'Admin/Anime/Edit': 'admin.anime.edit',
        'Admin/Episode/Index': 'admin.episode.index',
        'Admin/Episode/Create': 'admin.episode.create',
        'Admin/Episode/Edit': 'admin.episode.edit',
        'Admin/Manga/Index': 'admin.manga.index',
        'Admin/Manga/Create': 'admin.manga.create',
        'Admin/Manga/Edit': 'admin.manga.edit',
        'Admin/Manga/Import': 'admin.manga.importer',
        'Admin/Manga/MassCheck': 'admin.manga.mass-check',
        'Admin/Manga/Chapters/Index': 'admin.manga.chapters.index',
        'Admin/Genre/Index': 'admin.genre.index',
        'Admin/Users/Index': 'admin.user.index',
        'Admin/Reports/Index': 'admin.report.index',
        'Admin/Settings/Index': 'admin.settings.index',
        'Admin/License/Index': 'admin.license.index',
        'Admin/Updater/Index': 'admin.updater.index',
    };

    const activeRoute = componentToRoute[currentRoute] || '';

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashMsg({ type: flash.success ? 'success' : 'error', message: flash.success || flash.error });
            const t = setTimeout(() => setFlashMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    const pageTitle = title || currentRoute?.split('/').pop()?.replace(/([A-Z])/g, ' $1').trim();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentRoute={activeRoute}
            />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
                {/* Top Header */}
                <header className="sticky top-0 z-20 h-16 bg-white dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 px-4 lg:px-6 shrink-0">
                    {/* Mobile menu */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors p-1"
                    >
                        <Menu size={22} />
                    </button>

                    {/* Page title */}
                    <div className="flex items-center gap-2 min-w-0">
                        <h1 className="text-slate-900 dark:text-white font-semibold text-base truncate">{pageTitle}</h1>
                    </div>

                    <div className="flex-1" />

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} type="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all size-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 mx-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                        </button>
                        {/* Notification bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setNotificationOpen(!notificationOpen)}
                                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors relative group"
                                title="Laporan Masalah"
                            >
                                <Bell size={16} className={`transition-colors ${notificationOpen ? 'text-red-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-red-500'}`} />
                                {usePage().props.pendingReports.count > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-[#ff2e2e] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                                        {usePage().props.pendingReports.count > 99 ? '99+' : usePage().props.pendingReports.count}
                                    </span>
                                )}
                            </button>

                            {notificationOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                                            <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-2 py-0.5 rounded-full uppercase">
                                                {usePage().props.pendingReports.count} New
                                            </span>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto">
                                            {usePage().props.pendingReports.recent.length > 0 ? (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {usePage().props.pendingReports.recent.map((rpt) => (
                                                        <Link 
                                                            key={rpt.id}
                                                            href="/admin/reports"
                                                            onClick={() => setNotificationOpen(false)}
                                                            className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors"
                                                        >
                                                            <img 
                                                                src={rpt.user.avatar_url || `https://ui-avatars.com/api/?name=${rpt.user.name}&background=random`} 
                                                                className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700" 
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-sm text-slate-900 dark:text-white font-semibold flex items-center gap-1.5">
                                                                    {rpt.user.name}
                                                                    <span className="text-[10px] font-medium text-slate-400">• {new Date(rpt.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                                    Melaporkan: <span className="text-red-500 font-medium">{rpt.type}</span>
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-1">"{rpt.message || 'Tanpa pesan..."'}</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-12 px-4 text-center">
                                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                        <Bell size={20} className="text-slate-400" />
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">No new notifications</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kami akan memberitahu Anda saat ada laporan baru.</p>
                                                </div>
                                            )}
                                        </div>
                                        <Link 
                                            href="/admin/reports"
                                            onClick={() => setNotificationOpen(false)}
                                            className="block py-3 text-center text-xs font-bold text-red-500 hover:text-red-600 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors"
                                        >
                                            View All Reports
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User avatar */}
                        {/* User avatar with dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700 text-left cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#ff2e2e]/20 overflow-hidden"
                                    style={(!auth?.user?.avatar_url) ? { background: 'linear-gradient(to bottom right, #ff2e2e, #ff6b2e)' } : {}}
                                >
                                    {auth?.user?.avatar_url ? (
                                        <img src={auth.user.avatar_url.startsWith('http') ? auth.user.avatar_url : `/storage/${auth.user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        auth?.user?.name?.[0]?.toUpperCase() || 'A'
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-none">{auth?.user?.name || 'Admin'}</p>
                                    <p className="text-slate-400 text-xs mt-0.5">Administrator</p>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 py-2 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{auth?.user?.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{auth?.user?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setProfileModalOpen(true);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-950 hover:text-slate-900 dark:text-white transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            Pengaturan Profil
                                        </button>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                            Keluar
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash messages */}
                {flashMsg && (
                    <div className={`mx-4 lg:mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2
                        ${flashMsg.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border border-red-200 text-red-600'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${flashMsg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {flashMsg.message}
                    </div>
                )}

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>

                <AdminProfileModal
                    open={profileModalOpen}
                    onClose={() => setProfileModalOpen(false)}
                    user={auth?.user}
                />
            </div>
        </div>
    );
}
