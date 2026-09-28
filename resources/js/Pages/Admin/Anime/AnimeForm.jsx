import { useState } from 'react';
import { Input, Textarea, Select, Button, Card } from '@/Components/Admin/UI';
import { Film, Star, Sparkles } from 'lucide-react';
import AnilistAutofillModal from '@/Components/Admin/AnilistAutofillModal';

export default function AnimeForm({
    data,
    setData,
    errors,
    onSubmit,
    processing,
    genres,
    submitLabel = 'Simpan'
}) {
    const [autofillOpen, setAutofillOpen] = useState(false);

    const handleAutofill = (anilistData) => {
        // Map genre names to IDs from our genres list
        const matchedGenreIds = (anilistData.genres || []).reduce((acc, genreName) => {
            const match = genres.find(
                g => g.name.toLowerCase() === genreName.toLowerCase()
            );
            if (match) acc.push(match.id);
            return acc;
        }, []);

        // Map AniList status -> local status
        const statusMap = {
            FINISHED: 'completed',
            RELEASING: 'ongoing',
            NOT_YET_RELEASED: 'upcoming',
        };

        if (anilistData.anilist_id) setData('anilist_id', anilistData.anilist_id);
        if (anilistData.title) setData('title', anilistData.title);
        if (anilistData.synopsis) setData('synopsis', anilistData.synopsis);
        if (anilistData.poster) setData('poster', anilistData.poster);
        if (anilistData.type) setData('type', anilistData.type);

        if (anilistData.status) {
            setData(
                'status',
                statusMap[anilistData.status] || 'completed'
            );
        } else {
            setData('status', 'completed');
        }

        if (anilistData.rating) setData('rating', String(anilistData.rating));
        if (anilistData.release_year) setData('release_year', String(anilistData.release_year));
        if (anilistData.studio) setData('studio', anilistData.studio);
        if (anilistData.trailer_url) setData('trailer_url', anilistData.trailer_url);

        if (matchedGenreIds.length) setData('genres', matchedGenreIds);
    };

    const toggleGenre = (id) => {
        const current = data.genres || [];
        if (current.includes(id)) {
            setData('genres', current.filter(g => g !== id));
        } else {
            setData('genres', [...current, id]);
        }
    };

    return (
        <>
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2">
                                <Film size={15} className="text-violet-500" />
                                Informasi Utama
                            </h3>
                            <button
                                type="button"
                                onClick={() => setAutofillOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20
                                    text-violet-400 text-xs font-semibold hover:bg-violet-500/20 transition-colors"
                            >
                                <Sparkles size={12} />
                                Auto-fill AniList
                            </button>
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Judul Anime *"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                error={errors.title}
                                placeholder="Masukkan judul anime..."
                                required
                            />
                            <Textarea
                                label="Sinopsis"
                                value={data.synopsis || ''}
                                onChange={e => setData('synopsis', e.target.value)}
                                error={errors.synopsis}
                                placeholder="Deskripsi singkat anime..."
                                rows={5}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Status *"
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value)}
                                    error={errors.status}
                                    required
                                >
                                    <option value="">Pilih status</option>
                                    <option value="completed">Completed</option>								
                                    <option value="ongoing">Ongoing</option>
                                    <option value="upcoming">Upcoming</option>
                                </Select>
                                <Select
                                    label="Tipe *"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    error={errors.type}
                                    required
                                >
                                    <option value="">Pilih tipe</option>
                                    <option value="TV">TV</option>
                                    <option value="Movie">Movie</option>
                                    <option value="OVA">OVA</option>
                                    <option value="ONA">ONA</option>
                                    <option value="Special">Special</option>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Studio"
                                    value={data.studio || ''}
                                    onChange={e => setData('studio', e.target.value)}
                                    placeholder="Nama studio"
                                />
                                <Input
                                    label="Tahun Rilis"
                                    type="number"
                                    value={data.release_year || ''}
                                    onChange={e => setData('release_year', e.target.value)}
                                    placeholder="2024"
                                    min="1900"
                                    max="2100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Rating (0-10)"
                                    type="number"
                                    value={data.rating || ''}
                                    onChange={e => setData('rating', e.target.value)}
                                    placeholder="8.5"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                />
                                <Input
                                    label="URL Trailer"
                                    value={data.trailer_url || ''}
                                    onChange={e => setData('trailer_url', e.target.value)}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Poster, Genre, Featured */}
                <div className="space-y-4">
                    {/* Poster */}
                    <Card className="p-5">
                        <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">Poster</h3>
                        {data.poster && (
                            <img
                                src={data.poster}
                                alt="Poster preview"
                                className="w-full aspect-[2/3] object-cover rounded-xl mb-3 bg-slate-100 dark:bg-slate-800"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        )}
                        <Input
                            label="URL Poster"
                            value={data.poster || ''}
                            onChange={e => setData('poster', e.target.value)}
                            placeholder="https://example.com/poster.jpg"
                            error={errors.poster}
                        />
                    </Card>

                    {/* Featured */}
                    <Card className="p-5">
                        <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4 flex items-center gap-2">
                            <Star size={14} className="text-amber-500" />
                            Pengaturan
                        </h3>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div
                                onClick={() => setData('is_featured', !data.is_featured)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                                    ${data.is_featured ? 'bg-[#ff2e2e]' : 'bg-slate-200'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-slate-900 rounded-full transition-transform duration-200 shadow ${data.is_featured ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white text-sm font-medium">Featured</p>
                                <p className="text-slate-400 text-xs">Tampil di hero slider utama</p>
                            </div>
                        </label>
                    </Card>

                    {/* Genres */}
                    <Card className="p-5">
                        <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-4">Genre</h3>
                        <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => {
                                const selected = (data.genres || []).includes(genre.id);
                                return (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150
                                            ${selected
                                                ? 'bg-[#ff2e2e] text-white shadow-sm shadow-[#ff2e2e]/30'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 dark:text-white'
                                            }`}
                                    >
                                        {genre.name}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.genres && <p className="text-red-500 text-xs mt-2">{errors.genres}</p>}
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

        <AnilistAutofillModal
            open={autofillOpen}
            onClose={() => setAutofillOpen(false)}
            currentTitle={data.title || ''}
            onAutofill={handleAutofill}
        />
        </>
    );
}
