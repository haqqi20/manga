import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import MangaForm from './MangaForm';
import { Trash2, Edit2, X, Save, Calendar, Image as ImageIcon, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Edit({ manga, genres }) {
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'chapters'

    const handleDeleteChapter = (id, number) => {
        if (confirm(`Apakah Anda yakin ingin menghapus Chapter ${number}?`)) {
            router.delete(route('admin.manga.chapters.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AdminLayout title="Edit Manga">
            <Head title={`Edit Manga: ${manga.title}`} />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
                {/* Minimal Header like Screenshot */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Edit Manga: <span className="font-normal">{manga.title}</span>
                    </h1>
                    <Link 
                        href={route('admin.manga.index')} 
                        className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mt-2 flex items-center gap-1 w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to List
                    </Link>
                </div>

                {/* Main Card with Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                    {/* Tabs Header */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 max-w-[200px] text-center py-4 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === 'details' 
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            Manga Details
                        </button>
                        <button 
                            onClick={() => setActiveTab('chapters')}
                            className={`flex-1 max-w-[200px] text-center py-4 text-sm font-semibold border-b-2 transition-all ${
                                activeTab === 'chapters' 
                                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            Chapters ({manga.chapters?.length || 0})
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8 min-h-[500px]">
                        {activeTab === 'details' ? (
                            <MangaForm manga={manga} genres={genres} isEdit={true} />
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-end gap-3">
                                    <Link
                                        href={route('admin.manga.importer', { url: manga.source_url, manga_id: manga.id })}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl transition-colors border border-emerald-100 dark:border-emerald-500/20"
                                    >
                                        <RefreshCw size={16} />
                                        Sync Chapter Baru (Auto)
                                    </Link>
                                    <Link
                                        href={route('admin.manga.chapters.index', manga.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-sm font-semibold rounded-xl transition-colors border border-sky-100 dark:border-sky-500/20"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Advanced Chapter Manager
                                    </Link>
                                </div>

                                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Chapter</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Judul</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">Tanggal</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {manga.chapters && manga.chapters.length > 0 ? (
                                                manga.chapters.map((chapter) => (
                                                    <tr key={chapter.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-sm font-bold">
                                                                    Ch. {chapter.chapter_number}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                                    <ImageIcon className="w-3 h-3" />
                                                                    {chapter.images_count || 0}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                {chapter.title || `-`}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                                {new Date(chapter.created_at).toLocaleDateString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Link
                                                                    href={route('admin.manga.chapters.edit', chapter.id)}
                                                                    className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-all"
                                                                    title="Edit Chapter Details"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDeleteChapter(chapter.id, chapter.chapter_number)}
                                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                                                                    title="Delete Chapter"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2">
                                                                <ImageIcon className="w-6 h-6" />
                                                            </div>
                                                            <p className="text-slate-500 text-sm font-medium">No chapters available yet.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
}
