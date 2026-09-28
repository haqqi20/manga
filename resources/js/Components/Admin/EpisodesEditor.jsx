import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Card } from '@/Components/Admin/UI';
import {
    Tv, Plus, Pencil, Trash2, X, Check,
    PlayCircle, Download, Link2, ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function TextInput({ label, type = 'text', value, onChange, placeholder, min, className = '' }) {
    return (
        <div className={className}>
            {label && <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
        </div>
    );
}

function LinkRowEditor({ rows, onChange, placeholder = 'URL', labelPlaceholder = 'Label' }) {
    const update = (idx, field, val) =>
        onChange(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r));
    const add = () => onChange([...rows, { label: '', url: '' }]);
    const remove = (idx) => onChange(rows.filter((_, i) => i !== idx));

    return (
        <div className="space-y-2">
            {rows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={row.label}
                        onChange={e => update(i, 'label', e.target.value)}
                        placeholder={labelPlaceholder}
                        className="w-36 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                    />
                    <input
                        type="text"
                        value={row.url}
                        onChange={e => update(i, 'url', e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-[#ff2e2e] transition-colors mt-1"
            >
                <Plus size={12} /> Tambah
            </button>
        </div>
    );
}

// ─── Episode Edit Modal ───────────────────────────────────────────────────────

function EpisodeModal({ episode, animeId, onClose }) {
    const [mirrors, setMirrors] = useState(
        Array.isArray(episode?.mirror_streams) ? episode.mirror_streams : []
    );
    const [downloads, setDownloads] = useState(
        Array.isArray(episode?.download_urls) ? episode.download_urls : []
    );

    const { data, setData, post, put, processing, errors } = useForm({
        number: episode?.number ?? '',
        title: episode?.title ?? '',
        video_url: episode?.video_url ?? '',
        duration: episode?.duration ?? '',
        release_date: episode?.release_date ?? '',
    });

    const isEdit = !!episode?.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...data, mirror_streams: mirrors, download_urls: downloads };

        if (isEdit) {
            router.put(`/admin/anime/${animeId}/episodes/${episode.id}`, payload, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        } else {
            router.post(`/admin/anime/${animeId}/episodes`, payload, {
                preserveScroll: true,
                onSuccess: onClose,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <Tv size={16} className="text-[#ff2e2e]" />
                        {isEdit ? `Edit Episode ${episode.number}` : 'Tambah Episode'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors rounded-lg hover:bg-slate-100 dark:bg-slate-800">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                    <form id="ep-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput
                                label="Nomor Episode *"
                                type="number"
                                value={data.number}
                                onChange={v => setData('number', v)}
                                placeholder="1"
                                min="1"
                            />
                            <TextInput
                                label="Durasi (menit)"
                                type="number"
                                value={data.duration}
                                onChange={v => setData('duration', v)}
                                placeholder="24"
                                min="1"
                            />
                        </div>
                        <TextInput
                            label="Judul Episode"
                            value={data.title}
                            onChange={v => setData('title', v)}
                            placeholder="Opsional, misal: Awakening"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput
                                label="Tanggal Rilis"
                                type="date"
                                value={data.release_date}
                                onChange={v => setData('release_date', v)}
                            />
                        </div>

                        {/* Primary Video */}
                        <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                <PlayCircle size={11} className="text-blue-400" /> Video URL Utama
                            </label>
                            <input
                                type="text"
                                value={data.video_url}
                                onChange={e => setData('video_url', e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                            />
                        </div>

                        {/* Mirror Streams */}
                        <div className="space-y-2">
                            <label className="block text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Link2 size={11} className="text-purple-400" /> Mirror Streaming
                                <span className="text-slate-300 text-[10px]">(label: Provider 720p)</span>
                            </label>
                            <LinkRowEditor
                                rows={mirrors}
                                onChange={setMirrors}
                                labelPlaceholder="Ondesu 720p"
                                placeholder="https://stream..."
                            />
                        </div>

                        {/* Download URLs */}
                        <div className="space-y-2">
                            <label className="block text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Download size={11} className="text-green-400" /> Link Download
                                <span className="text-slate-300 text-[10px]">(label: 720p - Provider (ukuran))</span>
                            </label>
                            <LinkRowEditor
                                rows={downloads}
                                onChange={setDownloads}
                                labelPlaceholder="720p - Ondesu (150MB)"
                                placeholder="https://download..."
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-lg transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        form="ep-form"
                        disabled={processing}
                        className="flex items-center gap-2 px-5 py-2 bg-[#ff2e2e] hover:bg-[#e02020] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Check size={14} />
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main EpisodesEditor ──────────────────────────────────────────────────────

export default function EpisodesEditor({ anime }) {
    const [modal, setModal] = useState(null); // null | { episode } | { episode: null } (add)
    const [expanded, setExpanded] = useState(true);
    const episodes = anime.episodes ?? [];

    const handleDelete = (episode) => {
        if (!confirm(`Hapus Episode ${episode.number}${episode.title ? ` – ${episode.title}` : ''}?`)) return;
        router.delete(`/admin/anime/${anime.id}/episodes/${episode.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            {modal && (
                <EpisodeModal
                    episode={modal.episode}
                    animeId={anime.id}
                    onClose={() => setModal(null)}
                />
            )}

            <Card className="mt-8">
                {/* Section header */}
                <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer select-none border-b border-slate-200 dark:border-slate-700"
                    onClick={() => setExpanded(v => !v)}
                >
                    <div className="flex items-center gap-2">
                        <Tv size={16} className="text-[#ff2e2e]" />
                        <span className="text-slate-900 dark:text-white font-semibold text-sm">
                            Daftar Episode
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full ml-1">
                            {episodes.length} ep
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setModal({ episode: null }); }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#ff2e2e]/10 hover:bg-[#ff2e2e]/20 text-[#ff2e2e] border border-[#ff2e2e]/20 rounded-lg transition-colors"
                        >
                            <Plus size={12} /> Tambah Episode
                        </button>
                        {expanded ? <ChevronUp size={15} className="text-slate-500 dark:text-slate-400" /> : <ChevronDown size={15} className="text-slate-500 dark:text-slate-400" />}
                    </div>
                </div>

                {expanded && (
                    <div className="px-6 py-4">
                        {episodes.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Belum ada episode. Klik "Tambah Episode" untuk mulai.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-400 text-xs border-b border-slate-200 dark:border-slate-700">
                                            <th className="pb-3 pr-4 font-medium w-12">#</th>
                                            <th className="pb-3 pr-4 font-medium">Judul</th>
                                            <th className="pb-3 pr-4 font-medium w-20 text-center">Video</th>
                                            <th className="pb-3 pr-4 font-medium w-20 text-center">Mirror</th>
                                            <th className="pb-3 pr-4 font-medium w-20 text-center">DL</th>
                                            <th className="pb-3 font-medium w-20 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {episodes.map(ep => (
                                            <tr key={ep.id} className="group hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                                                <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 font-mono">{ep.number}</td>
                                                <td className="py-3 pr-4">
                                                    <span className="text-slate-900 dark:text-white">
                                                        {ep.title || <span className="text-slate-400 italic">Tanpa judul</span>}
                                                    </span>
                                                    {ep.duration && (
                                                        <span className="ml-2 text-xs text-slate-400">{ep.duration}m</span>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-center">
                                                    {ep.video_url
                                                        ? <span className="text-green-400 text-xs">✓</span>
                                                        : <span className="text-slate-300 text-xs">—</span>}
                                                </td>
                                                <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                                                    {Array.isArray(ep.mirror_streams) ? ep.mirror_streams.length : 0}
                                                </td>
                                                <td className="py-3 pr-4 text-center text-slate-500 dark:text-slate-400 text-xs">
                                                    {Array.isArray(ep.download_urls) ? ep.download_urls.length : 0}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => setModal({ episode: ep })}
                                                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(ep)}
                                                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </>
    );
}
