import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { 
    ChevronLeft, Star, Play, Book, Eye, 
    Share2, Flag, List, ArrowLeft, ArrowUpDown, 
    Search, Info, AlignLeft, Calendar, 
    ChevronDown, BookOpen, Flame, X, Trophy, Sparkles, BookMarked, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NovelCard from '../../Components/NovelCard';
import ReportModal from '../../Components/ReportModal';
import UserAvatar from '@/Components/UserAvatar';
import { Users, MessageSquare } from 'lucide-react';
import AdSlot from '@/Components/AdSlot';

export default function Show({ manga, mangaRank, firstChapter, relatedNovels, relatedMangas, userRating, totalRaters, isBookmarked, readChapterIds = [] }) {
    const { auth, ads } = usePage().props;
    // Robust data checks to prevent runtime crashes
    if (!manga) {
        return (
            <AppLayout>
                <Head title="Loading Series..." />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 p-6 text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">MEMUAT SERIES...</h2>
                    <p className="text-sm">Silakan tunggu sebentar atau muat ulang halaman jika terlalu lama.</p>
                </div>
            </AppLayout>
        );
    }

    const novel = manga;
    const novelRelated = relatedNovels || relatedMangas || [];

    const formatSynopsisHtml = (value = '') => {
        const raw = String(value || '').trim();
        if (!raw) return '<p>Tidak ada sinopsis untuk judul ini.</p>';

        // Kalau dari API sudah HTML paragraph, pertahankan.
        if (/<p[\s>]|<br\s*\/?/i.test(raw)) {
            return raw;
        }

        // Kalau masih plain text, pecah jadi paragraph. Prioritas double newline,
        // fallback pecah kalimat panjang agar tidak menjadi satu blok gepeng.
        let parts = raw.split(/\n{2,}/).map(v => v.trim()).filter(Boolean);
        if (parts.length <= 1 && raw.length > 260) {
            parts = raw
                .replace(/([.!?])\s+(?=[A-ZÀ-Ý0-9“"'])/g, '$1\n\n')
                .split(/\n{2,}/)
                .map(v => v.trim())
                .filter(Boolean);
        }

        const esc = (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return parts.map(p => `<p>${esc(p)}</p>`).join('');
    };

    const handleBookmark = () => {
        if (!auth?.user) {
            router.get('/login');
            return;
        }
        router.post(`/novel/${novel.slug}/bookmark`, {}, {
            preserveScroll: true,
        });
    };

    const [tab, setTab] = useState('chapter');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('source');
    const [expanded, setExpanded] = useState(false);
    const [showAllGenres, setShowAllGenres] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    
    // Comments state
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        if (!commentText.trim()) return;

        router.post(`/novel/${novel.id}/comment`, { content: commentText }, {
            preserveScroll: true,
            onSuccess: () => setCommentText('')
        });
    };

    const handleReplySubmit = (e, parentId) => {
        e.preventDefault();
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        if (!replyText.trim()) return;

        router.post(`/novel/${novel.id}/comment`, { content: replyText, parent_id: parentId }, {
            preserveScroll: true,
            onSuccess: () => {
                setReplyText('');
                setReplyingTo(null);
            }
        });
    };

    const handleCommentDelete = (commentId) => {
        if (confirm('Apakah Anda yakin ingin menghapus komentar ini?')) {
            router.delete(`/comments/${commentId}`, {
                preserveScroll: true
            });
        }
    };

    const handleRate = (value) => {
        if (!auth?.user) {
            router.get('/login');
            return;
        }
        router.post(`/novel/${novel.slug}/rate`, { rating: value }, {
            preserveScroll: true,
        });
    };

    // Defensive route helper
    const getSafeRoute = (name, params) => {
        try {
            if (typeof route === "function") return route(name, params);
            if (name === "novel.read") return "/novel/" + params[0] + "/chapter/" + params[1];
            if (name === "novel.front.index") return "/novel";
            return "#";
        } catch (e) {
            return "#";
        }
    };
    
    // Jangan auto-sort chapter. Urutan default mengikuti urutan bawaan dari API/DB Madara.
    const sourceChapters = [...(novel.chapters || [])];
    const chapters = sort === 'reverse' ? [...sourceChapters].reverse() : sourceChapters;

    const filteredChapters = chapters.filter(c => 
        search === '' || 
        String(c.title || "").toLowerCase().includes(search.toLowerCase()) || 
        String(c.slug || "").toLowerCase().includes(search.toLowerCase())
    );

    const posterUrl = novel.poster 
        ? (novel.poster.startsWith('http') ? novel.poster : `/storage/${novel.poster}`) 
        : '';

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
            if (diffDays <= 1) return 'Today';
            if (diffDays <= 7) return `${diffDays} days ago`;
            return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return '-';
        }
    };

    // Helper to format chapter number
    const formatChapter = (num) => {
        if (!num) return '0';
        return parseFloat(num).toString();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: novel.title,
                text: `Baca ${novel.title} di ${window.location.origin}`,
                url: window.location.href,
            }).catch(() => {
                // Ignore errors from cancel
            });
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link berhasil disalin ke clipboard!');
        }
    };
    const domain = typeof window !== 'undefined' 
  ? window.location.hostname 
  : '';
  const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <AppLayout>
            <Head title={`${novel.title || 'Novel'} - Read at ${capitalize(domain)}`} />

            {/* ── MANGA DETAIL SIDEBAR WITH RESPONSIVE SPACING ── */}
            <div className="w-full max-w-[1240px] mx-auto mt-10 md:mt-16 mb-24 px-5 sm:px-8 flex flex-col items-center">
                
                {/* Back Button Container */}
                <div className="w-full flex justify-start mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all text-slate-500 dark:text-slate-400 font-bold text-sm">
                        <ArrowLeft size={16} />
                        <span>Back to home</span>
                    </Link>
                </div>
                
                <div className="w-full mb-8">
                    <AdSlot code={ads?.manga_detail_top} />
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-y-14 lg:gap-10 items-start">
                    {/* Left Column: The Card */}
                    <div className="lg:w-[385px] w-full flex-shrink-0 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col items-center p-7 relative">
                        
                        {/* Hero Background */}
                        <div className="absolute top-0 left-0 w-full h-[280px] overflow-hidden opacity-30 pointer-events-none">
                            <img alt="mask" className="w-full h-full object-cover" src={posterUrl} />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white dark:via-slate-900/60 dark:to-slate-900"></div>
                        </div>

                        {/* Floating Cover */}
                        <div className="relative z-10 w-[170px] h-[240px] mb-7 group">
                            <div className="absolute -inset-1 bg-black/10 rounded-[24px] blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <img 
                                alt={novel.title} 
                                className="w-full h-full object-cover rounded-[24px] border-[3px] border-white shadow-xl relative z-10" 
                                src={posterUrl} 
                            />
                        </div>

                        {/* Text Content */}
                        <div className="relative z-10 text-center space-y-2 mb-7">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight px-2">
                                {novel.title}
                            </h1>
                            <p className="text-[13px] font-bold text-slate-400 tracking-wide uppercase">
                                {novel.author || 'Author Name'}
                            </p>
                        </div>

                        {/* Badges Row */}
                        <div className="relative z-10 flex gap-2 mb-8">
                            <div className="flex items-center gap-2 bg-[#eff6ff] text-[#3b82f6] px-4 py-2 rounded-xl font-black text-xs">
                                <BookOpen size={14} />
                                {novel.type || 'Manhwa'}
                            </div>
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl font-black text-xs">
                                {(novel.status || '').toLowerCase() === 'completed' ? (
                                    <CheckCircle size={14} className="text-emerald-500" />
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-2.5 h-2.5 bg-red-500/30 rounded-full animate-ping" />
                                        <Flame size={14} className="text-red-500 relative" />
                                    </div>
                                )}
                                {novel.status || 'Ongoing'}
                            </div>
                        </div>

                        {/* Stats Matrix with Rating */}
                        <div className="relative z-10 w-full mb-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div
                                    onClick={() => {
                                        const val = prompt('Berikan rating (1-10):', novel.rating || 9.0);
                                        if (val && !isNaN(val)) handleRate(val);
                                    }}
                                    className="min-h-[78px] rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 cursor-pointer group relative shadow-sm"
                                >
                                    <Star size={18} className="text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{Number(novel.rating || 0).toFixed(1)}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Click to Rate</div>
                                </div>

                                <div className="min-h-[78px] rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 shadow-sm">
                                    <Book size={18} className="text-[#38bdf8]" />
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{novel.chapters?.length || 0}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapter</span>
                                </div>

                                <div className="min-h-[78px] rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 shadow-sm">
                                    <Eye size={18} className="text-[#fb923c]" />
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                        {(Number(novel.views_count || 0) >= 1000) ? (Number(novel.views_count || 0) / 1000).toFixed(1) + 'k' : (novel.views_count || 0)}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                                </div>

                                <div className="min-h-[78px] rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-1 shadow-sm">
                                    <Trophy size={18} className="text-[#2dd4bf]" />
                                    <span className="text-xs font-black text-slate-900 dark:text-white">#{mangaRank || '85'}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</span>
                                </div>
                            </div>
                        </div>

                        {/* Lower Toolbar */}
                        <div className="relative z-10 w-full mb-8">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Bookmark Button */}
                                <button
                                    onClick={handleBookmark}
                                    className={`h-16 rounded-2xl border transition-all flex items-center justify-center ${
                                        isBookmarked
                                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-[#f8fafc] dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-600'
                                    }`}
                                    title={isBookmarked ? "Hapus dari Bookmark" : "Tambah ke Bookmark"}
                                >
                                    {isBookmarked ? <BookMarked size={20} /> : <Book size={20} />}
                                </button>

                                <button
                                    onClick={() => setIsReportModalOpen(true)}
                                    className="h-16 rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                                    title="Laporkan Masalah"
                                >
                                    <Flag size={20} />
                                </button>

                                <Link
                                    href="/novel"
                                    className="h-16 rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                                    title="Lihat Daftar Novel"
                                >
                                    <List size={20} />
                                </Link>

                                <button
                                    onClick={handleShare}
                                    className="h-16 rounded-2xl bg-[#f8fafc] dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center"
                                    title="Bagikan"
                                >
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Master Button */}
                        <div className="relative z-10 w-full px-1">
                            {readChapterIds.length > 0 ? (
                                (() => {
                                    const lastReadId = readChapterIds[0];
                                    const lastReadCh = novel.chapters.find(c => c.id === lastReadId);
                                    if (lastReadCh) {
                                        return (
                                            <Link 
                                                href={getSafeRoute('novel.read', [novel.slug, lastReadCh.slug || lastReadCh.chapter_number])}
                                                className="w-full h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-3 text-base font-black tracking-tight shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all uppercase"
                                            >
                                                <span>{lastReadCh.title || "Continue Reading"}</span>
                                                <Play size={20} fill="currentColor" />
                                            </Link>
                                        );
                                    }
                                    return null;
                                })()
                            ) : firstChapter ? (
                                <Link 
                                    href={getSafeRoute('novel.read', [novel.slug, firstChapter.slug || firstChapter.chapter_number])}
                                    className="w-full h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-3 text-base font-black tracking-tight shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all uppercase"
                                >
                                    <span>{firstChapter.title || "Start Reading"}</span>
                                    <BookOpen size={20} />
                                </Link>
                            ) : (
                                <button disabled className="w-full h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-2xl flex items-center justify-center gap-3 text-base font-black cursor-not-allowed">
                                    No Chapters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Content area */}
                    <div className="flex-1 w-full min-w-0">
                        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl flex flex-col gap-6 p-0 overflow-hidden rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-2xl">
                        
                        {/* ── DYNAMIC ANIMATED TABS (ZURUI STYLE) ── */}
                        <div className="flex items-center justify-center px-4 pt-6 md:pt-8 border-b border-slate-200 dark:border-white/10 pb-0">
                            <div role="tablist" className="h-9 flex items-center gap-6">
                                {[
                                    { id: 'chapter', label: 'Chapters', icon: BookOpen },
                                    { id: 'info',    label: 'Detail Info', icon: Info },
                                    { id: 'series',  label: 'More Series', icon: Star }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTab(t.id)}
                                        className={`group flex items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 transition-all duration-500 font-bold text-sm ${
                                            tab === t.id 
                                            ? 'text-red-500 dark:text-red-400' 
                                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <t.icon 
                                            size={20} 
                                            className={`transition-colors duration-500 ${tab === t.id ? 'text-red-500' : ''}`} 
                                        />
                                        
                                        <AnimatePresence initial={false}>
                                            {tab === t.id && (
                                                <motion.span
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{ width: 'auto', opacity: 1 }}
                                                    exit={{ width: 0, opacity: 0 }}
                                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                                    className="overflow-hidden whitespace-nowrap"
                                                >
                                                    {t.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Content Panel */}
                        <div className="p-4 md:p-4 pt-0">
                            <AnimatePresence mode="wait">
                                {tab === 'chapter' && (
                                    <motion.div 
                                        key="chapter"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4 pt-0"
                                    >
                                        {/* Synopsis */}
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-white/10 shadow-inner">
                                            <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">
                                                <div className="h-6 w-1.5 bg-red-500 rounded-full"></div>
                                                <AlignLeft size={18} />
                                                <span>SYNOPSIS</span>
                                            </div>
                                            <div
                                                className={`novel-synopsis-html prose prose-sm dark:prose-invert max-w-none text-[0.95rem] text-slate-600 dark:text-slate-400 leading-[1.8] font-medium [&_p]:mb-4 [&_p:last-child]:mb-0 ${!expanded ? 'line-clamp-4' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: formatSynopsisHtml(novel.synopsis) }}
                                            />
                                            <button 
                                                onClick={() => setExpanded(!expanded)}
                                                className="mt-4 flex items-center gap-1.5 text-xs font-black text-red-600 dark:text-red-400 hover:opacity-80 transition uppercase tracking-widest"
                                            >
                                                <span>{expanded ? 'Tampilkan lebih sedikit' : 'Tampilkan selengkapnya'}</span>
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Genre Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {(novel.genres || []).map((g, idx) => (
                                                <Link 
                                                    key={g.id} 
                                                    href={`/novel?genre=${g.slug}`}
                                                    className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2.5 bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm ${(idx >= 12 && !showAllGenres) ? 'hidden' : 'inline-flex'}`}
                                                >
                                                    {g.name}
                                                </Link>
                                            ))}
                                            {(novel.genres?.length > 12) && (
                                                <button 
                                                    onClick={() => setShowAllGenres(!showAllGenres)}
                                                    className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-700"
                                                >
                                                    {showAllGenres ? 'LESS' : `+${novel.genres.length - 12} MORE`}
                                                    <ChevronDown size={14} className={`transition-transform duration-300 ${showAllGenres ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Chapter List Section */}
                                        <div className="pt-2">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                                <div className="flex items-center gap-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                                    <div className="h-6 w-1.5 bg-red-500 rounded-full"></div>
                                                    <BookOpen size={18} />
                                                    <span>CHAPTER LIST ({novel.chapters?.length || 0})</span>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-max">
                                                    <div className="relative flex-1 md:w-[360px]">
                                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input 
                                                            type="text" 
                                                            value={search}
                                                            onChange={e => setSearch(e.target.value)}
                                                            placeholder="Cari chapter..."
                                                            className="w-full pl-11 pr-5 h-11 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => setSort(sort === 'source' ? 'reverse' : 'source')}
                                                        className="h-11 w-11 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center shrink-0 shadow-sm"
                                                    >
                                                        <ArrowUpDown size={18} className={`text-slate-500 transition-transform duration-500 ${sort === 'reverse' ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Scroll Area */}
                                            <div className="flex flex-col h-[650px] overflow-y-auto pr-3 custom-scrollbar gap-3">
                                                {filteredChapters.map(chapter => {
                                                    // Improved check: match by ID OR by (manga_id + chapter_number) if possible
                                                    // Since we provide readChapterIds as actual IDs, we check that first.
                                                    const isRead = readChapterIds.includes(chapter.id);
                                                    return (
                                                        <Link 
                                                            key={chapter.id}
                                                            href={getSafeRoute('novel.read', [novel.slug, chapter.slug || chapter.chapter_number])}
                                                            className={`group p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-red-500/5 ${
                                                                isRead 
                                                                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60' 
                                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-red-500/30 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                            }`}
                                                        >
                                                            <div className="flex flex-col gap-1.5">
                                                                <p className={`font-black text-sm transition-colors uppercase tracking-tight ${isRead ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white group-hover:text-red-600'}`}>
                                                                    {chapter.title || chapter.slug}
                                                                    {isRead && <span className="ml-3 text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-md">READ</span>}
                                                                </p>
                                                                <div className="flex items-center text-slate-400 dark:text-slate-500 gap-4 text-[9px] font-black uppercase tracking-widest">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Calendar size={12} className={isRead ? 'text-red-500/70' : 'text-red-500/70'} />
                                                                        {formatDate(chapter.created_at)}
                                                                    </span>
                                                                    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${isRead ? 'bg-red-500/10' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                                        <Eye size={12} className={isRead ? 'text-red-500/70' : 'text-red-500/70'} />
                                                                        {Number(chapter.views_count) >= 1000 ? (Number(chapter.views_count)/1000).toFixed(1) + 'k' : (chapter.views_count || 0)} VIEWS
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                                isRead 
                                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                                                : 'bg-red-500/5 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white'
                                                            }`}>
                                                                <ChevronLeft size={20} className="rotate-180" />
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                                {filteredChapters.length === 0 && (
                                                    <div className="text-center py-24 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
                                                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                                                        <p className="text-xs font-black uppercase tracking-[0.2em]">CHAPTER TIDAK DITEMUKAN</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {tab === 'info' && (
                                    <motion.div 
                                        key="info"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6 pt-0"
                                >
                                    {/* Score & Views Container */}
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-[32px] p-8 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-6xl font-black text-slate-900 dark:text-white leading-tight">
                                                {Number(novel.rating || 0).toFixed(1)}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((i) => {
                                                        const ratingValue = Number(novel.rating || 0);
                                                        const starValue = i * 2; // Each star represents 2 points
                                                        const isFull = ratingValue >= starValue;
                                                        const isHalf = !isFull && ratingValue >= (starValue - 1.5);

                                                        return (
                                                            <Star 
                                                                key={i} 
                                                                size={24} 
                                                                className={isFull ? 'fill-yellow-400 text-yellow-400' : (isHalf ? 'fill-yellow-400/50 text-yellow-400' : 'text-slate-200 dark:text-slate-700')} 
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Average Community Rating</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex flex-col items-center">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">VIEWS</span>
                                            <span className="text-3xl font-black text-red-500 leading-none">
                                                {Number(novel.views_count || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">TITLE</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{novel.title}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">AUTHOR</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{novel.author || '-'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">STATUS</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{novel.status}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">TYPE</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{novel.type || 'Novel'}</span>
                                        </div>
                                    </div>




                                    {/* Dates Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 px-2 pt-2 pb-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">POSTED ON</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{formatDate(novel.created_at)}</span>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">UPDATED ON</span>
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white uppercase leading-tight">{formatDate(novel.updated_at)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                                {tab === 'series' && (
                                    <motion.div 
                                        key="series"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4 pt-0"
                                    >
                                        <div className="flex items-center gap-4 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-2">
                                            <div className="h-8 w-1.5 bg-yellow-400 rounded-full"></div>
                                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                                            <span>SERIES TERKAIT</span>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                                            {novelRelated.map(related => (
                                                <NovelCard key={related.id} manga={related} />
                                            ))}
                                            {(!novelRelated || novelRelated.length === 0) && (
                                                <div className="col-span-full py-24 text-center text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
                                                    <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                                                    <p className="text-xs font-black uppercase tracking-[0.2em]">BELUM ADA JUDUL TERKAIT</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-8 mb-24">
                <div className="mt-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-xl rounded-[32px] p-6 md:p-10">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 uppercase tracking-wider">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        Komentar ({novel.comments?.length || 0})
                    </h3>

                    {/* Comment Form */}
                    <div className="mb-8">
                        {auth?.user ? (
                            <form onSubmit={handleCommentSubmit} className="flex gap-4">
                                <UserAvatar user={auth.user} sizeClass="w-12 h-12" showBadge={false} />
                                <div className="flex-1">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Tambahkan komentar..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                                        rows="3"
                                    ></textarea>
                                    <div className="mt-2 text-right">
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50"
                                        >
                                            Kirim
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center">
                                <p className="text-slate-600 dark:text-slate-300 mb-4">Silakan login untuk menambahkan komentar.</p>
                                <Link href="/login" className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all">
                                    Login Sekarang
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Comment List */}
                    <div className="space-y-6">
                        {novel.comments?.length > 0 ? (
                            novel.comments.map((comment) => (
                                <div key={comment.id} className="group bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                                    <div className="flex gap-4">
                                        <UserAvatar user={comment.user} sizeClass="w-10 h-10" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{comment.user?.name || 'Deleted User'}</h4>
                                                <span className="text-xs text-slate-400 shrink-0">
                                                    {new Date(comment.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap mb-2">{comment.content}</p>

                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                                                        setReplyText('');
                                                    }}
                                                    className="text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    Balas
                                                </button>

                                                {(auth?.user?.id === comment.user_id || auth?.user?.is_admin) && (
                                                    <button
                                                        onClick={() => handleCommentDelete(comment.id)}
                                                        className="text-red-500 hover:text-red-700 transition-opacity"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            {replyingTo === comment.id && (
                                                <div className="mt-4 flex gap-3">
                                                    <UserAvatar user={auth?.user} sizeClass="w-8 h-8" showBadge={false} />
                                                    <div className="flex-1">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={`Membalas ${comment.user.name}...`}
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                            rows="2"
                                                        ></textarea>
                                                        <div className="mt-2 flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                                                            >
                                                                Batal
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleReplySubmit(e, comment.id)}
                                                                disabled={!replyText.trim()}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
                                                            >
                                                                Kirim Balasan
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Replies List */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 ml-14 space-y-4">
                                            {comment.replies.map(reply => (
                                                <div key={reply.id} className="flex gap-4">
                                                    <UserAvatar user={reply.user} sizeClass="w-8 h-8" showBadge={false} />
                                                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl shadow-sm">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{reply.user?.name || 'Deleted User'}</h4>
                                                                <span className="text-xs text-slate-400 shrink-0">
                                                                    {new Date(reply.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            {(auth?.user?.id === reply.user_id || auth?.user?.is_admin) && (
                                                                <button
                                                                    onClick={() => handleCommentDelete(reply.id)}
                                                                    className="text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                Belum ada komentar. Jadilah yang pertama berkomentar!
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={async (data) => {
                    return new Promise((resolve, reject) => {
                        router.post(route('novel.report.store', novel.slug), data, {
                            preserveScroll: true,
                            onSuccess: () => {
                                resolve();
                            },
                            onError: () => {
                                reject();
                            }
                        });
                    });
                }}
            />
        </AppLayout>
    );
}
