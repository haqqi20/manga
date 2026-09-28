import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageHeader } from '@/Components/Admin/UI';
import AnimeForm from './AnimeForm';
import CharactersStaffEditor from '@/Components/Admin/CharactersStaffEditor';
import EpisodesEditor from '@/Components/Admin/EpisodesEditor';
import { ChevronLeft } from 'lucide-react';

export default function AnimeEdit({ anime, genres }) {
    const { data, setData, put, processing, errors } = useForm({
        anilist_id: anime.anilist_id || '',
        title: anime.title || '',
        synopsis: anime.synopsis || '',
        status: anime.status || '',
        type: anime.type || '',
        poster: anime.poster || '',
        rating: anime.rating || '',
        release_year: anime.release_year || '',
        studio: anime.studio || '',
        trailer_url: anime.trailer_url || '',
        is_featured: anime.is_featured ?? false,
        genres: anime.genres?.map(g => g.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/admin/anime/${anime.id}`);
    };

    return (
        <AdminLayout title="Edit Anime">
            <Head title={`Admin - Edit ${anime.title}`} />

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
                title={`Edit: ${anime.title}`}
                description="Perbarui informasi anime"
            />

            <AnimeForm
                data={data}
                setData={setData}
                errors={errors}
                onSubmit={handleSubmit}
                processing={processing}
                genres={genres}
                submitLabel="Simpan Perubahan"
            />

            <CharactersStaffEditor anime={anime} />

            <EpisodesEditor anime={anime} />
        </AdminLayout>
    );
}
