import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/Admin/UI';
import EpisodeForm from './EpisodeForm';
import { ChevronLeft } from 'lucide-react';

export default function EpisodeCreate({ animes }) {
    const { data, setData, post, processing, errors } = useForm({
        anime_id: '',
        title: '',
        number: '',
        video_url: '',
        duration: '',
        release_date: '',
        mirror_streams: [],
        download_urls: [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/episodes');
    };

    return (
        <AdminLayout title="Tambah Episode">
            <Head title="Admin - Tambah Episode" />

            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-4"
            >
                <ChevronLeft size={16} />
                Kembali
            </button>

            <PageHeader
                title="Tambah Episode Baru"
                description="Isi informasi episode yang ingin ditambahkan"
            />

            <EpisodeForm
                data={data}
                setData={setData}
                errors={errors}
                onSubmit={handleSubmit}
                processing={processing}
                animes={animes}
                submitLabel="Tambah Episode"
            />
        </AdminLayout>
    );
}
