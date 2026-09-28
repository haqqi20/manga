import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function NovelForm({ novel = null, genres = [], isEdit = false }) {
    const { data, setData, post, processing, errors } = useForm({
        title: novel?.title || '', slug: novel?.slug || '', synopsis: novel?.synopsis || '',
        status: novel?.status || 'Ongoing', type: novel?.type || 'Novel', author: novel?.author || '', artist: novel?.artist || '',
        poster: novel?.poster || '', source_url: novel?.source_url || '', api_base_url: novel?.api_base_url || '',
        first_chapter_slug: novel?.first_chapter_slug || '', first_chapter_title: novel?.first_chapter_title || '', first_chapter_url: novel?.first_chapter_url || '',
        is_featured: !!novel?.is_featured, rating: novel?.rating || 0, release_year: novel?.release_year || '',
        genres: novel?.genres?.map(g => g.id) || [],
    });
    const [posterPreview, setPosterPreview] = useState(novel?.poster || '');
    useEffect(() => { if (!isEdit && data.title) setData('slug', data.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')); }, [data.title]);
    const toggleGenre = (id) => setData('genres', data.genres.includes(id) ? data.genres.filter(x => x !== id) : [...data.genres, id]);
    const submit = e => { e.preventDefault(); isEdit ? router.post(route('admin.novel.update', novel.id), { _method: 'put', ...data }) : post(route('admin.novel.store')); };
    return <form onSubmit={submit} className="space-y-6">
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
            <div className="space-y-3">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {posterPreview ? <img src={posterPreview} className="w-full h-full object-cover"/> : <div className="h-full grid place-items-center text-slate-400 text-sm">No Cover</div>}
                </div>
                <input type="text" placeholder="Poster hotlink URL" value={typeof data.poster === 'string' ? data.poster : ''} onChange={e => { setData('poster', e.target.value); setPosterPreview(e.target.value); }} className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" />
            </div>
            <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Title" value={data.title} onChange={v=>setData('title',v)} error={errors.title}/>
                    <Field label="Slug" value={data.slug} onChange={v=>setData('slug',v)} error={errors.slug}/>
                    <Field label="Status" value={data.status} onChange={v=>setData('status',v)}/>
                    <Field label="Type" value={data.type} onChange={v=>setData('type',v)}/>
                    <Field label="Author" value={data.author} onChange={v=>setData('author',v)}/>
                    <Field label="Artist" value={data.artist} onChange={v=>setData('artist',v)}/>
                    <Field label="Source URL" value={data.source_url} onChange={v=>setData('source_url',v)}/>
                    <Field label="API Base URL" value={data.api_base_url} onChange={v=>setData('api_base_url',v)} placeholder="https://novel.kiryuuid.net/wp-json/kiryuu/v1"/>
                    <Field label="First Chapter Slug" value={data.first_chapter_slug} onChange={v=>setData('first_chapter_slug',v)}/>
                    <Field label="First Chapter Title" value={data.first_chapter_title} onChange={v=>setData('first_chapter_title',v)}/>
                </div>
                <Field label="First Chapter URL" value={data.first_chapter_url} onChange={v=>setData('first_chapter_url',v)}/>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Synopsis</label>
                <textarea rows="8" value={data.synopsis} onChange={e=>setData('synopsis',e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" />
                <div className="flex flex-wrap gap-2">
                    {genres.map(g => <button type="button" key={g.id} onClick={()=>toggleGenre(g.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${data.genres.includes(g.id) ? 'bg-red-600 text-white border-red-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>{g.name}</button>)}
                </div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_featured} onChange={e=>setData('is_featured',e.target.checked)}/> Featured</label>
                <button disabled={processing} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">Simpan Novel</button>
            </div>
        </div>
    </form>;
}
function Field({ label, value, onChange, error, placeholder='' }) { return <div><label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{label}</label><input value={value || ''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm" />{error && <div className="text-xs text-red-500 mt-1">{error}</div>}</div> }
