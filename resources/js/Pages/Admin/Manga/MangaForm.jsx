import React, { useState, useEffect } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';

export default function MangaForm({ manga = null, genres = [], isEdit = false }) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: manga?.title || '',
        slug: manga?.slug || '',
        synopsis: manga?.synopsis || '',
        status: manga?.status || 'Ongoing',
        type: manga?.type || 'Manga',
        author: manga?.author || '',
        artist: manga?.artist || '',
        poster: null,
        source_url: manga?.source_url || '',
        is_featured: manga?.is_featured ? true : false,
        rating: manga?.rating || 0.0,
        release_year: manga?.release_year || new Date().getFullYear(),
        genres: manga?.genres?.map(g => g.id) || [],
    });

    const [posterPreview, setPosterPreview] = useState(manga?.poster || null);

    const handlePosterChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('poster', file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleGenreToggle = (id) => {
        const currentGenres = [...data.genres];
        const index = currentGenres.indexOf(id);
        if (index > -1) {
            currentGenres.splice(index, 1);
        } else {
            currentGenres.push(id);
        }
        setData('genres', currentGenres);
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            router.post(route('admin.manga.update', manga.id), {
                _method: 'put',
                ...data
            });
        } else {
            post(route('admin.manga.store'));
        }
    };

    // Auto slug generator
    useEffect(() => {
        if (!isEdit && data.title) {
            setData('slug', data.title.toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-'));
        }
    }, [data.title]);

    return (
        <form onSubmit={submit} className="flex flex-col space-y-6">
            
            {/* Title */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all dark:text-white"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slug</label>
                <input
                    type="text"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all dark:text-white"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-0.5">URL compliant name</p>
                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
            </div>

            {/* Synopsis / Description */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[120px] focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all resize-y dark:text-white"
                    value={data.synopsis}
                    onChange={e => setData('synopsis', e.target.value)}
                ></textarea>
            </div>

            {/* Source URL */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Source URL (Scraping Target)</label>
                <input
                    type="url"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm font-mono outline-none transition-all dark:text-white"
                    value={data.source_url}
                    onChange={e => setData('source_url', e.target.value)}
                    placeholder="https://..."
                />
            </div>

            {/* Author and Type - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <div className="space-y-1 w-full">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Author</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all dark:text-white"
                        value={data.author}
                        onChange={e => setData('author', e.target.value)}
                    />
                </div>
                <div className="space-y-1 w-full">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Type</label>
                    <select
                        className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all dark:text-white"
                        value={data.type}
                        onChange={e => setData('type', e.target.value)}
                    >
                        <option value="Manga">Manga</option>
                        <option value="Manhwa">Manhwa</option>
                        <option value="Manhua">Manhua</option>
                    </select>
                </div>
            </div>

            {/* Genres */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Genres</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[42px]">
                    {genres.map(genre => (
                        <button
                            key={genre.id}
                            type="button"
                            onClick={() => handleGenreToggle(genre.id)}
                            className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                                data.genres.includes(genre.id)
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                        >
                            {genre.name}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Click to toggle genres</p>
            </div>

            {/* Status */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none transition-all dark:text-white"
                    value={data.status}
                    onChange={e => setData('status', e.target.value)}
                >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Hiatus">Hiatus</option>
                </select>
            </div>

            {/* Rating and Featured - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-2">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-widest">Manual Rating (0 - 10)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm outline-none transition-all dark:text-white"
                        value={data.rating}
                        onChange={e => setData('rating', e.target.value)}
                        placeholder="e.g. 9.5"
                    />
                    {errors.rating && <p className="text-red-500 text-[10px] mt-1">{errors.rating}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-widest">Trending Badge</label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={data.is_featured}
                            onChange={e => setData('is_featured', e.target.checked)}
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show TRENDING badge on manga detail page</span>
                    </label>
                </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cover Image</label>
                <div className="space-y-4">
                    {/* Current Cover Info */}
                    <div className="flex items-center gap-4">
                        {posterPreview ? (
                            <img src={posterPreview} className="w-16 h-24 object-cover rounded-md border border-slate-200 dark:border-slate-700 shadow-sm" alt="Current Cover" />
                        ) : (
                            <div className="w-16 h-24 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Cover</span>
                            <span className="text-[10px] text-slate-400">Upload a new file below to replace this image.</span>
                        </div>
                    </div>

                    {/* Upload Box */}
                    <div 
                        onClick={() => document.getElementById('poster-upload').click()}
                        className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-sky-600 dark:text-sky-500">Upload a file or drag and drop</p>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, GIF up to 2MB</p>
                        <input id="poster-upload" type="file" className="hidden" onChange={handlePosterChange} accept="image/*" />
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <Link
                    href={route('admin.manga.index')}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {processing ? 'Saving...' : (isEdit ? 'Update Manga' : 'Publish Manga')}
                </button>
            </div>
        </form>
    );
}
