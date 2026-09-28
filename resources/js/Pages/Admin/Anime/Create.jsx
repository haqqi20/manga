import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/Admin/UI';
import AnimeForm from './AnimeForm';
import { ChevronLeft } from 'lucide-react';

export default function AnimeCreate({ genres }) {
    const { data, setData, post, processing, errors } = useForm({
        anilist_id: '',
        title: '',
        synopsis: '',
        status: '',
        type: '',
        poster: '',
        rating: '',
        release_year: '',
        studio: '',
        trailer_url: '',
        is_featured: false,
        genres: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/anime');
    };

    return (
        <AdminLayout title="Tambah Anime">
            <Head title="Admin - Tambah Anime" />

            <div className="mb-2">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white text-sm transition-colors mb-4"
                >
                    <ChevronLeft size={16} />
                    Kembali
                </button>
            </div>

            <PageHeader
                title="Tambah Anime Baru"
                description="Isi informasi anime yang ingin ditambahkan"
            />

            <AnimeForm
                data={data}
                setData={setData}
                errors={errors}
                onSubmit={handleSubmit}
                processing={processing}
                genres={genres}
                submitLabel="Tambah Anime"
            />
        </AdminLayout>
    );
}
