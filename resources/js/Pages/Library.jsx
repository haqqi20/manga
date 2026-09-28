import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Bookmark, History, Trash2 } from 'lucide-react';

export default function Library({ bookmarks = [], readlist = [], histories = [] }) {
    const [activeTab, setActiveTab] = useState('bookmark');

    const handleRemoveBookmark = (item) => {
        if (item.type === 'manga') {
            router.post(`/manga/${item.slug}/bookmark`, {}, { preserveScroll: true });
        } else {
            router.post(`/anime/${item.real_id}/bookmark`, {}, { preserveScroll: true });
        }
    };

    // 🔥 helper biar konsisten
    const formatType = (type) => {
        if (!type) return '';
        if (type.toLowerCase() === 'manga') return 'KOMIK';
        return type.toUpperCase();
    };

    const formatStatus = (status) => {
        return status ? status.toUpperCase() : '';
    };

    return (
        <AppLayout>
            <Head title="My Library" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full [content-visibility:auto]">
                <div className="flex flex-col gap-2">

                    {/* Header */}
                    <section className="flex md:justify-between md:items-center flex-col md:flex-row gap-2 mb-4">
                        <h2 className="font-bold text-2xl text-slate-900 dark:text-white">My Library</h2>

                        <div className="grid grid-cols-2 md:flex md:w-max items-center rounded-xl bg-gray-100 dark:bg-slate-800 p-1.5 gap-1 border border-gray-200 dark:border-slate-700">
                            
                            <button
                                onClick={() => setActiveTab('bookmark')}
                                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors duration-200 ${
                                    activeTab === 'bookmark'
                                        ? 'bg-white dark:bg-slate-900 text-red-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-200/50'
                                }`}
                            >
                                <Bookmark className="w-4 h-4" />
                                Bookmark
                            </button>

                            <button
                                onClick={() => setActiveTab('history')}
                                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors duration-200 ${
                                    activeTab === 'history'
                                        ? 'bg-white dark:bg-slate-900 text-red-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-200/50'
                                }`}
                            >
                                <History className="w-4 h-4" />
                                History
                            </button>

                        </div>
                    </section>

                    {/* BOOKMARK */}
                    {activeTab === 'bookmark' && (
                        <div>
                            {bookmarks.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {bookmarks.map((item) => (
                                        <div key={item.id} className="relative group">

                                            <Link href={item.type === 'manga' ? `/manga/${item.slug}` : `/anime/${item.slug}`}>
                                                <div className="relative h-[275px] lg:h-[415px] overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm sm:hover:-translate-y-1 sm:hover:shadow-md transition-transform duration-200">

                                                    <img
                                                        alt={item.title}
                                                        src={item.image?.startsWith('http') ? item.image : '/storage/' + item.image}
                                                        className="h-full w-full object-cover will-change-transform transition-transform duration-300 sm:group-hover:scale-105"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black text-white uppercase tracking-wider ${item.type === 'manga' ? 'bg-orange-500' : 'bg-sky-500'}`}>
                                                            {formatType(item.type)}
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 font-bold rounded-lg bg-black/60 text-white uppercase tracking-wider">
                                                            {formatStatus(item.status)}
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-0 w-full p-3 text-white">
                                                        <h3 className="text-sm truncate">{item.title}</h3>
                                                        <p className="text-xs text-gray-300">{item.last_ep}</p>
                                                    </div>
                                                </div>
                                            </Link>

                                            <button
                                                onClick={() => handleRemoveBookmark(item)}
                                                className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg bg-black/70 text-white hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    No bookmarks yet.
                                </div>
                            )}
                        </div>
                    )}

                    {/* HISTORY */}
                    {activeTab === 'history' && (
                        <div>
                            {histories.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {histories.map((item, index) => (
                                        <div key={index} className="relative group">

                                            <Link href={item.url}>
                                                <div className="relative h-[275px] lg:h-[415px] overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm sm:hover:-translate-y-1 sm:hover:shadow-md transition-transform duration-200">

                                                    <img
                                                        alt={item.title}
                                                        src={item.image?.startsWith('http') ? item.image : '/storage/' + item.image}
                                                        className="h-full w-full object-cover will-change-transform transition-transform duration-300 sm:group-hover:scale-105"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                        <span className="text-[10px] px-2 py-0.5 bg-black/60 text-white rounded-lg uppercase tracking-wider">
                                                            {item.read_time}
                                                        </span>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black text-white uppercase tracking-wider ${item.type === 'manga' ? 'bg-orange-500' : 'bg-sky-500'}`}>
                                                            {formatType(item.type)}
                                                        </span>
                                                    </div>

                                                    <div className="absolute bottom-0 w-full p-3 text-white">
                                                        <h3 className="text-sm truncate">{item.title}</h3>
                                                        <p className="text-xs text-gray-300">Last {item.last_read_ep}</p>
                                                    </div>

                                                </div>
                                            </Link>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    Riwayat tontonan belum tersedia.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}