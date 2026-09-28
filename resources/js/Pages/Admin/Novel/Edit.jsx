import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import NovelForm from './NovelForm';
import { ArrowLeft, RefreshCw, Database, Eye } from 'lucide-react';
export default function Edit({ novel, genres }) {
    const sync = (withContent=false) => router.post(route('admin.novel.chapters.sync', novel.id), { with_content: withContent }, { preserveScroll: true });
    return <AdminLayout title="Edit Novel"><Head title={`Edit Novel: ${novel.title}`}/><div className="max-w-6xl mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Novel: {novel.title}</h1><Link href={route('admin.novel.index')} className="text-sm text-slate-500 flex gap-1 items-center mt-2"><ArrowLeft size={16}/> Back</Link></div><div className="flex gap-2 flex-wrap"><button onClick={()=>sync(false)} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-bold flex gap-2"><RefreshCw size={16}/> Sync List Chapter</button><button onClick={()=>sync(true)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold flex gap-2"><Database size={16}/> Sync + Simpan Isi</button><Link href={`/novel/${novel.slug}`} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold flex gap-2"><Eye size={16}/> View</Link></div></div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6"><NovelForm novel={novel} genres={genres} isEdit={true}/></div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6"><h2 className="font-bold mb-4 text-slate-900 dark:text-white">Chapter tersimpan DB ({novel.chapters?.length || 0})</h2><div className="divide-y divide-slate-100 dark:divide-slate-800">{(novel.chapters||[]).map(ch=><div key={ch.id} className="py-3 flex justify-between text-sm"><span className="font-bold text-slate-700 dark:text-slate-200">{ch.title || ch.slug}</span><span className="text-slate-400">{ch.slug}</span></div>)}</div></div>
    </div></AdminLayout>;
}
