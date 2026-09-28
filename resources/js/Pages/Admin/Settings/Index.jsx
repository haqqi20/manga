import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Save, Image as ImageIcon, Globe, Type, Cat, Flame, Star, Zap, Heart, Tv, Play, Moon, Crown, Eye, Compass, Sparkles, Palette, Sword, Shield, Ghost, Skull, Wand2, Rabbit, Bird, Fish, Squirrel, Bug, Rocket, Atom, Book, BookOpen, Gamepad2, Joystick, Music, Mic, Video, Camera, Coffee, Pizza, Cherry, Hexagon, Diamond, Leaf, Sun, AlignLeft, Copyright, LayoutTemplate, Navigation, Plus, Trash2, ChevronUp, ChevronDown, Facebook, Twitter, Instagram, Share2, Users, Link as LinkIcon, MessageSquare, KeyRound, Eye as EyeIcon, EyeOff, Search, ShieldCheck } from 'lucide-react';

const LOGO_ICONS = [
    // Animals
    { name: 'cat', label: 'Cat', component: Cat },
    { name: 'rabbit', label: 'Rabbit', component: Rabbit },
    { name: 'bird', label: 'Bird', component: Bird },
    { name: 'fish', label: 'Fish', component: Fish },
    { name: 'squirrel', label: 'Squirrel', component: Squirrel },
    { name: 'bug', label: 'Bug', component: Bug },
    // Action / Fantasy
    { name: 'flame', label: 'Flame', component: Flame },
    { name: 'zap', label: 'Zap', component: Zap },
    { name: 'sword', label: 'Sword', component: Sword },
    { name: 'shield', label: 'Shield', component: Shield },
    { name: 'skull', label: 'Skull', component: Skull },
    { name: 'ghost', label: 'Ghost', component: Ghost },
    { name: 'wand2', label: 'Wand', component: Wand2 },
    // Space / Sci-fi
    { name: 'rocket', label: 'Rocket', component: Rocket },
    { name: 'atom', label: 'Atom', component: Atom },
    { name: 'sun', label: 'Sun', component: Sun },
    { name: 'moon', label: 'Moon', component: Moon },
    { name: 'compass', label: 'Compass', component: Compass },
    // UI / Media
    { name: 'star', label: 'Star', component: Star },
    { name: 'heart', label: 'Heart', component: Heart },
    { name: 'crown', label: 'Crown', component: Crown },
    { name: 'sparkles', label: 'Sparkles', component: Sparkles },
    { name: 'eye', label: 'Eye', component: Eye },
    { name: 'play', label: 'Play', component: Play },
    { name: 'tv', label: 'TV', component: Tv },
    { name: 'video', label: 'Video', component: Video },
    { name: 'camera', label: 'Camera', component: Camera },
    { name: 'music', label: 'Music', component: Music },
    { name: 'mic', label: 'Mic', component: Mic },
    // Gaming
    { name: 'gamepad2', label: 'Gamepad', component: Gamepad2 },
    { name: 'joystick', label: 'Joystick', component: Joystick },
    // Misc
    { name: 'book', label: 'Book', component: Book },
    { name: 'bookopen', label: 'BookOpen', component: BookOpen },
    { name: 'coffee', label: 'Coffee', component: Coffee },
    { name: 'pizza', label: 'Pizza', component: Pizza },
    { name: 'cherry', label: 'Cherry', component: Cherry },
    { name: 'hexagon', label: 'Hexagon', component: Hexagon },
    { name: 'diamond', label: 'Diamond', component: Diamond },
    { name: 'leaf', label: 'Leaf', component: Leaf },
];

const PRESET_COLORS = [
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Teal', value: '#14b8a6' },
    { label: 'Green', value: '#22c55e' },
];

const DEFAULT_NAV_LINKS = [
    { label: 'Beranda', href: '/' },
    { label: 'Daftar Anime', href: '/explore' },
    { label: 'Jadwal Rilis', href: '/schedule' },
    { label: 'Request Anime', href: '/request' },
];
const DEFAULT_LEGAL_LINKS = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'DMCA', href: '/dmca' },
    { label: 'Kontak Kami', href: '/contact' },
];
const parseLinks = (val, defaults) => {
    if (Array.isArray(val) && val.length > 0) return val;
    if (typeof val === 'string') { try { const p = JSON.parse(val); if (Array.isArray(p)) return p; } catch { } }
    return defaults;
};

function LinkEditor({ links, onChange, title }) {
    const addLink = () => onChange([...links, { label: '', href: '' }]);
    const removeLink = (i) => onChange(links.filter((_, idx) => idx !== i));
    const updateLink = (i, field, val) => onChange(links.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
    const moveUp = (i) => {
        if (i === 0) return;
        const arr = [...links];
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        onChange(arr);
    };
    const moveDown = (i) => {
        if (i === links.length - 1) return;
        const arr = [...links];
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        onChange(arr);
    };
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h4>
                <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                >
                    <Plus size={13} /> Tambah Link
                </button>
            </div>
            {links.length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">Belum ada link. Klik "Tambah Link" untuk menambahkan.</p>
            )}
            {links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col gap-1 mr-1">
                        <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                            className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 transition-colors">
                            <ChevronUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveDown(i)} disabled={i === links.length - 1}
                            className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 transition-colors">
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <input
                        type="text"
                        value={link.label}
                        onChange={e => updateLink(i, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                    <input
                        type="text"
                        value={link.href}
                        onChange={e => updateLink(i, 'href', e.target.value)}
                        placeholder="URL (contoh: /explore)"
                        className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                    <button type="button" onClick={() => removeLink(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30">
                        <Trash2 size={15} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function Index({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        site_name: settings.site_name || '',
        site_slug: settings.site_slug || '',
        favicon: null,
        delete_favicon: false,
        error_404_image: null,
        delete_error_404_image: false,
        logo_icon: settings.logo_icon || 'cat',
        logo_color: settings.logo_color || '#ef4444',
        footer_description: settings.footer_description || '',
        footer_copyright: settings.footer_copyright || '',
        footer_credit: settings.footer_credit || '',
        nav_links: JSON.stringify(parseLinks(settings.nav_links, DEFAULT_NAV_LINKS)),
        legal_links: JSON.stringify(parseLinks(settings.legal_links, DEFAULT_LEGAL_LINKS)),
        footer_image: null,
        delete_footer_image: false,
        social_facebook: settings.social_facebook || '',
        social_twitter: settings.social_twitter || '',
        social_instagram: settings.social_instagram || '',
        show_visitor_stats: settings.show_visitor_stats ?? false,
        discord_enabled: settings.discord_enabled ?? false,
        discord_url: settings.discord_url || '',
        discord_title: settings.discord_title || '',
        discord_description: settings.discord_description || '',
        google_login_enabled: settings.google_login_enabled ?? false,
        google_client_id: settings.google_client_id || '',
        google_client_secret: settings.google_client_secret || '',
        hero_slider_enabled: settings.hero_slider_enabled ?? true,
        komiku_url: settings.komiku_url || 'https://komiku.org',
        novel_source_domain: settings.novel_source_domain || 'https://novel.kiryuuid.net',
        novel_api_url: settings.novel_api_url || 'https://novel.kiryuuid.net/wp-json/kiryuu/v1',
        novel_cover_hotlink: settings.novel_cover_hotlink ?? true,
        novel_chapter_mode: settings.novel_chapter_mode || 'live_api',
    });

    const [activeTab, setActiveTab] = useState('general');
    const [navLinks, setNavLinksState] = useState(() => parseLinks(settings.nav_links, DEFAULT_NAV_LINKS));
    const [legalLinks, setLegalLinksState] = useState(() => parseLinks(settings.legal_links, DEFAULT_LEGAL_LINKS));

    const updateNavLinks = (links) => { setNavLinksState(links); setData('nav_links', JSON.stringify(links)); };
    const updateLegalLinks = (links) => { setLegalLinksState(links); setData('legal_links', JSON.stringify(links)); };

    const [faviconPreview, setFaviconPreview] = useState(settings.favicon || null);
    const [error404Preview, setError404Preview] = useState(settings.error_404_image || null);
    const [footerImagePreview, setFooterImagePreview] = useState(settings.footer_image || null);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData({
                ...data,
                favicon: file,
                delete_favicon: false
            });
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const removeFavicon = () => {
        setData({
            ...data,
            favicon: null,
            delete_favicon: true
        });
        setFaviconPreview(null);
    };

    const handleError404Change = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData({
                ...data,
                error_404_image: file,
                delete_error_404_image: false
            });
            setError404Preview(URL.createObjectURL(file));
        }
    };

    const removeError404 = () => {
        setData({
            ...data,
            error_404_image: null,
            delete_error_404_image: true
        });
        setError404Preview(null);
    };

    const handleFooterImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData({
                ...data,
                footer_image: file,
                delete_footer_image: false
            });
            setFooterImagePreview(URL.createObjectURL(file));
        }
    };

    const removeFooterImage = () => {
        setData({
            ...data,
            footer_image: null,
            delete_footer_image: true
        });
        setFooterImagePreview(null);
    };

    return (
        <AdminLayout title="Site Settings">
            <Head title="Site Settings" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Info */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b pb-3 border-slate-200 dark:border-slate-700">
                        Site Settings
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Manage your website's identity, branding, and footer content.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    {[
                        { key: 'general', label: 'General', icon: Globe },
                        { key: 'footer', label: 'Footer', icon: LayoutTemplate },
                        { key: 'navigation', label: 'Navigasi', icon: Navigation },
                        { key: 'community', label: 'Community', icon: Users },
                        { key: 'auth', label: 'Auth', icon: KeyRound },
                        { key: 'scraper', label: 'Scraper', icon: Search },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all border-b-2 ${activeTab === key
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">

                        {/* â”€â”€ GENERAL TAB â”€â”€ */}
                        {activeTab === 'general' && (<>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Application Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Type className="w-4 h-4 text-indigo-500" />
                                        Application Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.site_name}
                                        onChange={(e) => setData('site_name', e.target.value)}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                        placeholder="Enter website name"
                                    />
                                    {errors.site_name && <p className="text-red-500 text-xs mt-1">{errors.site_name}</p>}
                                </div>

                                {/* Manga/Anime URL Prefix (Slug) */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Globe className="w-4 h-4 text-indigo-500" />
                                        Manga / Anime URL Prefix
                                    </label>
                                    <div className="flex items-center">
                                        <span className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 border-r-0 rounded-l-xl px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm h-full flex items-center justify-center">
                                            /
                                        </span>
                                        <input
                                            type="text"
                                            value={data.site_slug}
                                            onChange={(e) => setData('site_slug', e.target.value)}
                                            className="w-full border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all shadow-sm z-10"
                                            placeholder="series"
                                        />
                                        <span className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 border-l-0 rounded-r-xl px-4 py-2.5 text-slate-500 dark:text-slate-400 text-sm h-full flex items-center justify-center">
                                            /&#123;slug&#125;
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Default: series. Example: series will result in /series/your-slug</p>
                                    {errors.site_slug && <p className="text-red-500 text-xs mt-1">{errors.site_slug}</p>}
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Favicon Upload */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                                    Favicon
                                </label>

                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                                        {faviconPreview ? (
                                            <>
                                                <img src={faviconPreview} alt="Favicon Preview" className="w-8 h-8 object-contain transition-transform" />
                                                <button
                                                    type="button"
                                                    onClick={removeFavicon}
                                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="file"
                                            id="favicon"
                                            onChange={handleFaviconChange}
                                            accept=".png,.jpg,.jpeg,.ico,.svg"
                                            className="block w-full text-sm text-slate-500 dark:text-slate-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-600
                                            hover:file:bg-indigo-100 cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-400">Recommended size: 32x32px or 64x64px (.png, .ico, .svg)</p>
                                        {errors.favicon && <p className="text-red-500 text-xs mt-1">{errors.favicon}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* 404 Image Upload */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                                    <ImageIcon className="w-4 h-4 text-red-500" />
                                    Gambar Halaman 404 (Anime/Custom)
                                </label>

                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-20 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                                        {error404Preview ? (
                                            <>
                                                <img src={error404Preview} alt="404 Preview" className="w-full h-full object-cover transition-transform" />
                                                <button
                                                    type="button"
                                                    onClick={removeError404}
                                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </>
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="file"
                                            id="error_404_image"
                                            onChange={handleError404Change}
                                            accept=".png,.jpg,.jpeg,.webp,.svg"
                                            className="block w-full text-sm text-slate-500 dark:text-slate-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-red-50 file:text-red-600
                                            hover:file:bg-red-100 cursor-pointer"
                                        />
                                        <p className="text-xs text-slate-400">Gambar yang muncul saat halaman tidak ditemukan. Rekomendasi: 800x600px (.png, .webp)</p>
                                        {errors.error_404_image && <p className="text-red-500 text-xs mt-1">{errors.error_404_image}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Logo Icon & Color */}
                            <div className="space-y-5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    <Palette className="w-4 h-4 text-indigo-500" />
                                    Logo Icon &amp; Color
                                </label>

                                {/* Hero Slider Global Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30 text-white">
                                            <LayoutTemplate size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Hero Slider Beranda</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tampilkan atau sembunyikan slider anime di halaman depan.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('hero_slider_enabled', !data.hero_slider_enabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.hero_slider_enabled ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.hero_slider_enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* Live Preview */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2.5">
                                        {(() => {
                                            const IconComp = LOGO_ICONS.find(i => i.name === data.logo_icon)?.component || Cat;
                                            return <IconComp className="w-8 h-8" style={{ color: data.logo_color }} />;
                                        })()}
                                        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                                            Preview<span style={{ color: data.logo_color }}>Logo</span>
                                        </span>
                                    </div>
                                    <span className="ml-2 text-xs text-slate-400">Live preview</span>
                                </div>

                                {/* Icon Picker */}
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Choose Icon</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LOGO_ICONS.map(({ name, label, component: Icon }) => (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => setData('logo_icon', name)}
                                                title={label}
                                                className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 transition-all ${data.logo_icon === name
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                                                    }`}
                                            >
                                                <Icon
                                                    className="w-5 h-5"
                                                    style={{ color: data.logo_icon === name ? data.logo_color : undefined }}
                                                />
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Choose Color</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {PRESET_COLORS.map(({ label, value }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setData('logo_color', value)}
                                                title={label}
                                                className={`w-8 h-8 rounded-full border-4 transition-all hover:scale-110 ${data.logo_color === value
                                                        ? 'border-white dark:border-slate-300 shadow-md scale-110'
                                                        : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: value }}
                                            />
                                        ))}
                                        {/* Custom color input */}
                                        <div className="flex items-center gap-2 ml-1">
                                            <input
                                                type="color"
                                                value={data.logo_color}
                                                onChange={(e) => setData('logo_color', e.target.value)}
                                                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                                                title="Custom color"
                                            />
                                            <span className="text-xs text-slate-400 font-mono">{data.logo_color}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </>)}

                        {/* â”€â”€ FOOTER TAB â”€â”€ */}
                        {activeTab === 'footer' && (<>
                            <div className="space-y-6">

                                {/* Footer Description */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <AlignLeft className="w-4 h-4 text-indigo-500" />
                                        Footer Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={data.footer_description}
                                        onChange={(e) => setData('footer_description', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all shadow-sm resize-none"
                                        placeholder={`${settings.site_name || 'BakaNeko'} adalah tempat terbaik untuk streaming anime sub Indo dengan kualitas HD secara gratis. Nikmati update episode terbaru setiap harinya.`}
                                    />
                                    <p className="text-xs text-slate-400">Ditampilkan di bawah logo pada footer. Kosongkan untuk menggunakan teks default.</p>
                                    {errors.footer_description && <p className="text-red-500 text-xs mt-1">{errors.footer_description}</p>}
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Footer Image (Character) */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                                        <ImageIcon className="w-4 h-4 text-pink-500" />
                                        Gambar Karakter Footer (Kanan Bawah)
                                    </label>

                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                                            {footerImagePreview ? (
                                                <>
                                                    <img src={footerImagePreview} alt="Footer Preview" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={removeFooterImage}
                                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-slate-300" />
                                            )}
                                        </div>
                                        <div className="space-y-1 group">
                                            <input
                                                type="file"
                                                id="footer_image"
                                                onChange={handleFooterImageChange}
                                                accept=".png,.jpg,.jpeg,.webp,.svg"
                                                className="block w-full text-sm text-slate-500 dark:text-slate-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-xs file:font-semibold
                                                file:bg-pink-50 file:text-pink-600
                                                hover:file:bg-pink-100 cursor-pointer"
                                            />
                                            <p className="text-xs text-slate-400">Gunakan gambar PNG transparan (tanpa background) biar estetik.</p>
                                            {errors.footer_image && <p className="text-red-500 text-xs mt-1">{errors.footer_image}</p>}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Footer Copyright */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Copyright className="w-4 h-4 text-indigo-500" />
                                        Copyright Text
                                    </label>
                                    <input
                                        type="text"
                                        value={data.footer_copyright}
                                        onChange={(e) => setData('footer_copyright', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                        placeholder={`Â© ${new Date().getFullYear()} ${settings.site_name || 'BakaNeko'}. All rights reserved.`}
                                    />
                                    <p className="text-xs text-slate-400">Ditampilkan di bagian bawah footer. Kosongkan untuk menggunakan teks default otomatis.</p>
                                    {errors.footer_copyright && <p className="text-red-500 text-xs mt-1">{errors.footer_copyright}</p>}
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Footer Credit */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        Credit Text
                                    </label>
                                    <input
                                        type="text"
                                        value={data.footer_credit}
                                        onChange={(e) => setData('footer_credit', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                        placeholder="Dibuat dengan â¤ untuk wibu."
                                    />
                                    <p className="text-xs text-slate-400">Teks kecil di sebelah copyright. Kosongkan untuk menggunakan teks default.</p>
                                    {errors.footer_credit && <p className="text-red-500 text-xs mt-1">{errors.footer_credit}</p>}
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Visitor Stats Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tampilkan Statistik Pengunjung</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Tampilkan jumlah online & total pengunjung di footer. Aktifkan saat hosting (butuh Redis/cache server).</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('show_visitor_stats', !data.show_visitor_stats)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.show_visitor_stats ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.show_visitor_stats ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* Live Preview */}
                                <hr className="border-slate-100 dark:border-slate-800" />
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview Footer</p>
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {data.footer_description || `${settings.site_name || 'BakaNeko'} adalah tempat terbaik untuk streaming anime sub Indo dengan kualitas HD secara gratis. Nikmati update episode terbaru setiap harinya.`}
                                        </p>
                                        <p className="text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between">
                                            <span>{data.footer_copyright || `Â© ${new Date().getFullYear()} ${settings.site_name || 'BakaNeko'}. All rights reserved.`}</span>
                                            <span>{data.footer_credit || 'Dibuat dengan â¤ untuk wibu.'}</span>
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </>)}

                        {/* â”€â”€ NAVIGATION TAB â”€â”€ */}
                        {activeTab === 'navigation' && (<>
                            <div className="space-y-8">

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Navigation className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Link Navigasi Footer</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">
                                        Link-link ini ditampilkan di kolom "Navigasi" pada footer website.
                                    </p>
                                    <LinkEditor
                                        links={navLinks}
                                        onChange={updateNavLinks}
                                        title="Kolom Navigasi"
                                    />
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Navigation className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Link Legal Footer</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">
                                        Link-link ini ditampilkan di kolom "Legal" pada footer website.
                                    </p>
                                    <LinkEditor
                                        links={legalLinks}
                                        onChange={updateLegalLinks}
                                        title="Kolom Legal"
                                    />
                                </div>

                                {/* Live Preview */}
                                <hr className="border-slate-100 dark:border-slate-800" />
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</p>
                                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">Navigasi</p>
                                                <ul className="space-y-1.5">
                                                    {navLinks.map((l, i) => (
                                                        <li key={i} className="text-sm text-indigo-500">{l.label || <span className="italic text-slate-300">(kosong)</span>}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">Legal</p>
                                                <ul className="space-y-1.5">
                                                    {legalLinks.map((l, i) => (
                                                        <li key={i} className="text-sm text-indigo-500">{l.label || <span className="italic text-slate-300">(kosong)</span>}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Social Media */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Social Media</span>
                                    </div>
                                    <p className="text-xs text-slate-400">URL profil media sosial yang ditampilkan di footer. Kosongkan untuk menyembunyikan icon.</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                <Facebook size={16} className="text-blue-500" />
                                            </div>
                                            <input
                                                type="url"
                                                value={data.social_facebook}
                                                onChange={e => setData('social_facebook', e.target.value)}
                                                placeholder="https://facebook.com/yourpage"
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                                            />
                                            {errors.social_facebook && <p className="text-red-500 text-xs">{errors.social_facebook}</p>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                                                <Twitter size={16} className="text-sky-500" />
                                            </div>
                                            <input
                                                type="url"
                                                value={data.social_twitter}
                                                onChange={e => setData('social_twitter', e.target.value)}
                                                placeholder="https://twitter.com/yourhandle"
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                                            />
                                            {errors.social_twitter && <p className="text-red-500 text-xs">{errors.social_twitter}</p>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                                                <Instagram size={16} className="text-pink-500" />
                                            </div>
                                            <input
                                                type="url"
                                                value={data.social_instagram}
                                                onChange={e => setData('social_instagram', e.target.value)}
                                                placeholder="https://instagram.com/yourhandle"
                                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
                                            />
                                            {errors.social_instagram && <p className="text-red-500 text-xs">{errors.social_instagram}</p>}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </>)}

                        {/* ── COMMUNITY TAB ── */}
                        {activeTab === 'community' && (<>
                            <div className="space-y-8">

                                {/* Enable Banner Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#5865F2]/5 border border-[#5865F2]/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center shrink-0 shadow-md shadow-[#5865F2]/30">
                                            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Discord Community Banner</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tampilkan banner ajakan bergabung ke Discord di halaman Home.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('discord_enabled', !data.discord_enabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.discord_enabled ? 'bg-[#5865F2]' : 'bg-slate-300 dark:bg-slate-600'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.discord_enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Discord Invite URL */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <LinkIcon className="w-4 h-4 text-[#5865F2]" />
                                        Link Undangan Discord
                                    </label>
                                    <input
                                        type="url"
                                        value={data.discord_url}
                                        onChange={e => setData('discord_url', e.target.value)}
                                        placeholder="https://discord.gg/yourserver"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-[#5865F2] focus:ring-[#5865F2] outline-none transition-all shadow-sm"
                                    />
                                    <p className="text-xs text-slate-400">Link permanen invite Discord server kamu. Bisa didapat dari Server Settings → Invites.</p>
                                    {errors.discord_url && <p className="text-red-500 text-xs mt-1">{errors.discord_url}</p>}
                                </div>

                                {/* Banner Title */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Type className="w-4 h-4 text-[#5865F2]" />
                                        Judul Banner
                                    </label>
                                    <input
                                        type="text"
                                        value={data.discord_title}
                                        onChange={e => setData('discord_title', e.target.value)}
                                        placeholder="Join Our Discord"
                                        maxLength={100}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-[#5865F2] focus:ring-[#5865F2] outline-none transition-all shadow-sm"
                                    />
                                    {errors.discord_title && <p className="text-red-500 text-xs mt-1">{errors.discord_title}</p>}
                                </div>

                                {/* Banner Description */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                                        Deskripsi Banner
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.discord_description}
                                        onChange={e => setData('discord_description', e.target.value)}
                                        placeholder="Bergabunglah dengan server Discord kami untuk update terbaru, diskusi anime, dan dukungan langsung dari tim."
                                        maxLength={300}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-[#5865F2] focus:ring-[#5865F2] outline-none transition-all shadow-sm resize-none"
                                    />
                                    <p className="text-xs text-slate-400">{data.discord_description.length}/300 karakter.</p>
                                    {errors.discord_description && <p className="text-red-500 text-xs mt-1">{errors.discord_description}</p>}
                                </div>

                                {/* Live Preview */}
                                <hr className="border-slate-100 dark:border-slate-800" />
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview Banner</p>
                                    <div className="flex justify-center">
                                        <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                                            <div className="relative bg-[#5865F2] px-5 py-4 text-center">
                                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20">
                                                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                                        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 14.09 14.09 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-black text-white leading-tight">{data.discord_title || 'Join Our Discord'}</p>
                                                <p className="text-xs font-bold text-white/75 mt-0.5">Komunitas anime Indonesia</p>
                                            </div>
                                            <div className="bg-white dark:bg-slate-800 space-y-3 px-5 py-4">
                                                <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {data.discord_description || 'Bergabunglah dengan server Discord kami untuk update terbaru, diskusi anime, dan dukungan langsung dari tim.'}
                                                </p>
                                                <div className="flex gap-2">
                                                    <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5865F2] px-3 py-2 text-xs font-black text-white">
                                                        Bergabung
                                                    </span>
                                                    <span className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-xs font-black text-slate-600 dark:text-slate-300">
                                                        Lewati
                                                    </span>
                                                </div>
                                                <p className="text-center text-[10px] text-slate-400">Jangan tampilkan lagi</p>
                                            </div>
                                        </div>
                                    </div>
                                    {!data.discord_enabled && (
                                        <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-semibold">
                                            ⚠ Banner sedang <strong>nonaktif</strong>. Aktifkan toggle di atas untuk menampilkannya.
                                        </p>
                                    )}
                                    {data.discord_enabled && !data.discord_url && (
                                        <p className="text-center text-xs text-red-500 font-semibold">
                                            ⚠ Isi link Discord terlebih dahulu agar banner dapat ditampilkan.
                                        </p>
                                    )}
                                </div>

                            </div>

                        </>)}

                        {/* -- AUTH TAB -- */}
                        {activeTab === 'auth' && (<>
                            <div className="space-y-8">

                                {/* Google Login Toggle */}
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-sm">
                                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Login dengan Google</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Izinkan pengguna login/daftar menggunakan akun Google.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('google_login_enabled', !data.google_login_enabled)}
                                        className={'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ' + (data.google_login_enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600')}
                                    >
                                        <span className={'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ' + (data.google_login_enabled ? 'translate-x-6' : 'translate-x-1')} />
                                    </button>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                {/* Google Client ID */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <KeyRound className="w-4 h-4 text-blue-500" />
                                        Google Client ID
                                    </label>
                                    <input
                                        type="text"
                                        value={data.google_client_id}
                                        onChange={e => setData('google_client_id', e.target.value)}
                                        placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-blue-400 outline-none transition-all shadow-sm"
                                    />
                                    {errors.google_client_id && <p className="text-red-500 text-xs mt-1">{errors.google_client_id}</p>}
                                </div>

                                {/* Google Client Secret */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <KeyRound className="w-4 h-4 text-blue-500" />
                                        Google Client Secret
                                    </label>
                                    <input
                                        type="password"
                                        value={data.google_client_secret}
                                        onChange={e => setData('google_client_secret', e.target.value)}
                                        placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-blue-400 outline-none transition-all shadow-sm"
                                    />
                                    {errors.google_client_secret && <p className="text-red-500 text-xs mt-1">{errors.google_client_secret}</p>}
                                </div>

                                {/* Setup Instructions */}
                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Cara Mendapatkan Credentials</p>
                                    <ol className="list-decimal list-inside text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                                        <li>Buka <strong>Google Cloud Console</strong> &rarr; APIs &amp; Services &rarr; Credentials</li>
                                        <li>Buat <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
                                        <li>Tambahkan Authorized redirect URI: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded font-mono text-xs">{typeof window !== 'undefined' ? window.location.origin : ''}/auth/google/callback</code></li>
                                        <li>Salin Client ID dan Client Secret ke field di atas</li>
                                        <li>Aktifkan toggle <strong>Login dengan Google</strong>, lalu Save</li>
                                    </ol>
                                </div>
                            </div>
                        </>)}

                        {/* -- SCRAPER TAB -- */}
                        {activeTab === 'scraper' && (<>
                            <div className="space-y-8">
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex gap-4">
                                    <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Pengaturan Sumber Data</p>
                                        <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                            Bagian ini digunakan untuk mengatur alamat sumber scraper. Jika situs sumber melakukan ganti domain, Anda dapat memperbaruinya di sini tanpa harus mengubah kode program.
                                        </p>
                                    </div>
                                </div>

                                {/* Komiku Domain */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        <Search className="w-4 h-4 text-indigo-500" />
                                        Komiku Source URL
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="url"
                                            value={data.komiku_url}
                                            onChange={e => setData('komiku_url', e.target.value)}
                                            placeholder="https://komiku.org"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-indigo-400 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Gunakan format URL lengkap (termasuk https://). Contoh: <strong>https://komiku.id</strong> atau <strong>https://komiku.org</strong></p>
                                    {errors.komiku_url && <p className="text-red-500 text-xs mt-1">{errors.komiku_url}</p>}
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800" />

                                <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/30 p-5 space-y-1">
                                    <p className="text-sm font-bold text-sky-800 dark:text-sky-200">Novel API Settings</p>
                                    <p className="text-xs text-sky-700/80 dark:text-sky-400/80 leading-relaxed">
                                        Atur domain WordPress Madara dan base API Novel dari sini. Jika nanti domain sumber/API diganti, cukup update field ini tanpa edit controller Laravel.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <Globe className="w-4 h-4 text-sky-500" />
                                            Novel Source Domain
                                        </label>
                                        <input
                                            type="url"
                                            value={data.novel_source_domain}
                                            onChange={e => {
                                                const source = e.target.value;
                                                setData({
                                                    ...data,
                                                    novel_source_domain: source,
                                                    novel_api_url: data.novel_api_url || `${source.replace(/\/$/, '')}/wp-json/kiryuu/v1`,
                                                });
                                            }}
                                            placeholder="https://novel.kiryuuid.net"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-sky-400 outline-none transition-all shadow-sm"
                                        />
                                        <p className="text-xs text-slate-400">Domain halaman novel WordPress Madara. Contoh: https://novel.kiryuuid.net</p>
                                        {errors.novel_source_domain && <p className="text-red-500 text-xs mt-1">{errors.novel_source_domain}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <LinkIcon className="w-4 h-4 text-sky-500" />
                                            Novel API Base URL
                                        </label>
                                        <input
                                            type="url"
                                            value={data.novel_api_url}
                                            onChange={e => setData('novel_api_url', e.target.value)}
                                            placeholder="https://novel.kiryuuid.net/wp-json/kiryuu/v1"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-sky-400 outline-none transition-all shadow-sm"
                                        />
                                        <p className="text-xs text-slate-400">Endpoint API plugin Kiryuu Novel API.</p>
                                        {errors.novel_api_url && <p className="text-red-500 text-xs mt-1">{errors.novel_api_url}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <BookOpen className="w-4 h-4 text-sky-500" />
                                            Novel Chapter Mode Default
                                        </label>
                                        <select
                                            value={data.novel_chapter_mode}
                                            onChange={e => setData('novel_chapter_mode', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white px-4 py-2.5 text-sm focus:border-sky-400 outline-none transition-all shadow-sm"
                                        >
                                            <option value="live_api">Live API - isi chapter tidak disimpan DB</option>
                                            <option value="import_db">Import DB - list/isi chapter bisa disimpan</option>
                                        </select>
                                        <p className="text-xs text-slate-400">Mode default untuk modul Novel. Isi chapter tetap bisa dipilih saat import.</p>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Novel Cover Hotlink</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Poster novel tetap memakai URL asli dari WordPress/API.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('novel_cover_hotlink', !data.novel_cover_hotlink)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.novel_cover_hotlink ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${data.novel_cover_hotlink ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2">Informasi Scrapper</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        Scraper Manga menggunakan <strong>Komiku</strong>. Modul Novel menggunakan <strong>WordPress Madara API</strong> dari field Novel API Base URL di atas.
                                    </p>
                                </div>
                            </div>
                        </>)}
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>

            </div>
        </AdminLayout>
    );
}
