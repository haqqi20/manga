import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import UserAvatar from './UserAvatar';
import { Search, Compass, Flame, Library, SlidersHorizontal, ArrowRight, X, Bell, LogOut, Home, Cat, Star, Zap, Heart, Tv, Play, Moon, Crown, Eye, Sparkles, Sword, Shield, Ghost, Skull, Wand2, Rabbit, Bird, Fish, Squirrel, Bug, Rocket, Atom, Book, BookOpen, Gamepad2, Joystick, Music, Mic, Video, Camera, Coffee, Pizza, Cherry, Hexagon, Diamond, Leaf, Sun, Clapperboard, UserCircle, Trophy, LayoutDashboard } from 'lucide-react';

const LOGO_ICON_MAP = { cat: Cat, flame: Flame, star: Star, zap: Zap, heart: Heart, tv: Tv, play: Play, moon: Moon, crown: Crown, eye: Eye, compass: Compass, sparkles: Sparkles, sword: Sword, shield: Shield, ghost: Ghost, skull: Skull, wand2: Wand2, rabbit: Rabbit, bird: Bird, fish: Fish, squirrel: Squirrel, bug: Bug, rocket: Rocket, atom: Atom, sun: Sun, video: Video, camera: Camera, music: Music, mic: Mic, gamepad2: Gamepad2, joystick: Joystick, book: Book, bookopen: BookOpen, coffee: Coffee, pizza: Pizza, cherry: Cherry, hexagon: Hexagon, diamond: Diamond, leaf: Leaf };

export default function Navbar() {
    const { url } = usePage();
    const { auth } = usePage().props;

    // Customizable Logo Settings
    const siteName = usePage().props.siteSettings?.site_name || 'Zurui';
    let splitIndex = Math.ceil(siteName.length / 2);
    if (siteName.includes(' ')) splitIndex = siteName.indexOf(' ');
    const logoText1 = siteName.slice(0, splitIndex);
    const logoText2 = siteName.slice(splitIndex).trim();
    const logoIconName = usePage().props.siteSettings?.logo_icon || 'cat';
    const logoColor = usePage().props.siteSettings?.logo_color || '#ef4444';
    const LogoIcon = LOGO_ICON_MAP[logoIconName] || Cat;
    const [searchOpen, setSearchOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchShow, setSearchShow] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);


    // For mobile search tabs
    const [activeTab, setActiveTab] = useState('search');

    const searchInputRef = useRef(null);

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

    // Outside clicks handlers setup
    const navRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setSearchShow(false);
                setFilterOpen(false);
                setUserOpen(false);
                setNotificationsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 0) {
            setSearchShow(false);
            router.get('/explore', { search: searchQuery });
        }
    };

    // Debounced search suggestions
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setSearchShow(false);
            return;
        }
        const timer = setTimeout(() => {
            setSearchLoading(true);
            fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
                .then(r => r.json())
                .then(data => {
                    setSearchResults(data);
                    setSearchShow(true);
                    setSearchLoading(false);
                })
                .catch(() => setSearchLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <header ref={navRef} className="pl-4 lg:pl-0 flex min-h-16 h-max shrink-0 items-center gap-2 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 top-0 z-[49] sm:z-[49] sticky left-0 w-full transition-colors duration-300">
            <div className="flex gap-2 items-center justify-between w-full lg:container lg:mx-auto">

                {/* Desktop Nav & Logo */}
                <div className="lg:flex hidden items-center gap-2 px-3 xl:gap-24 min-w-0">
                    <Link className="flex items-center gap-2" href="/">
                        <LogoIcon className="w-8 h-8 drop-shadow" style={{ color: logoColor }} />
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            {logoText1}<span style={{ color: logoColor }}>{logoText2}</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-2 min-w-0">
                        <nav className="hidden lg:flex items-center flex-wrap gap-6 ml-2">
                            <Link className={`relative inline-flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors ${url === '/' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`} href="/">
                                <Home className="h-4 w-4" />
                                <span>Home</span>
                                {url === '/' && <span className="absolute -bottom-[6px] left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"></span>}
                            </Link>
                            <Link className={`relative inline-flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors ${url.startsWith('/manga') ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`} href="/manga">
                                <BookOpen className="h-4 w-4" />
                                <span>Manga</span>
                                {url.startsWith('/manga') && <span className="absolute -bottom-[6px] left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"></span>}
                            </Link>
                            <Link className={`relative inline-flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors ${url.startsWith('/explore') ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`} href="/explore">
                               <Sparkles className="h-4 w-4" />
                               <span>Anime</span>
                               {url.startsWith('/explore') && <span className="absolute -bottom-[6px] left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"></span>}
                           </Link>
                            <Link className={`relative inline-flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors ${url.startsWith('/library') ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'}`} href="/library">
                                <Library className="h-4 w-4" />
                                <span>Library</span>
                                {url.startsWith('/library') && <span className="absolute -bottom-[6px] left-1/2 h-[2px] w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400"></span>}
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Mobile Logo */}
                <div className="block lg:hidden">
                    <Link className="flex items-center gap-2" href="/">
                        <LogoIcon className="w-8 h-8 drop-shadow" style={{ color: logoColor }} />
                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                            {logoText1}<span style={{ color: logoColor }}>{logoText2}</span>
                        </span>
                    </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2 mr-3 lg:mr-0 z-50">

                    {/* Desktop Search Bar */}
                    <div className="hidden lg:flex items-center gap-2">
                        <div className="relative group hidden lg:block">
                            <form onSubmit={performSearch} className="relative flex items-center">
                                <Search className="absolute left-4 text-gray-400 h-4 w-4" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    type="text"
                                    name="search"
                                    placeholder="Search anime..."
                                    className="w-[300px] bg-slate-100/80 dark:bg-white/5 border border-transparent focus:border-fuchsia-400 focus:bg-white dark:bg-slate-900 transition-all rounded-full py-2 pl-10 pr-10 text-sm outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                    autoComplete="off"
                                />
                                <button type="submit" className="absolute right-2 p-1 rounded-full text-gray-400 hover:text-fuchsia-500 hover:bg-gray-200 transition-colors">
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </form>

                            {/* Desktop Search Suggestions Dropdown */}
                            {searchShow && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    {searchLoading ? (
                                        <div className="px-4 py-5 text-center text-sm text-gray-400">Mencari...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="px-4 py-5 text-center text-sm text-gray-400">Tidak ada hasil untuk "{searchQuery}"</div>
                                    ) : (
                                        <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={`${result.category}-${result.id}`}
                                                    href={result.url}
                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                                    onClick={() => { setSearchShow(false); setSearchQuery(''); }}
                                                >
                                                    <div className="relative shrink-0">
                                                        <img
                                                            src={result.poster || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=0ea5e9&color=fff`}
                                                            alt={result.title}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=0ea5e9&color=fff`; }}
                                                            className="w-9 h-12 object-cover rounded-md bg-gray-100 dark:bg-slate-700"
                                                        />
                                                        <span className={`absolute -top-1 -right-1 px-1 py-0.5 rounded text-[8px] font-black text-white uppercase
                                                            ${result.category === 'manga' ? 'bg-indigo-600' : 'bg-sky-600'}`}>
                                                            {result.category}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{result.title}</p>
                                                        <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 truncate">
                                                            {[result.type, ...result.genres].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    <Link
                                        href={`/explore?search=${encodeURIComponent(searchQuery)}`}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-medium text-fuchsia-500 dark:text-fuchsia-300 transition-colors border-t border-gray-100 dark:border-slate-700"
                                        onClick={() => setSearchShow(false)}
                                    >
                                        <Search className="h-3.5 w-3.5" />
                                        Lihat semua hasil untuk "<span className="font-semibold">{searchQuery}</span>"
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Filter Dropdown (Desktop) */}
                        <div className="relative">
                            <button onClick={() => setFilterOpen(!filterOpen)} type="button" className="inline-flex items-center justify-center size-10 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-slate-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors">
                                <SlidersHorizontal className="h-5 w-5" />
                            </button>

                            {filterOpen && (
                                <div className="absolute top-full mt-2 right-0 w-[320px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <form action="/explore" method="GET" className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Sort By</label>
                                            <select name="sort" className="w-full h-10 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/40">
                                                <option value="latest">Latest</option>
                                                <option value="popular">Most Popular</option>
                                                <option value="rating">Highest Rating</option>
                                                <option value="title">Title (A-Z)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Status</label>
                                            <select name="status" className="w-full h-10 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200 px-3 focus:outline-none focus:ring-2 focus:ring-red-500/40">
                                                <option value="all">All Status</option>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Hiatus">Hiatus</option>
                                            </select>
                                        </div>
                                        <button type="submit" className="w-full bg-fuchsia-600 text-white rounded-lg h-10 text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-colors mt-2">
                                            Apply Filters
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Toggle */}
                    <button onClick={() => setSearchOpen(!searchOpen)} type="button" className="lg:hidden inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all size-9 w-9 h-9 rounded-xl border border-transparent hover:border-gray-200 dark:border-slate-700 hover:bg-slate-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                        <Search className="h-5 w-5" />
                    </button>

                    {/* Search Dropdown Content (Mobile Only) */}
                    <div className={`lg:hidden fixed left-0 right-0 z-[50] top-16 origin-top overflow-hidden transition-all duration-300 ease-out ${searchOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                        <div className="backdrop-blur-xl border-b shadow-2xl bg-white dark:bg-slate-900/95 border-gray-200 dark:border-slate-700">
                            <div className="px-4 pt-4 pb-5 container mx-auto">
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center border-b border-gray-200 dark:border-slate-700">
                                        <button onClick={() => setActiveTab('search')} className={`flex-1 py-1.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'search' ? 'text-gray-900 dark:text-white border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}>
                                            <Search className="w-4 h-4" /> Fast Search
                                        </button>
                                        <button onClick={() => setActiveTab('filter')} className={`flex-1 py-1.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'filter' ? 'text-gray-900 dark:text-white border-b-2 border-red-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}>
                                            <SlidersHorizontal className="w-4 h-4" /> Filter Detail
                                        </button>
                                    </div>

                                    {activeTab === 'search' && (
                                        <div className="mt-4 relative animate-in fade-in zoom-in duration-200">
                                            <form onSubmit={performSearch} className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    ref={searchInputRef}
                                                    type="text"
                                                    name="search"
                                                    className="w-full rounded-xl pl-11 pr-14 h-12 bg-slate-100/80 dark:bg-white/5 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:text-gray-400 focus-visible:ring-2 focus-visible:ring-red-500/40 outline-none"
                                                    placeholder="Search anime by title..."
                                                />
                                                <button type="button" onClick={() => { setSearchQuery(''); searchInputRef.current?.focus() }} className={`absolute right-12 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-200 transition inline-flex items-center justify-center ${searchQuery.length > 0 ? 'flex' : 'hidden'}`}>
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg border border-gray-200 dark:border-slate-700 bg-fuchsia-600 text-white hover:bg-red-700 flex items-center justify-center">
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </form>

                                            {/* Mobile Search Suggestions */}
                                            {searchShow && (
                                                <div className="mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                                                    {searchLoading ? (
                                                        <div className="px-4 py-5 text-center text-sm text-gray-400">Mencari...</div>
                                                    ) : searchResults.length === 0 ? (
                                                        <div className="px-4 py-5 text-center text-sm text-gray-400">Tidak ada hasil untuk "{searchQuery}"</div>
                                                    ) : (
                                                        <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                                                            {searchResults.map((result) => (
                                                                <Link
                                                                    key={`${result.category}-${result.id}`}
                                                                    href={result.url}
                                                                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                                                    onClick={() => { setSearchShow(false); setSearchOpen(false); setSearchQuery(''); }}
                                                                >
                                                                    <div className="relative shrink-0">
                                                                        <img
                                                                            src={result.poster || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=0ea5e9&color=fff`}
                                                                            alt={result.title}
                                                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.title)}&background=0ea5e9&color=fff`; }}
                                                                            className="w-9 h-12 object-cover rounded-md bg-gray-100 dark:bg-slate-700"
                                                                        />
                                                                        <span className={`absolute -top-1 -right-1 px-1 py-0.5 rounded text-[8px] font-black text-white uppercase
                                                                            ${result.category === 'manga' ? 'bg-indigo-600' : 'bg-sky-600'}`}>
                                                                            {result.category}
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{result.title}</p>
                                                                        <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 truncate">
                                                                            {[result.type, ...result.genres].filter(Boolean).join(', ')}
                                                                        </p>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <Link
                                                        href={`/explore?search=${encodeURIComponent(searchQuery)}`}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-medium text-fuchsia-500 dark:text-fuchsia-300 transition-colors border-t border-gray-100 dark:border-slate-700"
                                                        onClick={() => { setSearchShow(false); setSearchOpen(false); }}
                                                    >
                                                        <Search className="h-3.5 w-3.5" />
                                                        Lihat semua hasil untuk "<span className="font-semibold">{searchQuery}</span>"
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'filter' && (
                                        <div className="mt-4 animate-in fade-in zoom-in duration-200">
                                            <form action="/explore" method="GET" className="flex flex-col gap-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Sort By</label>
                                                        <select name="sort" className="w-full h-10 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200 px-3 outline-none focus:ring-2 focus:ring-red-500/40">
                                                            <option value="latest">Latest</option>
                                                            <option value="popular">Most Popular</option>
                                                            <option value="rating">Highest Rating</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Status</label>
                                                        <select name="status" className="w-full h-10 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-sm text-gray-700 dark:text-gray-200 px-3 outline-none focus:ring-2 focus:ring-red-500/40">
                                                            <option value="all">All Status</option>
                                                            <option value="Ongoing">Ongoing</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Hiatus">Hiatus</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full bg-fuchsia-600 text-white rounded-lg h-10 text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 mt-2 transition-colors">
                                                    Apply Filters
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    <button onClick={toggleTheme} type="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all size-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                    </button>
                    {/* Notification Bell */}
                    {auth?.user?.is_admin && (
                        <div className="relative hidden lg:block">
                            <button 
                                onClick={() => setNotificationsOpen(!notificationsOpen)} 
                                className="inline-flex items-center justify-center size-10 relative rounded-full hover:bg-slate-100/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 transition-colors relative group"
                            >
                                <Bell className={`h-5 w-5 transition-colors ${notificationsOpen ? 'text-fuchsia-500' : 'group-hover:text-fuchsia-500'}`} />
                                {usePage().props.pendingReports?.count > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-[#ff2e2e] text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 shadow-sm animate-pulse">
                                        {usePage().props.pendingReports.count > 99 ? '99+' : usePage().props.pendingReports.count}
                                    </span>
                                )}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Admin Notifications</h3>
                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-gradient-to-r from-fuchsia-500 to-cyan-400/10 dark:text-fuchsia-300 px-2 py-0.5 rounded-full uppercase">
                                            {usePage().props.pendingReports?.count || 0} New
                                        </span>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto">
                                        {usePage().props.pendingReports?.recent?.length > 0 ? (
                                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                                {usePage().props.pendingReports.recent.map((rpt) => (
                                                    <Link 
                                                        key={rpt.id}
                                                        href="/admin/reports"
                                                        onClick={() => setNotificationsOpen(false)}
                                                        className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-slate-950/50 transition-colors"
                                                    >
                                                        <img 
                                                            src={rpt.user.avatar_url || `https://ui-avatars.com/api/?name=${rpt.user.name}&background=random`} 
                                                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-slate-700" 
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-gray-900 dark:text-white font-semibold flex items-center gap-1.5">
                                                                {rpt.user.name}
                                                                <span className="text-[10px] font-medium text-gray-400">• {new Date(rpt.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                                                Melaporkan: <span className="text-fuchsia-500 font-medium">{rpt.type}</span>
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">"{rpt.message || 'Tanpa pesan..."'}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Bell className="w-6 h-6 text-gray-400 opacity-50" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">No new notifications</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laporan dari user akan muncul di sini.</p>
                                            </div>
                                        )}
                                    </div>
                                    <Link 
                                        href="/admin/reports"
                                        onClick={() => setNotificationsOpen(false)}
                                        className="block py-3 text-center text-xs font-bold text-fuchsia-500 hover:text-red-600 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-950 border-t border-gray-100 dark:border-slate-800 transition-colors"
                                    >
                                        View All Reports
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Profile / Login */}
                    <div className="relative">
                        {auth && auth.user ? (
                            <>
                                <button onClick={() => setUserOpen(!userOpen)} type="button" className="flex items-center rounded-full focus:outline-none relative ml-2 pb-3">
                                    <UserAvatar user={auth.user} sizeClass="w-8 h-8 md:w-10 md:h-10" />
                                </button>
                                {userOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex flex-col items-start gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[100px]">{auth.user.name}</p>
                                                {auth.user.badge === 'vip' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white relative overflow-hidden group shrink-0">
                                                        <span className="relative z-10">VIP</span>
                                                        <div className="absolute inset-0 w-full h-full pointer-events-none animate-vip-sheen" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
                                                    </span>
                                                )}
                                                {auth.user.badge === 'premium' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white relative overflow-hidden group shrink-0">
                                                        <span className="relative z-10">PRO</span>
                                                        <div className="absolute inset-0 w-full h-full pointer-events-none animate-vip-sheen" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
                                                    </span>
                                                )}
                                                {auth.user.badge === 'developer' && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white relative overflow-hidden group shrink-0">
                                                        <span className="relative z-10">DEV</span>
                                                        <div className="absolute inset-0 w-full h-full pointer-events-none animate-vip-sheen" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">{auth.user.email}</p>
                                        </div>
                                        {auth.user.username && (
                                            <Link
                                                href={`/u/${auth.user.username}`}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium transition-colors"
                                            >
                                                <UserCircle className="w-4 h-4" /> Profil Saya
                                            </Link>
                                        )}
                                        <Link
                                            href="/leaderboard"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            <Trophy className="w-4 h-4" /> Leaderboard
                                        </Link>
                                        <a
                                            href={auth.user.is_admin ? "/admin" : "/dashboard"}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.location.href = auth.user.is_admin ? "/admin" : "/dashboard";
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 font-medium transition-colors"
                                        >
                                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                                        </a>
                                        <Link href="/logout" method="post" as="button" className="flex w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors">
                                            <LogOut className="w-4 h-4 mr-2" /> Logout
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link href="/login" className="bg-fuchsia-600 hover:bg-red-700 ml-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition flex items-center shadow-lg shadow-red-500/20">
                                Masuk
                            </Link>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}
