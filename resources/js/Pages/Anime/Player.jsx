import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import UserAvatar from '@/Components/UserAvatar';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
    ChevronLeft, ChevronRight, Heart, Star, Calendar, Film, Tv,
    Clock, Signal, BookOpen, Play, Search, List, Monitor, Lightbulb,
    ChevronDown, ChevronUp, Download, ExternalLink, Server, Layers,
    Grid3x3, Eye, X, MessageSquareReply, Users, AlertTriangle
} from 'lucide-react';
import AuthModal from '@/Components/AuthModal';
import ReportModal from '@/Components/ReportModal';
import AdSlot from '@/Components/AdSlot';

export default function Player({ anime, episode, allEpisodes, isBookmarked = false }) {
    const { auth, ads } = usePage().props;
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const comments = episode.comments || [];

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            window.location.href = '/login';
            return;
        }
        if (!commentText.trim()) return;

        router.post(`/episode/${episode.id}/comment`, { content: commentText }, {
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

        router.post(`/episode/${episode.id}/comment`, { content: replyText, parent_id: parentId }, {
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

    const [synopsisExpanded, setSynopsisExpanded] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState(episode.video_url || null);
    const [activeServerLabel, setActiveServerLabel] = useState('Default');
    const [downloadExpanded, setDownloadExpanded] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [epSort, setEpSort] = useState('asc');      // 'asc' | 'desc'
    const [epSortOpen, setEpSortOpen] = useState(false);
    const [epView, setEpView] = useState('card');     // 'card' | 'grid' | 'list'
    const [epSearchOpen, setEpSearchOpen] = useState(false);
    const [epSearch, setEpSearch] = useState('');
    const epSearchRef = useRef(null);
    const [cinemaMode, setCinemaMode] = useState(false);
    const [ambilightOn, setAmbilightOn] = useState(false);
    const [isFavorited, setIsFavorited] = useState(isBookmarked);
    const [showReportModal, setShowReportModal] = useState(false);

    const handleBookmark = () => {
        if (!auth?.user) { setShowAuthModal(true); return; }
        setIsFavorited(prev => !prev);
        router.post(`/anime/${anime.id}/bookmark`, {}, { preserveScroll: true });
    };

    const handleReport = () => {
        if (!auth?.user) { setShowAuthModal(true); return; }
        setShowReportModal(true);
    };

    const submitReport = (data) => {
        router.post(`/episode/${episode.id}/report`, data, {
            preserveScroll: true,
            onSuccess: () => {
                alert('Terima kasih, laporan Anda telah berhasil dikirim!');
            }
        });
    };

    const sortedEpisodes = useMemo(() => {
        if (!allEpisodes) return [];
        return [...allEpisodes].sort((a, b) => a.number - b.number);
    }, [allEpisodes]);

    const mirrorStreams = useMemo(() => {
        if (!episode.mirror_streams || !Array.isArray(episode.mirror_streams)) return [];
        return episode.mirror_streams;
    }, [episode.mirror_streams]);

    const downloadUrls = useMemo(() => {
        if (!episode.download_urls || !Array.isArray(episode.download_urls)) return [];
        return episode.download_urls;
    }, [episode.download_urls]);

    const totalEpisodes = sortedEpisodes.length;
    const currentIndex = sortedEpisodes.findIndex(ep => ep.number === episode.number);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < totalEpisodes - 1;
    const prevEp = hasPrev ? sortedEpisodes[currentIndex - 1] : null;
    const nextEp = hasNext ? sortedEpisodes[currentIndex + 1] : null;

    const statusColor = (anime.status || '').toLowerCase().includes('ongoing')
        ? 'text-emerald-600'
        : (anime.status || '').toLowerCase().includes('complete')
            ? 'text-blue-600'
            : 'text-yellow-600';

    const handleServerSwitch = (url, label) => {
        setActiveVideoUrl(url);
        setActiveServerLabel(label);
    };

    // Group mirrors by quality — supports both {label,url} (flat) and {quality,provider,stream_url} legacy
    const groupedMirrors = useMemo(() => {
        const groups = {};
        mirrorStreams.forEach(m => {
            const url = m.url || m.stream_url || '';
            if (!url) return;
            let quality = m.quality;
            let provider = m.provider;
            if (!quality || !provider) {
                const label = m.label || '';
                const resMatch = label.match(/(\d{3,4}p)/i);
                quality = resMatch ? resMatch[1].toUpperCase() : 'Default';
                provider = label.replace(/(\d{3,4}p)/i, '').trim() || label || 'Server';
            }
            if (!groups[quality]) groups[quality] = [];
            groups[quality].push({ quality, provider, url });
        });
        return groups;
    }, [mirrorStreams]);

    // Parse download URLs — supports flat {label,url} and legacy nested {resolution,size,urls:[]}
    // Label formats from scraper:
    //   "Mp4 360p - ODFiles (35.4 MB)"
    //   "MKV 480p - Pdrain (74.6 MB)"
    //   "360p - ODFiles (35.4 MB)"  (no prefix)
    //   "Mkv480p - ODFiles (74.6 MB)" (compact no-space)
    const parsedDownloads = useMemo(() => {
        if (!downloadUrls.length) return [];
        if (downloadUrls[0]?.urls) return downloadUrls; // legacy nested format

        const groups = {};
        downloadUrls.forEach(d => {
            const label = (d.label || '').trim();
            const url   = d.url || '';
            if (!url) return;

            // Universal pattern: optional (Mp4|MKV) prefix, then NNNp, then - Provider (size)
            const m = label.match(
                /^(mp4|mkv)?\s*(\d{3,4}p)\s*-\s*(.+?)(?:\s*\(([^)]+)\))?\s*$/i
            );

            let isMkv, resolution, provider, size;
            if (m) {
                isMkv      = /mkv/i.test(m[1] || '');
                resolution = m[2].toLowerCase(); // "360p", "480p", "720p", "1080p"
                provider   = m[3].trim();
                size       = m[4] || null;
            } else {
                // fallback: put in a catch-all group
                isMkv      = /mkv/i.test(label);
                resolution = isMkv ? 'mkv' : 'other';
                provider   = label;
                size       = null;
            }

            const key = (isMkv ? 'mkv-' : 'mp4-') + resolution;
            if (!groups[key]) groups[key] = { resolution, isMkv, size: null, urls: [] };
            if (size && !groups[key].size) groups[key].size = size;
            groups[key].urls.push({ provider, url });
        });

        const resOrder = ['360p', '480p', '720p', '1080p', 'other'];
        return Object.values(groups).sort((a, b) => {
            // MP4 before MKV
            if (a.isMkv !== b.isMkv) return a.isMkv ? 1 : -1;
            const ai = resOrder.indexOf(a.resolution);
            const bi = resOrder.indexOf(b.resolution);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
    }, [downloadUrls]);

    // Color map for providers
    const providerColors = {
        'ondesu': 'bg-blue-500',
        'updesu': 'bg-blue-500',
        'ondesuhd': 'bg-indigo-500',
        'vidhide': 'bg-emerald-500',
        'filedon': 'bg-orange-500',
        'mega': 'bg-red-500',
        'default': 'bg-slate-600',
    };

    const getProviderColor = (provider) => {
        return providerColors[(provider || '').toLowerCase()] || providerColors['default'];
    };

    const resolutionColors = {
        '360p':  'from-slate-500 to-slate-600',
        '480p':  'from-blue-500 to-blue-600',
        '720p':  'from-emerald-500 to-emerald-600',
        '1080p': 'from-purple-500 to-purple-600',
        'mkv':   'from-orange-500 to-orange-600',
    };

    const getResColor = (res) => {
        const r = (res || '').toLowerCase();
        if (r.includes('mkv')) return resolutionColors['mkv'];
        const key = Object.keys(resolutionColors).find(k => r.includes(k));
        return key ? resolutionColors[key] : 'from-slate-500 to-slate-600';
    };

    return (
        <AppLayout>
            <Head title={`${anime.title} - Episode ${episode.number}`} />

            {/* Ambilight dim overlay */}
            {ambilightOn && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 transition-opacity duration-500"
                    onClick={() => setAmbilightOn(false)}
                />
            )}

            <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white pb-12">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 md:py-6">

                    {/* Top Ad Slot */}
                    <AdSlot code={ads?.episode_detail_top} />

                    {/* ===== PLAYER + EPISODE SIDEBAR ===== */}
                    <div className={`flex flex-col lg:flex-row gap-4 ${ambilightOn ? 'relative z-50' : ''}`}>

                        {/* Video Player */}
                        <div className={`min-w-0 transition-all duration-300 ${cinemaMode ? 'w-full' : 'flex-1'}`}>
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative shadow-lg">
                                {auth?.user ? (
                                    <iframe
                                        key={activeVideoUrl}
                                        src={activeVideoUrl}
                                        className="absolute inset-0 w-full h-full"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/70 text-white gap-4">
                                        <p className="font-semibold text-lg">Video terkunci</p>
                                        <Link
                                            href="/login"
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                                        >
                                            Login untuk menonton
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* ===== TITLE BAR + EPISODE NAVIGATION ===== */}
                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {anime.title}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0 justify-center sm:justify-end">
                                    {/* Cinema Mode */}
                                    <button
                                        onClick={() => setCinemaMode(v => !v)}
                                        className={`p-2 rounded-lg border transition-colors hidden sm:flex shadow-sm ${
                                            cinemaMode
                                                ? 'bg-violet-600 border-violet-500 text-white'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                                        }`}
                                        title={cinemaMode ? 'Keluar Cinema Mode' : 'Cinema Mode'}
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                    {/* Ambilight */}
                                    <button
                                        onClick={() => setAmbilightOn(v => !v)}
                                        className={`p-2 rounded-lg border transition-colors hidden sm:flex shadow-sm ${
                                            ambilightOn
                                                ? 'bg-amber-500 border-amber-400 text-white'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                                        }`}
                                        title={ambilightOn ? 'Matikan Ambilight' : 'Ambilight'}
                                    >
                                        <Lightbulb className="w-4 h-4" />
                                    </button>

                                    {/* Prev Arrow */}
                                    {hasPrev ? (
                                        <Link
                                            href={`/anime/${anime.slug}/episode/${prevEp.number}`}
                                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                                            title={`Episode ${prevEp.number}`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 cursor-not-allowed">
                                            <ChevronLeft className="w-4 h-4" />
                                        </span>
                                    )}

                                    {/* EP Badge */}
                                    <div className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-red-600/20">
                                        {episode.number > 100000 ? 'OVA ' + (episode.number - 100000) : 'EP ' + episode.number}/{totalEpisodes || '?'}
                                    </div>

                                    {/* Next Arrow */}
                                    {hasNext ? (
                                        <Link
                                            href={`/anime/${anime.slug}/episode/${nextEp.number}`}
                                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                                            title={`Episode ${nextEp.number}`}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 cursor-not-allowed">
                                            <ChevronRight className="w-4 h-4" />
                                        </span>
                                    )}

                                    {/* Report */}
                                    <button
                                        onClick={handleReport}
                                        className="p-2 rounded-lg border transition-colors shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-orange-50 hover:border-orange-200 text-slate-500 dark:text-slate-400 hover:text-orange-600"
                                        title="Lapor Masalah"
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                    </button>

                                    {/* Favorite */}
                                    <button
                                        onClick={handleBookmark}
                                        className={`p-2 rounded-lg border transition-colors shadow-sm ${
                                            isFavorited
                                                ? 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 text-slate-500 dark:text-slate-400 hover:text-red-500'
                                        }`}
                                        title={isFavorited ? 'Hapus Bookmark' : 'Tambah Bookmark'}
                                    >
                                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* ===== MIRROR STREAMS / SERVER SWITCHER ===== */}
                            {mirrorStreams.length > 0 && (
                                <div className="mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                                        <Server className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Server Video</h3>
                                        <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full truncate max-w-[120px] sm:max-w-none">
                                            {activeServerLabel}
                                        </span>
                                    </div>

                                    {/* Quality groups */}
                                    <div className="px-3 sm:px-4 py-3 space-y-3">
                                        {Object.entries(groupedMirrors).map(([quality, mirrors]) => (
                                            <div key={quality} className="flex items-start gap-2">
                                                <span className="flex-shrink-0 w-10 text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1.5">
                                                    {quality}
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {mirrors.map((m, i) => {
                                                        const isActive = activeVideoUrl === m.url;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={() => handleServerSwitch(m.url, `${m.provider} ${quality}`)}
                                                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                                                                    isActive
                                                                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                                                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950 hover:border-slate-300 hover:text-slate-900 dark:text-white'
                                                                }`}
                                                            >
                                                                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white dark:bg-slate-900' : getProviderColor(m.provider)}`} />
                                                                <span>{m.provider}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ===== DOWNLOAD BOX ===== */}
                            {parsedDownloads.length > 0 && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">

                                    {/* Header */}
                                    <button
                                        onClick={() => setDownloadExpanded(!downloadExpanded)}
                                        className="w-full flex items-center gap-2.5 px-3 sm:px-4 py-3 bg-slate-900 hover:bg-slate-800 transition-colors"
                                    >
                                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-sm font-bold text-white">Download {episode.number > 100000 ? 'OVA ' + (episode.number - 100000) : 'Episode ' + episode.number}</span>
                                        <span className="text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900/[0.07] border border-white/10 px-2 py-0.5 rounded-full">
                                            {parsedDownloads.length} resolusi
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform duration-300 ${downloadExpanded ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Content */}
                                    <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{ maxHeight: downloadExpanded ? '2000px' : '0px', opacity: downloadExpanded ? 1 : 0 }}
                                    >
                                        {auth?.user ? (
        (() => {
          const mp4 = parsedDownloads.filter(r => !r.isMkv);
          const mkv = parsedDownloads.filter(r => r.isMkv);

          const renderRows = items =>
            items.map(res => (
              <div
                key={(res.isMkv ? 'mkv-' : 'mp4-') + res.resolution}
                className="px-3 sm:px-4 py-2 sm:py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:bg-slate-950 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex-shrink-0 w-[82px] sm:w-[90px] text-center text-[10px] sm:text-[11px] font-black tracking-wide text-white py-1.5 rounded-[6px] ${
                      res.isMkv ? 'bg-slate-700' : 'bg-slate-800'
                    }`}
                  >
                    {res.isMkv ? 'MKV' : 'Mp4'} {res.resolution}
                  </span>

                  <div className="flex-1 hidden sm:flex flex-wrap items-center min-w-0">
                    {(res.urls || []).map((link, li) => (
                      <span key={li} className="flex items-center">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-semibold text-blue-500 hover:text-red-500 transition-colors px-2 whitespace-nowrap"
                        >
                          {link.provider}
                        </a>
                        {li < (res.urls.length - 1) && (
                          <span className="text-slate-300 select-none text-[11px]">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  {res.size && (
                    <span className="flex-shrink-0 ml-auto sm:ml-0 text-[10px] sm:text-[11px] font-bold text-white bg-slate-700 group-hover:bg-slate-600 px-2.5 sm:px-3 py-1.5 rounded-[6px] tabular-nums transition-colors">
                      {res.size}
                    </span>
                  )}
                </div>

                <div className="flex sm:hidden flex-wrap items-center mt-1.5 -mx-1">
                  {(res.urls || []).map((link, li) => (
                    <span key={li} className="flex items-center">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-blue-500 hover:text-red-500 transition-colors px-1.5 py-0.5 whitespace-nowrap"
                      >
                        {link.provider}
                      </a>
                      {li < (res.urls.length - 1) && (
                        <span className="text-slate-200 select-none text-[11px]">|</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ));

          return (
            <div className="bg-white dark:bg-slate-900">
              {mp4.length > 0 && (
                <div>
                  <div className="px-3 sm:px-4 py-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      MP4
                    </span>
                    <span className="text-[9px] text-slate-300">— {mp4.length} resolusi</span>
                  </div>
                  {renderRows(mp4)}
                </div>
              )}
              {mkv.length > 0 && (
                <div>
                  <div className="px-3 sm:px-4 py-1.5 bg-slate-50 dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      MKV
                    </span>
                    <span className="text-[9px] text-slate-300">— {mkv.length} resolusi</span>
                  </div>
                  {renderRows(mkv)}
                </div>
              )}
            </div>
          );
        })()
      ) : (
        <div className="flex flex-col justify-center items-center py-10 bg-black/70 text-white gap-4">
          <p className="font-semibold text-lg">Download terkunci</p>
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
          >
            Login untuk mengunduh
          </Link>
        </div>
      )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Episode Sidebar */}
                        <div className={`lg:w-[320px] flex-shrink-0 lg:self-start lg:sticky lg:top-6 transition-all duration-300 ${cinemaMode ? 'hidden' : ''}`}>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[300px] lg:max-h-[520px]">

                                {/* ── Header: title + controls ── */}
                                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                                    <div className="flex gap-2 items-stretch">
                                        {/* Sort dropdown — custom, no native arrow */}
                                        <div className="relative flex-1">
                                            <button
                                                onClick={() => setEpSortOpen(v => !v)}
                                                className="flex items-center justify-between w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none hover:bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer font-medium"
                                            >
                                                <span>{epSort === 'asc' ? 'All Episodes' : 'Latest First'}</span>
                                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${epSortOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {epSortOpen && (
                                                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                                                    {[['asc', 'All Episodes'], ['desc', 'Latest First']].map(([val, label]) => (
                                                        <button
                                                            key={val}
                                                            onClick={() => { setEpSort(val); setEpSortOpen(false); }}
                                                            className={`w-full text-left text-xs px-3 py-2.5 transition-colors ${
                                                                epSort === val
                                                                    ? 'bg-red-50 text-red-600 font-semibold'
                                                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-950'
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* View / Search toggles */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEpView('card')}
                                                title="Card view"
                                                className={`h-10 w-10 flex justify-center items-center rounded-xl border transition-all ${
                                                    epView === 'card'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEpView('list')}
                                                title="List view"
                                                className={`h-10 w-10 flex justify-center items-center rounded-xl border transition-all ${
                                                    epView === 'list'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEpView('grid')}
                                                title="Grid view"
                                                className={`h-10 w-10 flex justify-center items-center rounded-xl border transition-all ${
                                                    epView === 'grid'
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <Grid3x3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEpSearchOpen(v => {
                                                        if (!v) setTimeout(() => epSearchRef.current?.focus(), 50);
                                                        else setEpSearch('');
                                                        return !v;
                                                    });
                                                }}
                                                title="Search episode"
                                                className={`h-10 w-10 flex justify-center items-center rounded-xl border transition-all ${
                                                    epSearchOpen
                                                        ? 'bg-red-50 text-red-600 border-red-200'
                                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                {epSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search input (slide open) */}
                                    {epSearchOpen && (
                                        <div className="relative mt-2 flex items-center">
                                            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                                            <input
                                                ref={epSearchRef}
                                                type="text"
                                                inputMode="numeric"
                                                placeholder={`Search ep 1–${totalEpisodes}…`}
                                                value={epSearch}
                                                onChange={e => setEpSearch(e.target.value)}
                                                autoComplete="off"
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs pl-9 pr-3 py-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:bg-white dark:bg-slate-900 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* ── Episode list ── */}
                                <div className="flex-1 overflow-y-auto">
                                    {(() => {
                                        let eps = [...sortedEpisodes];
                                        if (epSort === 'desc') eps = eps.reverse();
                                        if (epSearch.trim()) {
                                            const q = epSearch.trim().toLowerCase();
                                            eps = eps.filter(ep =>
                                                String(ep.number).includes(q) ||
                                                (ep.title || '').toLowerCase().includes(q)
                                            );
                                        }
                                        if (eps.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                    <Search className="w-6 h-6 mb-2 opacity-40" />
                                                    <span className="text-xs">Episode tidak ditemukan</span>
                                                </div>
                                            );
                                        }
                                        if (epView === 'card') {
                                            return (
                                                <div className="p-3 grid grid-cols-1 gap-2">
                                                    {eps.map(ep => {
                                                        const isCurrent = ep.number === episode.number;
                                                        const thumb = ep.thumbnail || anime.poster || null;
                                                        return (
                                                            <Link
                                                                key={ep.id}
                                                                href={`/anime/${anime.slug}/episode/${ep.number}`}
                                                                className={`relative overflow-hidden border h-[90px] w-full rounded-xl transition-all duration-300 flex-shrink-0 block ${
                                                                    isCurrent
                                                                        ? 'border-red-200 bg-red-50 pointer-events-none'
                                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-950'
                                                                }`}
                                                            >
                                                                <div className="flex h-full relative gap-2 group">
                                                                    <div className={`absolute z-10 top-2 left-2 px-2 py-0.5 text-xs rounded-lg font-bold ${
                                                                        isCurrent ? 'bg-red-600 text-white' : 'bg-black/60 text-white'
                                                                    }`}>
                                                                        {ep.number > 100000 ? 'OVA ' + (ep.number - 100000) : 'EP ' + ep.number}
                                                                    </div>
                                                                    {/* Thumbnail */}
                                                                    <div className="relative w-[110px] min-w-[110px] h-full overflow-hidden rounded-l-xl bg-slate-100 dark:bg-slate-800">
                                                                        {thumb ? (
                                                                            <img
                                                                                src={thumb}
                                                                                alt={`Episode ${ep.number}`}
                                                                                className="object-cover w-full h-full group-hover:scale-110 transition-all duration-300"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center">
                                                                                <Film className="w-6 h-6 text-slate-300" />
                                                                            </div>
                                                                        )}
                                                                        {isCurrent && (
                                                                            <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                                                                                <Play className="w-6 h-6 text-red-600 fill-red-600 drop-shadow" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {/* Info */}
                                                                    <div className="flex-1 flex flex-col py-2 pr-2 min-w-0">
                                                                        <p className={`text-xs font-semibold truncate ${
                                                                            isCurrent ? 'text-red-600' : 'text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:text-white'
                                                                        }`}>
                                                                            {ep.title ? ep.title : `Episode ${ep.number}`}
                                                                        </p>
                                                                        {anime.synopsis && (
                                                                            <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                                                                {anime.synopsis}
                                                                            </p>
                                                                        )}
                                                                        <div className="flex justify-between items-center mt-auto">
                                                                            {ep.created_at && (
                                                                                <p className="text-[10px] text-slate-400 truncate">
                                                                                    {new Date(ep.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                                </p>
                                                                            )}
                                                                            {isCurrent && (
                                                                                <span className="text-[9px] font-bold text-red-600 ml-auto">Now Playing</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        if (epView === 'grid') {
                                            return (
                                                <div className="p-3 flex flex-wrap gap-1.5">
                                                    {eps.map(ep => {
                                                        const isCurrent = ep.number === episode.number;
                                                        return (
                                                            <Link
                                                                key={ep.id}
                                                                href={`/anime/${anime.slug}/episode/${ep.number}`}
                                                                className={`w-10 h-10 text-sm font-medium flex items-center justify-center rounded flex-shrink-0 transition-all ${
                                                                    isCurrent
                                                                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 cursor-default pointer-events-none'
                                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 dark:text-white'
                                                                }`}
                                                                title={`Episode ${ep.number}`}
                                                            >
                                                                {isCurrent
                                                                    ? <Play className="w-3.5 h-3.5 fill-white" />
                                                                    : (ep.number > 100000 ? `OVA ${ep.number - 100000}` : ep.number)
                                                                }
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        // List view
                                        return (
                                            <div className="divide-y divide-slate-100">
                                                {eps.map(ep => {
                                                    const isCurrent = ep.number === episode.number;
                                                    return (
                                                        <Link
                                                            key={ep.id}
                                                            href={`/anime/${anime.slug}/episode/${ep.number}`}
                                                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                                                                isCurrent
                                                                    ? 'bg-red-50 pointer-events-none'
                                                                    : 'hover:bg-slate-50 dark:bg-slate-950'
                                                            }`}
                                                        >
                                                            <div className={`w-10 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                                                                isCurrent ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                            }`}>
                                                                {isCurrent ? <Play className="w-3 h-3 fill-white" /> : (ep.number > 100000 ? `OVA ${ep.number - 100000}` : ep.number)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`text-xs font-semibold truncate ${
                                                                    isCurrent ? 'text-red-600' : 'text-slate-700 dark:text-slate-200'
                                                                }`}>
                                                                    {ep.title ? ep.title : `Episode ${ep.number}`}
                                                                </div>
                                                            </div>
                                                            {isCurrent && (
                                                                <span className="text-[9px] font-bold uppercase tracking-wide text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded flex-shrink-0">Now</span>
                                                            )}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* ===== INFO CARD ===== */}
                    <div className="mt-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden max-w-3xl shadow-sm">

                        {/* ── Compact header: poster + title + badges ── */}
                        <div className="p-4 space-y-3">
                            <div className="flex gap-3">
                                {/* Poster thumbnail */}
                                {anime.poster && (
                                    <div className="w-16 h-24 rounded-xl overflow-hidden ring-1 ring-slate-200 flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                                        <img
                                            src={anime.poster}
                                            alt={anime.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Title + badges + meta */}
                                <div className="flex-1 space-y-2 min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{anime.title}</h3>

                                    {/* Inline status badges */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {anime.rating && (
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-50 border border-yellow-200">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-[10px] font-semibold text-yellow-700">{anime.rating}</span>
                                            </div>
                                        )}
                                        {anime.status && (
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                                (anime.status || '').toLowerCase().includes('ongoing')
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                                {anime.status}
                                            </span>
                                        )}
                                        {anime.type && (
                                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300">{anime.type}</span>
                                        )}
                                    </div>

                                    {/* Meta row: eps / duration / year */}
                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 flex-wrap">
                                        {(anime.episodes_count || totalEpisodes > 0) && (
                                            <span className="flex items-center gap-1">
                                                <Tv className="w-3 h-3" />
                                                {anime.episodes_count || totalEpisodes} eps
                                            </span>
                                        )}
                                        {episode.duration && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {episode.duration}
                                            </span>
                                        )}
                                        {anime.release_year && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                🇯🇵 {anime.release_year}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Toggle button (mobile only) ── */}
                        <button
                            onClick={() => setInfoExpanded(!infoExpanded)}
                            className="md:hidden w-full px-4 py-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-950 transition-colors"
                        >
                            <span className="text-xs text-slate-400 font-medium">
                                {infoExpanded ? 'Sembunyikan Detail' : 'Tampilkan Detail Lengkap'}
                            </span>
                            {infoExpanded
                                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                                : <ChevronDown className="w-4 h-4 text-slate-400" />
                            }
                        </button>

                        {/* ── Expanded details: always visible on desktop, collapsible on mobile ── */}
                        <div className={`${infoExpanded ? 'block' : 'hidden'} md:block px-4 pb-4 border-t border-slate-100 dark:border-slate-800`}>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
                                    {anime.status && (
                                        <div className="flex items-start gap-2">
                                            <Signal className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</div>
                                                <div className={`text-xs font-bold ${
                                                    (anime.status || '').toLowerCase().includes('ongoing') ? 'text-emerald-600' : 'text-blue-600'
                                                }`}>{anime.status}</div>
                                            </div>
                                        </div>
                                    )}
                                    {anime.type && (
                                        <div className="flex items-start gap-2">
                                            <Tv className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Format</div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{anime.type}</div>
                                            </div>
                                        </div>
                                    )}
                                    {(anime.episodes_count || totalEpisodes > 0) && (
                                        <div className="flex items-start gap-2">
                                            <Film className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Episodes</div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{anime.episodes_count || totalEpisodes}</div>
                                            </div>
                                        </div>
                                    )}
                                    {episode.duration && (
                                        <div className="flex items-start gap-2">
                                            <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Durasi</div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{episode.duration}</div>
                                            </div>
                                        </div>
                                    )}
                                    {anime.release_year && (
                                        <div className="flex items-start gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Tahun Rilis</div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                    <span className="text-slate-400 mr-1">JP</span>{anime.release_year}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {anime.studio && (
                                        <div className="flex items-start gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Studio</div>
                                                <div className="text-xs font-bold text-slate-900 dark:text-white">{anime.studio}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Genres */}
                                {anime.genres && anime.genres.length > 0 && (
                                    <div className="mt-4">
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Genres</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {anime.genres.map((g, i) => {
                                                const colors = [
                                                    'bg-rose-50 text-rose-700 border-rose-200',
                                                    'bg-blue-50 text-blue-700 border-blue-200',
                                                    'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                    'bg-violet-50 text-violet-700 border-violet-200',
                                                    'bg-amber-50 text-amber-700 border-amber-200',
                                                    'bg-teal-50 text-teal-700 border-teal-200',
                                                ];
                                                return (
                                                    <span
                                                        key={g.id}
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-default ${colors[i % colors.length]}`}
                                                    >
                                                        {g.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-3">
                                    <Link
                                        href={`/anime/${anime.slug}`}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Detail Anime →
                                    </Link>
                                </div>
                            </div>
                    </div>

                    {/* ===== SYNOPSIS ===== */}
                    {anime.synopsis && (
                        <div className="mt-6 max-w-3xl">
                            <h3 className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3">Synopsis</h3>
                            <div className={`text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${!synopsisExpanded ? 'line-clamp-3' : ''}`}>
                                {anime.synopsis}
                            </div>
                            {anime.synopsis.length > 200 && (
                                <button
                                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                                    className="mt-2 text-red-500 hover:text-red-600 text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                    {synopsisExpanded ? (
                                        <>Read Less <ChevronUp className="w-3 h-3" /></>
                                    ) : (
                                        <>Read More <ChevronDown className="w-3 h-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ===== COMMENTS ===== */}
                    <div className="mt-8 bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Komentar ({comments?.length || 0})
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
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:bg-slate-900 transition-all resize-none"
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
                        {comments?.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="group bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                                    <div className="flex gap-4">
                                        <UserAvatar user={comment.user} sizeClass="w-10 h-10" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{comment.user.name}</h4>
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
                                                    <MessageSquareReply className="w-3.5 h-3.5" />
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
                                                                className="px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 font-medium"
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
                                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{reply.user.name}</h4>
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
                    
                    {/* Bottom Ad Slot */}
                    <AdSlot code={ads?.episode_detail_bottom} className="mt-8" />
                </div>
            </div>
        </div>
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={submitReport}
            />
        </AppLayout>
    );
}
