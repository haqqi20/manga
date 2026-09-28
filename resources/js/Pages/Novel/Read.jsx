import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronLeft, ChevronRight, Settings, List, Flag, Home,
    ArrowLeft, ImageOff, Search, X, BookOpen,
    MessageCircle, Play, Pause, CornerDownRight,
    Trash2, Reply, LogIn, CheckCircle, ChevronUp, ChevronDown,
    ArrowUpDown, Eye, Calendar, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAvatar from '@/Components/UserAvatar';
import { Users, MessageSquare } from 'lucide-react';
import Footer from '../../Components/Footer';
import ReportModal from '../../Components/ReportModal';
import AdSlot from '@/Components/AdSlot';

export default function Read({ manga, chapter, prev, next, chapters, readChapterIds = [] }) {
    // Robust data checks to prevent runtime crashes
    if (!manga || !chapter) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Memuat Konten...</h2>
                <p className="text-sm">Jika halaman tidak merespon dalam 5 detik, silakan muat ulang.</p>
                <Link href="/novel" className="mt-8 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">KEMBALI KE KATALOG</Link>
            </div>
        );
    }

    const novel = manga;

    const [showUI, setShowUI] = useState(true);
    const [lastScroll, setLastScroll] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [showChapterList, setShowChapterList] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [chapterSearch, setChapterSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('source'); // source atau reverse
    const [fitToWidth, setFitToWidth] = useState(false);
    const [imageWidth, setImageWidth] = useState(55);
    const [autoScrolling, setAutoScrolling] = useState(false);
    const [autoScrollSpeed, setAutoScrollSpeed] = useState(2);
    const [readerFontSize, setReaderFontSize] = useState(() => {
        if (typeof window === 'undefined') return 18;

        const saved = Number(window.localStorage.getItem('novel_reader_font_size'));
        return saved >= 14 && saved <= 30 ? saved : 18;
    });
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const ENABLE_LOCK = import.meta.env.VITE_ENABLE_LOCK === 'true';

    const autoScrollInterval = useRef(null);
    const { auth, ads } = usePage().props;

    const getChapterImageSrc = (imagePath = '') => {
        const path = String(imagePath || '').trim();

        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        if (path.startsWith('/storage/')) return path;
        if (path.startsWith('/')) return path;

        return `/storage/${path}`;
    };

    const rewriteChapterContentImages = (html = '') => {
        if (!html) return '';

        // Jangan pakai proxy untuk gambar novel. Biarkan src gambar hotlink asli dari API/WordPress.
        return String(html).replace(
            /(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi,
            (match, before, src, after) => `${before}${getChapterImageSrc(src)}${after}`
        );
    };

    const normalizeNovelChapterHtml = (raw = '') => {
        let html = String(raw || '').trim();
        if (!html) return '';

        // Kalau API masih mengirim escaped HTML, decode dulu agar tag <p>, <br>, <img> terbaca.
        html = html
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&');

        html = rewriteChapterContentImages(html);

        // Bersihkan elemen bawaan WordPress/Madara yang tidak perlu di reader Laravel.
        html = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

        const hasReadableBlocks = /<(p|br|div|h1|h2|h3|h4|blockquote|ul|ol|li|img)\b/i.test(html);

        // Jika konten datang sebagai plain text panjang, jadikan paragraf berdasarkan newline.
        if (!hasReadableBlocks) {
            return html
                .split(/\n{2,}|\r\n{2,}/)
                .map(part => part.trim())
                .filter(Boolean)
                .map(part => `<p>${part.replace(/\n/g, '<br>')}</p>`)
                .join('');
        }

        // Jika cuma <br> tanpa <p>, bungkus per blok agar jarak paragraf tetap rapi.
        if (!/<p[\s>]/i.test(html) && /<br\s*\/?>(\s*<br\s*\/?>)+/i.test(html)) {
            return html
                .split(/(?:<br\s*\/?>\s*){2,}/i)
                .map(part => part.trim())
                .filter(Boolean)
                .map(part => `<p>${part}</p>`)
                .join('');
        }

        return html;
    };

    const chapterHtml = normalizeNovelChapterHtml(chapter.content);

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

        router.post(`/chapter/${chapter.id}/comment`, { content: commentText }, {
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

        router.post(`/chapter/${chapter.id}/comment`, { content: replyText, parent_id: parentId }, {
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
    // Defensive routing helper
    const getSafeRoute = (name, params) => {
        try {
            if (typeof route === "function") return route(name, params);
            if (name === "novel.show") return "/novel/" + params;
            if (name === "novel.read") return "/novel/" + params[0] + "/chapter/" + params[1];
            return "#";
        } catch (e) {
            return "#";
        }
    };

    const handleNavigation = (destChapter) => {
        if (!destChapter) return;
        const url = getSafeRoute('novel.read', [novel.slug, destChapter.slug || destChapter.chapter_number]);
        if (url !== "#") {
            try {
                router.visit(url);
            } catch (e) {
                window.location.href = url;
            }
        }
    };

    // Auto-scroll logic
    const toggleAutoScroll = () => {
        if (autoScrolling) {
            clearInterval(autoScrollInterval.current);
            setAutoScrolling(false);
        } else {
            setAutoScrolling(true);
            autoScrollInterval.current = setInterval(() => {
                window.scrollBy({ top: autoScrollSpeed, behavior: 'auto' });
            }, 16);
        }
    };

    const stopAutoScroll = useCallback(() => {
        if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
            setAutoScrolling(false);
        }
    }, []);

    // Scroll handling
    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset;
            setShowUI(currentScroll < lastScroll || currentScroll < 100);
            setLastScroll(currentScroll);

            setAtTop(currentScroll < 200);
            setAtBottom((window.innerHeight + currentScroll) >= (document.body.scrollHeight - 200));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScroll]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft' && next) {
                handleNavigation(next);
            }
            if (e.key === 'ArrowRight' && prev) {
                handleNavigation(prev);
            }
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                toggleAutoScroll();
            }
            if (e.key === 'Escape') {
                setShowSettings(false);
                setShowChapterList(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [prev, next, autoScrolling]);

    useEffect(() => {
        return () => {
            if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
        };
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('novel_reader_font_size', String(readerFontSize));
        }
    }, [readerFontSize]);

    const filteredChapters = (chapters || [])
        .filter(ch => 
            String(ch.slug || "").toLowerCase().includes(chapterSearch.toLowerCase()) || 
            (ch.title && ch.title.toLowerCase().includes(chapterSearch.toLowerCase()))
        );

    const visibleChapters = sortOrder === 'reverse'
        ? [...filteredChapters].reverse()
        : filteredChapters;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30">
            <Head title={`${novel.title || 'Novel'} - ${chapter.title || chapter.slug || 'Chapter'}`} />

            {/* Floating Top Navbar */}
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 p-4 z-50 pointer-events-none"
                    >
                        <div className="max-w-4xl mx-auto pointer-events-auto">
                            <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between px-4 py-3 shadow-2xl">
                                {/* Back Button */}
                                <Link
                                    href={getSafeRoute('novel.show', novel.slug)}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all font-black"
                                >
                                    <ArrowLeft size={20} />
                                </Link>

                                {/* Title Info */}
                                <div className="flex flex-col items-center min-w-0 px-4">
                                    <Link
                                        href={getSafeRoute('novel.show', novel.slug)}
                                        className="text-sm font-black text-white hover:text-sky-500 transition-colors truncate max-w-[200px] md:max-w-md uppercase tracking-tight"
                                    >
                                        {novel.title}
                                    </Link>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-0.5">
                                        {chapter.title || chapter.slug || 'CHAPTER'}
                                    </span>
                                </div>

                                {/* Home Button */}
                                <Link
                                    href="/"
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <Home size={20} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

{/* Reading Area */}
<div
    className="novel-read-page flex flex-col items-center pt-28 pb-32 w-full mx-auto transition-all duration-500 px-4"
    style={{
        maxWidth: fitToWidth ? `${imageWidth}%` : "100%",
    }}
    onClick={() => setShowUI(!showUI)}
>
    {!ENABLE_LOCK || auth?.user ? (
        <>
            {/* HTML Content Reader */}
            {chapterHtml ? (
                <article className="novel-reader-shell w-full" onClick={(e) => e.stopPropagation()}>
                    <div className="novel-reader-meta">
                        <div className="text-[11px] font-black uppercase tracking-[0.32em] text-red-400 mb-2">Novel Chapter</div>
                        <h1>{chapter.title || chapter.slug}</h1>
                    </div>
                    <div className="novel-reader-toolbar">
                        <button
                            type="button"
                            onClick={() => setReaderFontSize((size) => Math.max(14, size - 1))}
                            title="Perkecil teks"
                        >
                            A-
                        </button>
                        <button
                            type="button"
                            onClick={() => setReaderFontSize(18)}
                            title="Reset ukuran teks"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={() => setReaderFontSize((size) => Math.min(30, size + 1))}
                            title="Perbesar teks"
                        >
                            A+
                        </button>
                    </div>
                    <div
                        className="novel-reader-content"
                        style={{ fontSize: `${readerFontSize}px` }}
                        dangerouslySetInnerHTML={{
                            __html: chapterHtml,
                        }}
                    />
                </article>
            ) : (
                <div className="w-full flex flex-col items-center">
                    {chapter.images &&
                    Array.isArray(chapter.images) &&
                    chapter.images.length > 0 ? (
                        [...chapter.images]
                            .filter((img) => {
                                const p = (
                                    img.image_path || ""
                                ).toLowerCase();

                                return !p.match(
                                    /150x150|300x300|thumb|emoji|icon|avatar|logo|banner|-0x0|-45x45/
                                );
                            })
                            .sort(
                                (a, b) =>
                                    (Number(a.order) || 0) -
                                    (Number(b.order) || 0)
                            )
                            .map((img, idx) => {
                                const path =
                                    img.image_path || "";

                                const src = getChapterImageSrc(path);

                                return (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`Page ${idx + 1}`}
                                        className="max-w-full h-auto mx-auto block select-none pointer-events-none transition-opacity duration-700"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.style.display =
                                                "none";
                                        }}
                                    />
                                );
                            })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-gray-600">
                            <ImageOff
                                size={64}
                                className="mb-4 opacity-20"
                            />

                            <p className="text-xl font-bold">
                                Gambar tidak ditemukan.
                            </p>

                            <p className="text-sm mt-2 opacity-50">
                                Silakan hubungi admin atau muat ulang halaman.
                            </p>

                            <Link
                                href={getSafeRoute(
                                    "novel.show",
                                    novel.slug
                                )}
                                className="mt-8 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all text-gray-300"
                            >
                                KEMBALI KE DETAIL
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </>
    ) : (
        /* LOCK SCREEN */
        <div className="w-full flex items-center justify-center py-40 px-6">
            <div className="max-w-lg w-full bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
                
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <LogIn className="w-10 h-10 text-blue-500" />
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-wide">
                    Chapter Terkunci
                </h2>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    Kamu harus login terlebih dahulu untuk membaca chapter ini.
                    Setelah login kamu bisa lanjut membaca semua chapter.
                </p>

                <a
                    href="https://nanimeid.net/login"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                    <LogIn size={18} />
                    Login untuk membaca
                </a>

                <div className="mt-6 text-xs text-gray-500 uppercase tracking-widest">
                    Premium Reader Access
                </div>
            </div>
        </div>
    )}
</div>

            {/* Bottom Ad Slot */}
            <div className="w-full mx-auto pb-8" style={{ maxWidth: fitToWidth ? `${imageWidth}%` : '80rem' }}>
                <AdSlot code={ads?.chapter_detail_bottom} className="w-full max-w-4xl" />
            </div>

            {/* Comments Section */}
            <div className="w-full mx-auto px-4 pb-48 pt-4" style={{ maxWidth: fitToWidth ? `${imageWidth}%` : '60rem' }}>
                <div className="mt-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-xl rounded-[32px] p-6 md:p-10">
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 uppercase tracking-wider">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        Komentar ({chapter.comments?.length || 0})
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
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
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
                        {chapter.comments?.length > 0 ? (
                            chapter.comments.map((comment) => (
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
                                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
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

            {/* Floating Bottom Navigator */}
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl border border-white/10 pointer-events-auto flex items-center gap-6">
                            {/* Prev Button: gunakan chapter sebelumnya berdasarkan urutan baca source */}
                            <button
                                onClick={() => handleNavigation(next)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${next ? 'text-white hover:bg-white/10' : 'text-gray-700 cursor-not-allowed'}`}
                                disabled={!next}
                                title="Chapter sebelumnya"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showSettings ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-gray-400 hover:bg-white/10'}`}
                                >
                                    <Settings size={20} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowChapterList(!showChapterList); }}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showChapterList ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-gray-400 hover:bg-white/10'}`}
                                >
                                    <List size={20} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsReportModalOpen(true); }}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all border border-white/5"
                                >
                                    <Flag size={20} />
                                </button>
                            </div>

                            {/* Next Button: gunakan chapter berikutnya berdasarkan urutan baca source */}
                            <button
                                onClick={() => handleNavigation(prev)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${prev ? 'text-white hover:bg-white/10' : 'text-gray-700 cursor-not-allowed'}`}
                                disabled={!prev}
                                title="Chapter berikutnya"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <ReportModal 
                isOpen={isReportModalOpen} 
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={async (data) => {
                    return new Promise((resolve, reject) => {
                        router.post(route('chapter.report.store', chapter.id), data, {
                            preserveScroll: true,
                            onSuccess: () => resolve(),
                            onError: () => reject()
                        });
                    });
                }}
            />

            {/* Scroll Assist Buttons */}
            <div className="fixed right-6 bottom-24 z-40 flex flex-col gap-3">
                {!atTop && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-12 h-12 rounded-full bg-gray-900/90 backdrop-blur border border-white/10 text-gray-400 hover:text-white hover:bg-red-500 shadow-xl flex items-center justify-center transition-all"
                    >
                        <ChevronUp size={24} />
                    </motion.button>
                )}
                {!atBottom && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        onClick={(e) => { e.stopPropagation(); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                        className="w-12 h-12 rounded-full bg-gray-900/90 backdrop-blur border border-white/10 text-gray-400 hover:text-white hover:bg-red-500 shadow-xl flex items-center justify-center transition-all"
                    >
                        <ChevronDown size={24} />
                    </motion.button>
                )}
            </div>

            {/* Settings Sidebar */}
            <AnimatePresence>
                {showSettings && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setShowSettings(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="fixed inset-y-0 right-0 w-[350px] max-w-[90vw] bg-[#111111] border-l border-white/10 z-[70] shadow-2xl p-6 flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-white">Reader Settings</h3>
                                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar">
                                {/* Fit to Width */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fit to Width</label>
                                        <button
                                            onClick={() => setFitToWidth(!fitToWidth)}
                                            className={`w-12 h-6 rounded-full transition-all relative ${fitToWidth ? 'bg-red-600' : 'bg-gray-800'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${fitToWidth ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    {fitToWidth && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-500">Scale</span>
                                                <span className="text-red-500">{imageWidth}%</span>
                                            </div>
                                            <input
                                                type="range" min="30" max="100" value={imageWidth}
                                                onChange={(e) => setImageWidth(e.target.value)}
                                                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Text Size */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block">Ukuran Teks</label>
                                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setReaderFontSize((size) => Math.max(14, size - 1))}
                                            className="w-12 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black transition-all"
                                        >
                                            A-
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReaderFontSize(18)}
                                            className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Reset {readerFontSize}px
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReaderFontSize((size) => Math.min(30, size + 1))}
                                            className="w-12 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black transition-all"
                                        >
                                            A+
                                        </button>
                                    </div>
                                </div>

                                {/* Auto Scroll */}
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block">Auto Scroll</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">Speed</span>
                                                <span className="text-[10px] text-gray-500">{autoScrollSpeed}x</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="10" value={autoScrollSpeed}
                                                onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
                                                className="w-32 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={toggleAutoScroll}
                                            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all ${autoScrolling ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white text-black hover:bg-gray-200'}`}
                                        >
                                            {autoScrolling ? <><Pause size={20} /> STOP SCROLL</> : <><Play size={20} /> START SCROLL</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Keyboard Info */}
                                <div className="pt-8 border-t border-white/10">
                                    <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-4">Shortcuts</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs"><span className="text-gray-500">Prev Chapter</span> <kbd className="bg-white/5 px-2 py-1 rounded-md text-gray-300 font-mono">←</kbd></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-500">Next Chapter</span> <kbd className="bg-white/5 px-2 py-1 rounded-md text-gray-300 font-mono">→</kbd></div>
                                        <div className="flex justify-between text-xs"><span className="text-gray-500">Toggle Auto Scroll</span> <kbd className="bg-white/5 px-2 py-1 rounded-md text-gray-300 font-mono">Ctrl + Space</kbd></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Chapter List Sidebar */}
            <AnimatePresence>
                {showChapterList && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                            onClick={() => setShowChapterList(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="fixed inset-y-0 right-0 w-[400px] max-w-[90vw] bg-[#111111] border-l border-white/10 z-[70] shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-white">Chapters</h3>
                                    <button onClick={() => setShowChapterList(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input 
                                            type="text"
                                            placeholder="Search chapter..."
                                            value={chapterSearch}
                                            onChange={(e) => setChapterSearch(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-red-500 transition-all"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => setSortOrder(sortOrder === 'source' ? 'reverse' : 'source')}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:bg-white/10 ${sortOrder === 'reverse' ? 'text-red-500' : 'text-gray-400'}`}
                                        title={sortOrder === 'source' ? 'Balik urutan' : 'Urutan bawaan'}
                                    >
                                        <ArrowUpDown size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2">
                                {visibleChapters.map(ch => {
                                    const isActive = (ch.slug && ch.slug === chapter.slug) || (ch.id && ch.id === chapter.id);
                                    const isRead = readChapterIds.includes(ch.id);
                                    const dateStr = ch.created_at ? new Date(ch.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
                                    
                                    return (
                                        <Link 
                                            key={ch.id || ch.slug}
                                            href={getSafeRoute('novel.read', [novel.slug, ch.slug || ch.chapter_number])}
                                            className={`group relative flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                                                isActive 
                                                ? 'bg-red-600 border-red-500 text-white shadow-xl shadow-red-600/20 translate-x-1' 
                                                : isRead 
                                                  ? 'bg-red-500/5 border-red-500/10 text-red-500/70 hover:bg-red-500/10 hover:border-red-500/20 hover:translate-x-1'
                                                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:translate-x-1'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col min-w-0">
                                                    <span className={`text-sm font-black transition-colors ${isActive ? 'text-white' : isRead ? 'text-red-500' : 'text-gray-200 group-hover:text-red-500'}`}>{ch.title || ch.slug}</span>
                                                    
                                                </div>
                                                
                                                {isActive ? (
                                                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Reading</span>
                                                    </div>
                                                ) : isRead ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10">
                                                        <CheckCircle size={10} className="text-red-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-none">READ</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end shrink-0">
                                                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{dateStr}</span>
                                                        <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Decoration */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-white rounded-r-full" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(239, 68, 68, 0.5);
                }
                .novel-read-page {
                    background:
                        radial-gradient(circle at top, rgba(30, 41, 59, 0.75), transparent 34rem),
                        #0a0a0a;
                }
                .novel-reader-shell {
                    max-width: 860px;
                    margin: 0 auto;
                    padding: 36px 22px 52px;
                }
                .novel-reader-meta {
                    text-align: center;
                    margin-bottom: 34px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid rgba(255,255,255,.08);
                }
                .novel-reader-meta h1 {
                    margin: 0;
                    color: #f8fafc;
                    font-size: clamp(1.35rem, 3vw, 2.25rem);
                    line-height: 1.35;
                    font-weight: 900;
                    letter-spacing: -0.035em;
                }
                .novel-reader-toolbar {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                    margin: -10px 0 30px;
                }
                .novel-reader-toolbar button {
                    min-width: 52px;
                    height: 38px;
                    padding: 0 14px;
                    border-radius: 999px;
                    background: rgba(255,255,255,.075);
                    border: 1px solid rgba(255,255,255,.10);
                    color: #f8fafc;
                    font-size: 12px;
                    font-weight: 900;
                    cursor: pointer;
                    transition: all .2s ease;
                }
                .novel-reader-toolbar button:hover {
                    background: rgba(239,68,68,.22);
                    border-color: rgba(239,68,68,.35);
                    color: #ffffff;
                }
                .novel-reader-content {
                    color: #e5e7eb;
                    font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                    font-size: 18px;
                    line-height: 2.05;
                    font-weight: 500;
                    letter-spacing: .002em;
                    text-align: left;
                    word-break: normal;
                    overflow-wrap: break-word;
                    white-space: normal;
                }
                .novel-reader-content p {
                    margin: 0 0 1.35em;
                    padding: 0;
                }
                .novel-reader-content p + p,
                .novel-reader-content div + div {
                    margin-top: 0.35em;
                }
                .novel-reader-content div {
                    line-height: inherit;
                }
                .novel-reader-content p:empty {
                    display: none;
                }
                .novel-reader-content br {
                    display: block;
                    content: "";
                    margin-bottom: 0.25em;
                }
                .novel-reader-content h1,
                .novel-reader-content h2,
                .novel-reader-content h3,
                .novel-reader-content h4 {
                    color: #ffffff;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    font-weight: 900;
                    line-height: 1.35;
                    margin: 2.2em 0 1em;
                    letter-spacing: -0.025em;
                }
                .novel-reader-content strong,
                .novel-reader-content b {
                    color: #ffffff;
                    font-weight: 800;
                }
                .novel-reader-content em,
                .novel-reader-content i {
                    color: #f1f5f9;
                }
                .novel-reader-content blockquote {
                    margin: 2em 0;
                    padding: 1em 1.25em;
                    border-left: 4px solid #ef4444;
                    background: rgba(255,255,255,.045);
                    border-radius: 0 18px 18px 0;
                    color: #f8fafc;
                }
                .novel-reader-content img {
                    max-width: 100%;
                    height: auto;
                    margin: 2rem auto;
                    display: block;
                    border-radius: 18px;
                }
                .novel-reader-content a {
                    color: #f87171;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                }
                @media (max-width: 640px) {
                    .novel-reader-shell {
                        padding-left: 4px;
                        padding-right: 4px;
                    }
                    .novel-reader-content {
                        line-height: 1.95;
                    }
                    .novel-reader-meta {
                        margin-bottom: 24px;
                    }
                }
            `}</style>
            <Footer />
        </div>
    );
}
