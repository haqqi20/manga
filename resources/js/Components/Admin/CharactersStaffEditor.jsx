import { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    Users, UserCheck, Plus, Trash2, Sparkles, Loader2,
    AlertCircle, ChevronDown, ChevronUp, X, Search, CheckCircle,
    Pencil, RefreshCw, Save
} from 'lucide-react';
import { Button, Card, Input } from '@/Components/Admin/UI';

// ─── Small inline AniList search for cast sync ────────────────────────────────
function AnilistCastSync({ animeId, currentTitle, onClose }) {
    const [query, setQuery] = useState(currentTitle || '');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);

    const doSearch = async () => {
        if (query.trim().length < 2) return;
        setSearching(true); setError(''); setResults([]);
        try {
            const res = await axios.get('/api/anilist/search', { params: { q: query.trim() } });
            setResults(res.data || []);
            if (!res.data?.length) setError('Tidak ada hasil ditemukan.');
        } catch (e) {
            setError(e.response?.data?.error ?? e.message ?? 'Gagal mencari di AniList.');
        } finally {
            setSearching(false);
        }
    };

    const handleSync = async (anilistId) => {
        setSyncing(anilistId);
        setError('');
        try {
            const res = await axios.get('/api/anilist/fetch', { params: { id: anilistId } });
            const { characters = [], staff = [] } = res.data;
            router.post(
                `/admin/anime/${animeId}/sync-cast`,
                { characters, staff },
                {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                    onError: () => setError('Gagal menyimpan cast ke server.'),
                    onFinish: () => setSyncing(null),
                }
            );
        } catch (e) {
            setError(e.response?.data?.error ?? e.message ?? 'Gagal mengambil data dari AniList.');
            setSyncing(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-violet-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className="text-slate-900 dark:text-white text-sm font-semibold">Sync Cast dari AniList</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors"><X size={15} /></button>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Pilih anime dari AniList untuk mengganti semua Characters & Staff saat ini.</p>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doSearch()}
                        placeholder="Cari judul..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-900 dark:text-white text-xs placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <Button size="sm" onClick={doSearch} loading={searching} disabled={query.trim().length < 2}>
                    Cari
                </Button>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    <AlertCircle size={12} />{error}
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {results.map(r => (
                        <div key={r.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                            {r.poster && <img src={r.poster} alt={r.title} className="w-7 h-10 object-cover rounded shrink-0" />}
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-900 dark:text-white text-xs font-medium truncate">{r.title}</p>
                                <p className="text-slate-400 text-[10px]">{r.format} · {r.year}</p>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                loading={syncing === r.id}
                                onClick={() => handleSync(r.id)}
                                className="shrink-0 text-xs !py-1 !px-2.5"
                            >
                                {syncing === r.id ? '' : 'Sync'}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Add form (shared for both character and staff) ───────────────────────────
function AddForm({ type, animeId, onSuccess }) {
    const isChar = type === 'character';
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', image_url: '', role: 'Main', position: '' });
    const [error, setError] = useState('');

    const handle = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Nama wajib diisi.'); return; }
        setLoading(true); setError('');
        const url = isChar ? `/admin/anime/${animeId}/characters` : `/admin/anime/${animeId}/staff`;
        const payload = isChar
            ? { name: form.name, image_url: form.image_url || null, role: form.role }
            : { name: form.name, image_url: form.image_url || null, position: form.position || null };

        router.post(url, payload, {
            preserveScroll: true,
            onSuccess: () => { setForm({ name: '', image_url: '', role: 'Main', position: '' }); setOpen(false); onSuccess?.(); },
            onError: (err) => setError(Object.values(err)[0] ?? 'Gagal menyimpan.'),
            onFinish: () => setLoading(false),
        });
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 border-dashed
                    text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:border-slate-300 text-xs transition-all"
            >
                <Plus size={13} />
                Tambah {isChar ? 'Karakter' : 'Staff'}
            </button>
        );
    }

    return (
        <form onSubmit={handle} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Tambah {isChar ? 'Karakter' : 'Staff'}
                </span>
                <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Nama *</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder={isChar ? 'Frieren' : 'Yousuke Yamamoto'}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div>
                    <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">URL Gambar</label>
                    <input
                        value={form.image_url}
                        onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {isChar ? (
                <div>
                    <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Role</label>
                    <select
                        value={form.role}
                        onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none"
                    >
                        <option value="Main">Main</option>
                        <option value="Supporting">Supporting</option>
                    </select>
                </div>
            ) : (
                <div>
                    <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Posisi / Role</label>
                    <input
                        value={form.position}
                        onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
                        placeholder="Sutradara, Produser, Character Design..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            )}

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Batal</Button>
                <Button type="submit" size="sm" loading={loading}>
                    <Plus size={13} />
                    Tambah
                </Button>
            </div>
        </form>
    );
}

// ─── Character Edit Drawer ────────────────────────────────────────────────────
function CharacterEditDrawer({ item, animeId, onClose }) {
    const [form, setForm] = useState({
        name:        item.name        || '',
        image_url:   item.image_url   || '',
        role:        item.role        || 'Supporting',
        anilist_id:  item.anilist_id  || '',
        gender:      item.gender      || '',
        age:         item.age         || '',
        blood_type:  item.blood_type  || '',
        description: item.description || '',
    });
    const [saving,    setSaving]    = useState(false);
    const [fetching,  setFetching]  = useState(false);
    const [error,     setError]     = useState('');
    const [fetchMsg,  setFetchMsg]  = useState('');

    const fetchFromAnilist = async () => {
        const id = parseInt(form.anilist_id);
        if (!id) { setError('Masukkan AniList Character ID terlebih dahulu.'); return; }
        setFetching(true); setError(''); setFetchMsg('');
        try {
            const res = await axios.post('https://graphql.anilist.co', {
                query: `query($id:Int){Character(id:$id){id name{full}image{large}description(asHtml:false)gender age bloodType}}`,
                variables: { id },
            });
            const c = res.data?.data?.Character;
            if (!c) throw new Error('Character tidak ditemukan.');

            // Strip spoiler tags ~!...!~ and trim
            let desc = (c.description || '').replace(/~![\s\S]*?!~/g, '').replace(/<[^>]+>/g, '').trim();

            setForm(f => ({
                ...f,
                name:        c.name?.full     || f.name,
                image_url:   c.image?.large   || f.image_url,
                gender:      c.gender         || f.gender,
                age:         c.age            || f.age,
                blood_type:  c.bloodType      || f.blood_type,
                description: desc             || f.description,
            }));
            setFetchMsg(`✓ Data diambil: ${c.name?.full}`);
        } catch (e) {
            setError(e.response?.data?.errors?.[0]?.message ?? e.message ?? 'Gagal mengambil dari AniList.');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Nama wajib diisi.'); return; }
        setSaving(true); setError('');
        router.put(`/admin/anime/${animeId}/characters/${item.id}`, {
            ...form,
            anilist_id: form.anilist_id ? parseInt(form.anilist_id) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onError:   (err) => setError(Object.values(err)[0] ?? 'Gagal menyimpan.'),
            onFinish:  () => setSaving(false),
        });
    };

    const field = 'w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div className="flex items-center gap-2">
                        <Pencil size={15} className="text-blue-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Edit Karakter</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                    {/* AniList Fetch */}
                    <div className="bg-blue-500/5 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-blue-500 flex items-center gap-1.5">
                            <Sparkles size={12} /> Fetch dari AniList
                        </p>
                        <div className="flex gap-2">
                            <input
                                value={form.anilist_id}
                                onChange={e => setForm(f => ({ ...f, anilist_id: e.target.value }))}
                                placeholder="AniList Character ID (contoh: 176754)"
                                className={field + ' flex-1'}
                            />
                            <button
                                type="button"
                                onClick={fetchFromAnilist}
                                disabled={fetching}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
                            >
                                {fetching ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                Fetch
                            </button>
                        </div>
                        {fetchMsg && <p className="text-green-600 text-xs">{fetchMsg}</p>}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            <AlertCircle size={12} />{error}
                        </div>
                    )}

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Nama *</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={field} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">URL Gambar</label>
                            <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className={field} />
                        </div>
                        <div>
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Role</label>
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={field}>
                                <option value="Main">Main</option>
                                <option value="Supporting">Supporting</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Gender</label>
                            <input value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} placeholder="Female" className={field} />
                        </div>
                        <div>
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Age</label>
                            <input value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="1000+" className={field} />
                        </div>
                        <div>
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Blood Type</label>
                            <input value={form.blood_type} onChange={e => setForm(f => ({ ...f, blood_type: e.target.value }))} placeholder="A" className={field} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-slate-500 dark:text-slate-400 text-xs mb-1 block">Deskripsi</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                rows={5}
                                className={field}
                                placeholder="Deskripsi karakter..."
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-700 shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors">
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Single card (char or staff) ──────────────────────────────────────────────
function CastCard({ item, animeId, type, onDelete }) {
    const [deleting,  setDeleting]  = useState(false);
    const [showEdit,  setShowEdit]  = useState(false);
    const isChar = type === 'character';

    const handleDelete = () => {
        if (!confirm(`Hapus "${item.name}"?`)) return;
        setDeleting(true);
        const url = isChar
            ? `/admin/anime/${animeId}/characters/${item.id}`
            : `/admin/anime/${animeId}/staff/${item.id}`;
        router.delete(url, {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            {showEdit && isChar && (
                <CharacterEditDrawer item={item} animeId={animeId} onClose={() => setShowEdit(false)} />
            )}
            <div className="group relative flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                {/* Image */}
                <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 ${isChar ? 'w-16 h-20 rounded-lg' : 'w-14 h-14 rounded-full'}`}>
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                            {isChar ? <Users size={18} /> : <UserCheck size={18} />}
                        </div>
                    )}
                    {isChar && item.role && (
                        <div className="absolute top-1 right-1">
                            <span className={`text-[9px] px-1 py-0.5 rounded font-bold
                                ${item.role === 'Main' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                                {item.role}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="text-center min-w-0 w-full">
                    <p className="text-slate-900 dark:text-white text-xs font-medium line-clamp-2 leading-tight">{item.name}</p>
                    {!isChar && item.position && (
                        <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{item.position}</p>
                    )}
                    {isChar && (item.gender || item.age) && (
                        <p className="text-slate-400 text-[10px] mt-0.5">
                            {[item.gender, item.age].filter(Boolean).join(' · ')}
                        </p>
                    )}
                </div>

                {/* Action buttons */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Delete */}
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-5 h-5 rounded-full bg-red-100 hover:bg-red-500/80 flex items-center justify-center text-red-500 hover:text-white transition-all"
                        title="Hapus"
                    >
                        {deleting ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                    </button>
                    {/* Edit (character only) */}
                    {isChar && (
                        <button
                            onClick={() => setShowEdit(true)}
                            className="w-5 h-5 rounded-full bg-blue-100 hover:bg-blue-500/80 flex items-center justify-center text-blue-500 hover:text-white transition-all"
                            title="Edit detail"
                        >
                            <Pencil size={10} />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CharactersStaffEditor({ anime }) {
    const [showSync, setShowSync] = useState(false);

    const characters = anime.characters || [];
    const staff = anime.staff || [];

    return (
        <div className="space-y-5 mt-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                    <Users size={16} className="text-blue-400" />
                    Characters & Staff
                </h2>
                <button
                    onClick={() => setShowSync(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-200
                        text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-colors"
                >
                    <Sparkles size={12} />
                    Sync dari AniList
                    {showSync ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            </div>

            {/* AniList sync panel */}
            {showSync && (
                <AnilistCastSync
                    animeId={anime.id}
                    currentTitle={anime.title}
                    onClose={() => setShowSync(false)}
                />
            )}

            {/* Characters */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-blue-500/10">
                        <Users size={14} className="text-blue-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                        Main Characters
                        <span className="ml-2 text-slate-400 font-normal text-xs">({characters.length})</span>
                    </h3>
                </div>

                {characters.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-4">
                        {characters.map(c => (
                            <CastCard key={c.id} item={c} animeId={anime.id} type="character" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-300 mb-4">
                        <Users size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Belum ada karakter. Tambah manual atau sync dari AniList.</p>
                    </div>
                )}

                <AddForm type="character" animeId={anime.id} />
            </Card>

            {/* Staff */}
            <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                        <UserCheck size={14} className="text-purple-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold text-sm">
                        Production Staff
                        <span className="ml-2 text-slate-400 font-normal text-xs">({staff.length})</span>
                    </h3>
                </div>

                {staff.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-4">
                        {staff.map(s => (
                            <CastCard key={s.id} item={s} animeId={anime.id} type="staff" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-slate-300 mb-4">
                        <UserCheck size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-xs">Belum ada staff. Tambah manual atau sync dari AniList.</p>
                    </div>
                )}

                <AddForm type="staff" animeId={anime.id} />
            </Card>
        </div>
    );
}
