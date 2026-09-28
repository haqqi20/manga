import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
    X, Search, Loader2, AlertCircle, CheckCircle, Sparkles, Star, Film
} from 'lucide-react';
import { Button } from '@/Components/Admin/UI';

function formatStatus(s) {
    const m = { FINISHED: 'Completed', RELEASING: 'Ongoing', NOT_YET_RELEASED: 'Upcoming', CANCELLED: 'Completed', HIATUS: 'Ongoing' };
    return m[s] ?? s ?? '—';
}

function ResultCard({ result, loading, onSelect }) {
    return (
        <button
            onClick={onSelect}
            disabled={loading}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
                bg-[#222222] border border-white/[0.08] hover:bg-[#2a2a2a] hover:border-white/15 disabled:opacity-50 group"
        >
            {result.poster ? (
                <img
                    src={result.poster}
                    alt={result.title}
                    className="w-10 h-14 object-cover rounded-lg shrink-0 bg-white dark:bg-slate-900/5"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            ) : (
                <div className="w-10 h-14 bg-white dark:bg-slate-900/5 rounded-lg shrink-0 flex items-center justify-center">
                    <Film size={14} className="text-white/20" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold leading-tight line-clamp-1">{result.title}</p>
                {result.title_english && result.title_english !== result.title && (
                    <p className="text-white/40 text-xs line-clamp-1 mt-0.5">{result.title_english}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-white dark:bg-slate-900/10 rounded text-[10px] font-semibold text-white/60">{result.format || '—'}</span>
                    {result.year && <span className="text-white/50 text-xs">{result.year}</span>}
                    {result.score && <span className="text-amber-400 text-xs font-medium">★ {result.score}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold
                        ${result.status === 'RELEASING' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {formatStatus(result.status)}
                    </span>
                </div>
            </div>
            {loading ? (
                <Loader2 size={15} className="text-white/40 shrink-0 animate-spin" />
            ) : (
                <span className="text-xs text-[#ff2e2e] font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Pilih</span>
            )}
        </button>
    );
}

export default function AnilistAutofillModal({ open, onClose, currentTitle = '', onAutofill }) {
    const [query, setQuery] = useState(currentTitle);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [searchError, setSearchError] = useState('');
    const [fetchingId, setFetchingId] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setQuery(currentTitle);
            setResults([]);
            setSearchError('');
            setFetchingId(null);
            // Auto-search if title provided
            if (currentTitle?.length >= 2) {
                doSearch(currentTitle);
            }
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const doSearch = async (q) => {
        setSearching(true);
        setSearchError('');
        setResults([]);
        try {
            const res = await axios.get('/api/anilist/search', { params: { q: q.trim() } });
            setResults(res.data || []);
            if (!res.data?.length) setSearchError('Tidak ada hasil. Coba kata kunci lain.');
        } catch (e) {
            const msg = e.response?.data?.error
                ?? (e.response?.status ? `HTTP ${e.response.status}` : null)
                ?? e.message
                ?? 'Gagal menghubungi AniList API.';
            setSearchError(msg);
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = () => {
        if (query.trim().length >= 2) doSearch(query.trim());
    };

    const handleSelect = async (result) => {
        setFetchingId(result.id);
        try {
            const res = await axios.get('/api/anilist/fetch', { params: { id: result.id } });
            onAutofill(res.data);
            onClose();
        } catch (e) {
            const msg = e.response?.data?.error
                ?? (e.response?.status ? `HTTP ${e.response.status}` : null)
                ?? e.message
                ?? 'Gagal mengambil detail anime dari AniList.';
            setSearchError(msg);
        } finally {
            setFetchingId(null);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-violet-500/15 rounded-xl flex items-center justify-center">
                            <Sparkles size={14} className="text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-sm">Auto-fill dari AniList</h2>
                            <p className="text-white/40 text-xs">Cari & isi otomatis data anime</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                placeholder="Cari judul anime di AniList..."
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm
                                    placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            loading={searching}
                            disabled={query.trim().length < 2}
                        >
                            <Search size={14} />
                            Cari
                        </Button>
                    </div>

                    {searchError && (
                        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mt-3">
                            <AlertCircle size={13} />
                            {searchError}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-5">
                    {searching && (
                        <div className="flex items-center justify-center py-12 text-white/40">
                            <Loader2 size={22} className="animate-spin mr-2" />
                            Mencari di AniList...
                        </div>
                    )}

                    {!searching && results.length === 0 && !searchError && (
                        <div className="text-center py-12 text-white/25">
                            <Sparkles size={28} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Ketik judul anime untuk mencari</p>
                        </div>
                    )}

                    {!searching && results.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-white/40 text-xs mb-3">{results.length} hasil — klik untuk mengisi form secara otomatis</p>
                            {results.map((r) => (
                                <ResultCard
                                    key={r.id}
                                    result={r}
                                    loading={fetchingId === r.id}
                                    onSelect={() => handleSelect(r)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-white/[0.06] shrink-0 flex items-center justify-between text-xs text-white/30">
                    <span>Data dari <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors underline underline-offset-2">AniList.co</a></span>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xs">Batal</button>
                </div>
            </div>
        </div>
    );
}
