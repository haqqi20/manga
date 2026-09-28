import { useState } from 'react';
import { Input, Select, Button, Card } from '@/Components/Admin/UI';
import { PlaySquare, Download, Plus, Trash2 } from 'lucide-react';

export default function EpisodeForm({ data, setData, errors, onSubmit, processing, animes, submitLabel = 'Simpan' }) {

    // Mirror streams as array of {label, url}
    const mirrors = Array.isArray(data.mirror_streams) ? data.mirror_streams : [];
    const downloads = Array.isArray(data.download_urls) ? data.download_urls : [];

    const updateMirror = (idx, field, value) => {
        const updated = mirrors.map((m, i) => i === idx ? { ...m, [field]: value } : m);
        setData('mirror_streams', updated);
    };
    const addMirror = () => setData('mirror_streams', [...mirrors, { label: '', url: '' }]);
    const removeMirror = (idx) => setData('mirror_streams', mirrors.filter((_, i) => i !== idx));

    const updateDownload = (idx, field, value) => {
        const updated = downloads.map((d, i) => i === idx ? { ...d, [field]: value } : d);
        setData('download_urls', updated);
    };
    const addDownload = () => setData('download_urls', [...downloads, { label: '', url: '' }]);
    const removeDownload = (idx) => setData('download_urls', downloads.filter((_, i) => i !== idx));

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Info */}
                <Card className="p-5 space-y-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        <PlaySquare size={15} className="text-blue-400" />
                        Informasi Episode
                    </h3>
                    <Select
                        label="Anime *"
                        value={data.anime_id}
                        onChange={e => setData('anime_id', e.target.value)}
                        error={errors.anime_id}
                        required
                    >
                        <option value="">Pilih anime</option>
                        {animes.map(a => (
                            <option key={a.id} value={a.id}>{a.title}</option>
                        ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nomor Episode *"
                            type="number"
                            value={data.number}
                            onChange={e => setData('number', e.target.value)}
                            error={errors.number}
                            placeholder="1"
                            min="1"
                            required
                        />
                        <Input
                            label="Durasi (menit)"
                            type="number"
                            value={data.duration || ''}
                            onChange={e => setData('duration', e.target.value)}
                            placeholder="24"
                            min="1"
                        />
                    </div>
                    <Input
                        label="Judul Episode"
                        value={data.title || ''}
                        onChange={e => setData('title', e.target.value)}
                        placeholder="Opsional, misal: Awakening"
                    />
                    <Input
                        label="Tanggal Rilis"
                        type="date"
                        value={data.release_date || ''}
                        onChange={e => setData('release_date', e.target.value)}
                    />
                    <Input
                        label="Video URL (Primary)"
                        value={data.video_url || ''}
                        onChange={e => setData('video_url', e.target.value)}
                        placeholder="https://..."
                    />
                </Card>

                {/* Streams & Downloads */}
                <div className="space-y-4">
                    {/* Mirror Streams */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-sm">Mirror Streams</h3>
                            <Button type="button" variant="secondary" size="sm" onClick={addMirror}>
                                <Plus size={13} />
                                Tambah
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {mirrors.length === 0 && (
                                <p className="text-white/30 text-sm">Belum ada mirror stream.</p>
                            )}
                            {mirrors.map((m, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={m.label}
                                        onChange={e => updateMirror(idx, 'label', e.target.value)}
                                        placeholder="Label (cth: Zoro)"
                                        className="flex-none w-28"
                                    />
                                    <Input
                                        value={m.url}
                                        onChange={e => updateMirror(idx, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMirror(idx)}
                                        className="mt-auto mb-0 h-[42px] px-2.5 text-white/30 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Download URLs */}
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                                <Download size={14} className="text-emerald-400" />
                                Download URLs
                            </h3>
                            <Button type="button" variant="secondary" size="sm" onClick={addDownload}>
                                <Plus size={13} />
                                Tambah
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {downloads.length === 0 && (
                                <p className="text-white/30 text-sm">Belum ada link download.</p>
                            )}
                            {downloads.map((d, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={d.label}
                                        onChange={e => updateDownload(idx, 'label', e.target.value)}
                                        placeholder="Label (cth: 480p)"
                                        className="flex-none w-28"
                                    />
                                    <Input
                                        value={d.url}
                                        onChange={e => updateDownload(idx, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDownload(idx)}
                                        className="mt-auto mb-0 h-[42px] px-2.5 text-white/30 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                    Batal
                </Button>
                <Button type="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
