import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Megaphone, Save, LayoutTemplate } from 'lucide-react';

export default function AdsIndex({ ads }) {
    const { data, setData, post, processing, errors } = useForm({
        home_top: ads.home_top || '',
        home_bottom: ads.home_bottom || '',
        anime_detail_top: ads.anime_detail_top || '',
        episode_detail_top: ads.episode_detail_top || '',
        episode_detail_bottom: ads.episode_detail_bottom || '',
        manga_detail_top: ads.manga_detail_top || '',
        chapter_detail_top: ads.chapter_detail_top || '',
        chapter_detail_bottom: ads.chapter_detail_bottom || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.ads.update'));
    };

    const renderTextarea = (id, label, placeholder) => (
        <div className="mb-6">
            <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {label}
            </label>
            <textarea
                id={id}
                value={data[id]}
                onChange={(e) => setData(id, e.target.value)}
                rows={4}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono transition-shadow h-28 resize-y"
                placeholder={placeholder}
                dir="ltr"
                spellCheck="false"
            />
            {errors[id] && <p className="text-red-500 mt-1 text-sm">{errors[id]}</p>}
        </div>
    );

    return (
        <AdminLayout title="Slot Iklan">
            <Head title="Pengaturan Iklan" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Megaphone className="w-6 h-6 text-red-500" />
                            Manajemen Slot Iklan
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Atur kode HTML/JS untuk banner iklan (misalnya AdSense) di berbagai halaman website.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Homepage Ads */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                            Homepage
                        </h2>
                        {renderTextarea('home_top', 'Homepage Atas (Bawah Header/Slider)', 'Tempel HTML/JS iklan di sini...')}
                        {renderTextarea('home_bottom', 'Homepage Bawah (Sebelum Footer)', 'Tempel HTML/JS iklan di sini...')}
                    </div>

                    {/* Anime & Episode Ads */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-red-500" />
                            Anime & Episode
                        </h2>
                        {renderTextarea('anime_detail_top', 'Detail Anime Atas', 'Tempel HTML/JS iklan di sini...')}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderTextarea('episode_detail_top', 'Episode Nonton Atas (Atas Player)', 'Tempel HTML/JS iklan di sini...')}
                            {renderTextarea('episode_detail_bottom', 'Episode Nonton Bawah (Bawah Player/Komentar)', 'Tempel HTML/JS iklan di sini...')}
                        </div>
                    </div>

                    {/* Manga & Chapter Ads */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <LayoutTemplate className="w-5 h-5 text-sky-500" />
                            Manga & Chapter
                        </h2>
                        {renderTextarea('manga_detail_top', 'Detail Manga Atas', 'Tempel HTML/JS iklan di sini...')}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderTextarea('chapter_detail_top', 'Halaman Baca Chapter Atas', 'Tempel HTML/JS iklan di sini...')}
                            {renderTextarea('chapter_detail_bottom', 'Halaman Baca Chapter Bawah', 'Tempel HTML/JS iklan di sini...')}
                        </div>
                    </div>

                    <div className="flex justify-end sticky bottom-6 z-10 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
