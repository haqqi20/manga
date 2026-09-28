import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/Admin/UI';
import EpisodeForm from './EpisodeForm';
import { ChevronLeft } from 'lucide-react';

export default function EpisodeEdit({ episode, animes }) {
    const { data, setData, put, processing, errors } = useForm({
        anime_id: episode.anime_id || '',
        title: episode.title || '',
        number: episode.number || '',
        video_url: episode.video_url || '',
        duration: episode.duration || '',
        release_date: episode.release_date ? episode.release_date.slice(0, 10) : '',
        mirror_streams: episode.mirror_streams || [],
        download_urls: episode.download_urls || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/episodes/${episode.id}`);
    };

    return (
        <AdminLayout title="Edit Episode">
            <Head title={`Admin - Edit Episode #${episode.number}`} />

            <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors mb-4"
            >
                <ChevronLeft size={16} />
                Kembali
            </button>

            <PageHeader
                title={`Edit Episode #${episode.number}`}
                description={`Anime: ${episode.anime?.title}`}
            />

            <EpisodeForm
                data={data}
                setData={setData}
                errors={errors}
                onSubmit={handleSubmit}
                processing={processing}
                animes={animes}
                submitLabel="Simpan Perubahan"
            />
        </AdminLayout>
    );
}
