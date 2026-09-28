import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    X, Search, ChevronRight, Download, CheckSquare, Square, Loader2,
    RefreshCw, AlertCircle, CheckCircle, PlaySquare, ExternalLink,
    Zap, List, Database
} from 'lucide-react';
import { Button } from '@/Components/Admin/UI';

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step }) {
    const steps = ['Cari Anime', 'Pilih Episode', 'Hasil Import'];
    return (
        <div className="flex items-center gap-2 mb-6">
            {steps.map((label, i) => {
                const idx = i + 1;
                const done = step > idx;
                const active = step === idx;
                return (
                    <div key={i} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 ${active || done ? '' : 'opacity-40'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-[#ff2e2e] text-white' : 'bg-white dark:bg-slate-900/10 text-white/60'}`}>
                                {done ? <CheckCircle size={14} /> : idx}
                            </div>
                            <span className={`text-xs font-medium ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-white/40'}`}>
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <ChevronRight size={14} className="text-white/20 shrink-0" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Search Result Card ───────────────────────────────────────────────────────
function SearchResultCard({ result, selected, onSelect }) {
    return (
        <button
            onClick={onSelect}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border
                ${selected
                    ? 'bg-[#ff2e2e]/20 border-[#ff2e2e]/50 text-white'
                    : 'bg-[#222222] border-white/[0.08] hover:bg-[#2a2a2a] hover:border-white/15 text-white/70 hover:text-white'
                }`}
        >
            {result.thumbnail && (
                <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-10 h-14 object-cover rounded-lg shrink-0 bg-white dark:bg-slate-900/5"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            )}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium leading-tight line-clamp-2">{result.title}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold
                        ${result.status === 'Ongoing' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {result.status}
                    </span>
                    {result.rating && (
                        <span className="text-amber-400 text-xs">★ {result.rating}</span>
                    )}
                    <span className="text-white/40 text-xs truncate">{result.slug}</span>
                </div>
            </div>
            {selected && <CheckCircle size={16} className="text-[#ff2e2e] shrink-0" />}
        </button>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ScrapeEpisodeModal({ anime, onClose }) {
    const [step, setStep] = useState(1);

    // Step 1 state
    const [searchQuery, setSearchQuery] = useState(anime.title || '');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [selectedResult, setSelectedResult] = useState(null);

    // Step 2 state
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    const [episodeList, setEpisodeList] = useState([]);
    const [selectedEpisodes, setSelectedEpisodes] = useState(new Set());
    const [mode, setMode] = useState('full'); // 'full' or 'stub'
    const [importing, setImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');

    // Step 3 state
    const [importResult, setImportResult] = useState(null);

    const searchRef = useRef(null);

    // Auto-search on open
    useEffect(() => {
        if (searchQuery.length >= 2) handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async () => {
        if (searchQuery.trim().length < 2) return;
        setSearching(true);
        setSearchError('');
        setSearchResults([]);
        setSelectedResult(null);
        try {
            const res = await axios.get(`/admin/otakudesu/search`, { params: { q: searchQuery.trim() } });
            setSearchResults(res.data || []);
            if (!res.data?.length) setSearchError(`Tidak ada hasil ditemukan di Otakudesu. Coba kata kunci lain.`);
        } catch (e) {
            setSearchError(e.response?.data?.error || `Gagal menghubungi API Otakudesu.`);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectAnime = async (result) => {
        setSelectedResult(result);
        setStep(2);
        setLoadingEpisodes(true);
        setEpisodeList([]);
        setSelectedEpisodes(new Set());
        try {
            const res = await axios.get(`/admin/otakudesu/anime/${result.slug}`);
            const list = res.data?.episode_list || [];
            setEpisodeList(list);
            // Default: select all
            setSelectedEpisodes(new Set(list.map((_, i) => i)));
        } catch (e) {
            setEpisodeList([]);
        } finally {
            setLoadingEpisodes(false);
        }
    };

    const toggleAll = (checked) => {
        if (checked) {
            setSelectedEpisodes(new Set(episodeList.map((_, i) => i)));
        } else {
            setSelectedEpisodes(new Set());
        }
    };

    const toggleEpisode = (idx) => {
        const next = new Set(selectedEpisodes);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setSelectedEpisodes(next);
    };

    const applyRange = () => {
        const from = parseInt(rangeFrom);
        const to = parseInt(rangeTo);
        const next = new Set();
        episodeList.forEach((ep, i) => {
            const num = parseEpNumber(ep.episode || ep.slug);
            if (num !== null && (!rangeFrom || num >= from) && (!rangeTo || num <= to)) {
                next.add(i);
            }
        });
        setSelectedEpisodes(next);
    };

    const parseEpNumber = (str) => {
        const m = str.match(/Episode\s+(\d+)/i) || str.match(/episode-(\d+)/i);
        return m ? parseInt(m[1]) : null;
    };

    const FULL_BATCH = 20; // episodes per request in full mode

    const handleImport = async () => {
        if (selectedEpisodes.size === 0) return;
        setImporting(true);

        const episodes = [...selectedEpisodes].map(i => ({
            slug: episodeList[i].slug,
            label: episodeList[i].episode || '',
        }));

        // Stub mode: single request (no per-episode API calls, fast)
        if (mode === 'stub') {
            setImportProgress({ current: episodes.length, total: episodes.length });
            try {
                const endpoint = `/admin/anime/${anime.id}/scrape-episodes`;
                const res = await axios.post(endpoint, { episodes, mode: 'stub' });
                setImportResult(res.data);
            } catch (e) {
                setImportResult({
                    success: false,
                    error: e.response?.data?.error || e.response?.data?.message || 'Terjadi kesalahan saat import.',
                });
            } finally {
                setImporting(false);
                setStep(3);
            }
            return;
        }

        // Full mode: batch requests to avoid server timeout
        const batches = [];
        for (let i = 0; i < episodes.length; i += FULL_BATCH) {
            batches.push(episodes.slice(i, i + FULL_BATCH));
        }

        let totalImported = 0, totalUpdated = 0, totalFailed = 0, allErrors = [];
        setImportProgress({ current: 0, total: episodes.length });

        try {
            for (let b = 0; b < batches.length; b++) {
                const endpoint = `/admin/anime/${anime.id}/scrape-episodes`;
                const res = await axios.post(
                    endpoint,
                    { episodes: batches[b], mode: 'full' },
                    { timeout: 120000 } // 2 min per batch
                );
                const d = res.data;
                totalImported += d.imported ?? 0;
                totalUpdated += d.updated ?? 0;
                totalFailed += d.failed ?? 0;
                if (d.errors?.length) allErrors = allErrors.concat(d.errors);
                setImportProgress({
                    current: Math.min((b + 1) * FULL_BATCH, episodes.length),
                    total: episodes.length,
                });
            }

            // Fetch final total from last response or use sum
            const finalTotal = totalImported + totalUpdated;
            setImportResult({
                success: true,
                imported: totalImported,
                updated: totalUpdated,
                failed: totalFailed,
                errors: allErrors,
                total: finalTotal,
            });
        } catch (e) {
            setImportResult({
                success: false,
                error: e.response?.data?.error || e.response?.data?.message
                    || (e.code === 'ECONNABORTED' ? 'Request timeout. Coba kurangi jumlah episode atau gunakan mode Stub.' : 'Terjadi kesalahan saat import.'),
            });
        } finally {
            setImporting(false);
            setStep(3);
        }
    };

    const allSelected = episodeList.length > 0 && selectedEpisodes.size === episodeList.length;
    const indeterminate = selectedEpisodes.size > 0 && !allSelected;

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#ff2e2e]/15 rounded-xl flex items-center justify-center">
                            <Database size={15} className="text-[#ff2e2e]" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm">Scrape Episode dari Otakudesu</h2>
                            <p className="text-white/60 text-xs truncate max-w-[300px]">{anime.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors p-1"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    <StepIndicator step={step} />

                    {/* ── Step 1: Search ─────────────────────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-white/50 text-sm">
                                Cari anime di database Otakudesu, lalu pilih yang sesuai untuk import episodenya.
                            </p>

                            {/* Search box */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        ref={searchRef}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder={`Cari judul anime di Otakudesu...`}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm
                                            placeholder:text-white/25 focus:outline-none focus:border-white/40 transition-colors"
                                    />
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    loading={searching}
                                    disabled={searchQuery.trim().length < 2}
                                >
                                    <Search size={14} />
                                    Cari
                                </Button>
                            </div>

                            {/* Error */}
                            {searchError && (
                                <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                    <AlertCircle size={15} className="shrink-0" />
                                    {searchError}
                                </div>
                            )}

                            {/* Loading */}
                            {searching && (
                                <div className="flex items-center justify-center py-10 text-white/40">
                                    <Loader2 size={22} className="animate-spin mr-2" />
                                    Mencari anime...
                                </div>
                            )}

                            {/* Results */}
                            {!searching && searchResults.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-white/40 text-xs">{searchResults.length} hasil ditemukan — pilih yang sesuai:</p>
                                    {searchResults.map((r, i) => (
                                        <SearchResultCard
                                            key={i}
                                            result={r}
                                            selected={selectedResult?.slug === r.slug}
                                            onSelect={() => handleSelectAnime(r)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Episode List ────────────────────────────────── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {/* Selected anime info */}
                            <div className="flex items-center gap-3 bg-[#ff2e2e]/10 border border-[#ff2e2e]/20 rounded-xl p-3">
                                <Zap size={14} className="text-[#ff2e2e] shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate">{selectedResult?.title}</p>
                                    <p className="text-white/40 text-xs">{selectedResult?.slug}</p>
                                </div>
                                <button
                                    onClick={() => { setStep(1); setEpisodeList([]); }}
                                    className="ml-auto text-white/40 hover:text-white text-xs flex items-center gap-1 shrink-0 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Ganti
                                </button>
                            </div>

                            {loadingEpisodes && (
                                <div className="flex items-center justify-center py-10 text-white/40">
                                    <Loader2 size={22} className="animate-spin mr-2" />
                                    Memuat daftar episode...
                                </div>
                            )}

                            {!loadingEpisodes && episodeList.length > 0 && (
                                <>
                                    {/* Import Mode */}
                                    <div className="bg-[#1a1a1a] border border-white/[0.07] rounded-xl p-3.5">
                                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">Mode Import</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setMode('full')}
                                                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                                    ${mode === 'full' ? 'bg-[#ff2e2e]/15 border border-[#ff2e2e]/40 text-[#ff2e2e]' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}
                                            >
                                                <Database size={14} />
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold">Full Scrape</p>
                                                    <p className="text-[10px] opacity-70">Ambil streaming & download links</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setMode('stub')}
                                                className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                                    ${mode === 'stub' ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}
                                            >
                                                <List size={14} />
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold">Stub Only</p>
                                                    <p className="text-[10px] opacity-70">Hanya buat daftar episode (cepat)</p>
                                                </div>
                                            </button>
                                        </div>
                                        {mode === 'full' && (
                                            <p className="text-amber-400/80 text-xs mt-2 flex items-center gap-1.5">
                                                <AlertCircle size={11} />
                                                Diproses per 20 episode (~{Math.ceil(selectedEpisodes.size / 20)} batch).
                                                Estimasi ~{Math.ceil(selectedEpisodes.size * 1.5)}s. Gunakan Stub untuk kecepatan.
                                            </p>
                                        )}
                                    </div>

                                    {/* Select range */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white/60 text-xs">Range eps:</span>
                                        <input
                                            type="number"
                                            value={rangeFrom}
                                            onChange={e => setRangeFrom(e.target.value)}
                                            placeholder="Dari"
                                            className="w-16 bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-white/30"
                                        />
                                        <span className="text-white/20">—</span>
                                        <input
                                            type="number"
                                            value={rangeTo}
                                            onChange={e => setRangeTo(e.target.value)}
                                            placeholder="Sampai"
                                            className="w-16 bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-white/30"
                                        />
                                        <button 
                                            onClick={applyRange}
                                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors border border-white/10"
                                        >
                                            Terapkan
                                        </button>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-white/70 hover:text-white transition-colors">
                                            <button
                                                type="button"
                                                onClick={() => toggleAll(!allSelected)}
                                                className="text-[#ff2e2e]"
                                            >
                                                {allSelected ? (
                                                    <CheckSquare size={18} fill="currentColor" />
                                                ) : indeterminate ? (
                                                    <CheckSquare size={18} className="text-white/30" />
                                                ) : (
                                                    <Square size={18} className="text-white/30" />
                                                )}
                                            </button>
                                            Pilih Semua
                                        </label>
                                        <span className="text-white/40 text-xs">
                                            {selectedEpisodes.size} / {episodeList.length} terpilih
                                        </span>
                                    </div>

                                    {/* Episode list */}
                                    <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                        {episodeList.map((ep, i) => {
                                            const checked = selectedEpisodes.has(i);
                                            const num = parseEpNumber(ep.episode || ep.slug);
                                            return (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => toggleEpisode(i)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors border-b border-white/[0.04] last:border-0
                                                        ${checked ? 'bg-[#ff2e2e]/5' : 'hover:bg-white/[0.03]'}`}
                                                >
                                                    {checked ? (
                                                        <CheckSquare size={15} className="text-[#ff2e2e] shrink-0" fill="currentColor" />
                                                    ) : (
                                                        <Square size={15} className="text-white/25 shrink-0" />
                                                    )}
                                                    <span className={`text-xs font-semibold ${checked ? 'text-white' : 'text-white/70'}`}>
                                                        {num !== null ? `Ep ${num}` : `#${i + 1}`}
                                                    </span>
                                                    <span className={`text-xs truncate flex-1 ${checked ? 'text-white/60' : 'text-white/40'}`}>
                                                        {ep.episode || ep.slug}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {!loadingEpisodes && episodeList.length === 0 && (
                                <div className="text-center py-10 text-white/30">
                                    <PlaySquare size={28} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">Tidak ada episode ditemukan di Otakudesu untuk anime ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: Result ──────────────────────────────────────── */}
                    {step === 3 && importResult && (
                        <div className="space-y-4">
                            {importResult.success ? (
                                <>
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} className="text-emerald-400" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg">Import Selesai!</h3>
                                        <p className="text-white/50 text-sm mt-1">Total episode di database: <strong className="text-white">{importResult.total}</strong></p>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                                            <p className="text-emerald-400 text-2xl font-bold">{importResult.imported}</p>
                                            <p className="text-white/50 text-xs mt-0.5">Ditambahkan</p>
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                                            <p className="text-blue-400 text-2xl font-bold">{importResult.updated}</p>
                                            <p className="text-white/50 text-xs mt-0.5">Diperbarui</p>
                                        </div>
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                            <p className="text-red-400 text-2xl font-bold">{importResult.failed}</p>
                                            <p className="text-white/50 text-xs mt-0.5">Gagal</p>
                                        </div>
                                    </div>

                                    {/* Errors */}
                                    {importResult.errors?.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 max-h-32 overflow-y-auto">
                                            <p className="text-red-400 text-xs font-semibold mb-2">Detail Kesalahan:</p>
                                            {importResult.errors.map((err, i) => (
                                                <p key={i} className="text-red-300/70 text-xs">{err}</p>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-14 h-14 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle size={28} className="text-red-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-base">Import Gagal</h3>
                                    <p className="text-red-400/80 text-sm mt-2">{importResult.error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/[0.06] shrink-0 flex items-center justify-between gap-3">
                    {/* Back / status info */}
                    <div>
                        {step === 2 && !loadingEpisodes && (
                            <button
                                onClick={() => setStep(1)}
                                className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1"
                            >
                                ← Kembali
                            </button>
                        )}
                        {step === 1 && (
                            <a
                                href="https://otakudesu.cloud"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-white/30 hover:text-white/60 text-xs transition-colors"
                            >
                                <ExternalLink size={11} />
                                otakudesu.cloud
                            </a>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {step === 3 ? (
                            <Button onClick={onClose}>
                                Selesai
                            </Button>
                        ) : (
                            <Button variant="secondary" onClick={onClose}>
                                Batal
                            </Button>
                        )}

                        {step === 2 && !loadingEpisodes && episodeList.length > 0 && (
                            <Button
                                onClick={handleImport}
                                loading={importing}
                                disabled={selectedEpisodes.size === 0}
                            >
                                <Download size={14} />
                                {importing
                                    ? `${importProgress.current}/${importProgress.total}...`
                                    : `Import ${selectedEpisodes.size} Episode`
                                }
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
