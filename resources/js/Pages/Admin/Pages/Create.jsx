import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, Input, Textarea } from '@/Components/Admin/UI';
import { ChevronLeft, FileText } from 'lucide-react';

export default function PagesCreate() {
    const [data, setData] = useState({
        title: '',
        slug: '',
        content: '',
        status: 'draft',
        meta_title: '',
        meta_description: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [slugManual, setSlugManual] = useState(false);

    const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setData(prev => ({
            ...prev,
            title,
            slug: slugManual ? prev.slug : toSlug(title),
        }));
    };

    const handleSlugChange = (e) => {
        setSlugManual(true);
        setData(prev => ({ ...prev, slug: e.target.value }));
    };

    const set = (field) => (e) => setData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/admin/pages', data, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout title="Buat Halaman">
            <Head title="Admin - Buat Halaman" />

            <div className="mb-5">
                <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                    <ChevronLeft size={16} /> Kembali ke Pages
                </Link>
            </div>

            <PageHeader title="Buat Halaman Baru" description="Isi form berikut untuk membuat halaman baru" />

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        <Card className="p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <FileText size={15} /> Konten Halaman
                            </h3>

                            <Input
                                label="Judul Halaman"
                                value={data.title}
                                onChange={handleTitleChange}
                                placeholder="Contoh: Tentang Kami"
                                error={errors.title}
                                required
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-700 dark:text-slate-200 text-sm font-medium">Slug URL</label>
                                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
                                    <span className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-sm border-r border-slate-200 dark:border-slate-700 select-none">/</span>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={handleSlugChange}
                                        placeholder="slug-halaman"
                                        className="flex-1 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none"
                                    />
                                </div>
                                {errors.slug && <p className="text-red-500 text-xs">{errors.slug}</p>}
                            </div>

                            <Textarea
                                label="Konten"
                                value={data.content}
                                onChange={set('content')}
                                placeholder="Tulis konten halaman di sini... (mendukung HTML)"
                                rows={14}
                                error={errors.content}
                            />
                        </Card>

                        {/* SEO */}
                        <Card className="p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">SEO Meta</h3>
                            <Input
                                label="Meta Title"
                                value={data.meta_title}
                                onChange={set('meta_title')}
                                placeholder="Judul untuk mesin pencari (opsional)"
                                error={errors.meta_title}
                            />
                            <Textarea
                                label="Meta Description"
                                value={data.meta_description}
                                onChange={set('meta_description')}
                                placeholder="Deskripsi singkat untuk mesin pencari (opsional)"
                                rows={3}
                                error={errors.meta_description}
                            />
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <Card className="p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Publish</h3>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-slate-700 dark:text-slate-200 text-sm font-medium">Status</label>
                                <select
                                    value={data.status}
                                    onChange={set('status')}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Halaman'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
