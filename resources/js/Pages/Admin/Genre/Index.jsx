import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button, Input, ConfirmModal } from '@/Components/Admin/UI';
import { Plus, Pencil, Trash2, Tag, X, Check } from 'lucide-react';

function GenreModal({ open, onClose, onSubmit, processing, errors, editGenre }) {
    const [name, setName] = useState(editGenre?.name || '');
    const [icon, setIcon] = useState(editGenre?.icon || '');

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, icon });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">
                        {editGenre ? 'Edit Genre' : 'Tambah Genre'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 dark:text-slate-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Genre *"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        error={errors?.name}
                        placeholder="cth: Action"
                        required
                        autoFocus
                    />
                    <Input
                        label="Icon (opsional)"
                        value={icon}
                        onChange={e => setIcon(e.target.value)}
                        placeholder="cth: ⚔️ atau nama icon"
                    />
                    <div className="flex justify-end gap-3 pt-1">
                        <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
                        <Button type="submit" loading={processing}>
                            <Check size={14} />
                            {editGenre ? 'Simpan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function GenreIndex({ genres }) {
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [modalErrors, setModalErrors] = useState({});
    const [modalProcessing, setModalProcessing] = useState(false);

    const openCreate = () => { setEditTarget(null); setModalErrors({}); setShowModal(true); };
    const openEdit = (genre) => { setEditTarget(genre); setModalErrors({}); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditTarget(null); };

    const handleModalSubmit = ({ name, icon }) => {
        setModalProcessing(true);
        if (editTarget) {
            router.put(`/admin/genres/${editTarget.id}`, { name, icon }, {
                onSuccess: () => { setModalProcessing(false); closeModal(); },
                onError: (e) => { setModalProcessing(false); setModalErrors(e); },
            });
        } else {
            router.post('/admin/genres', { name, icon }, {
                onSuccess: () => { setModalProcessing(false); closeModal(); },
                onError: (e) => { setModalProcessing(false); setModalErrors(e); },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/admin/genres/${deleteTarget.id}`, {
            onFinish: () => { setDeleting(false); setDeleteTarget(null); },
        });
    };

    return (
        <AdminLayout title="Manajemen Genre">
            <Head title="Admin - Genre" />

            <PageHeader
                title="Genre"
                description={`${genres.length} genre terdaftar`}
                action={
                    <Button onClick={openCreate}>
                        <Plus size={15} />
                        Tambah Genre
                    </Button>
                }
            />

            {/* Genre Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {genres.length === 0 && (
                    <div className="col-span-full text-center py-20 text-slate-400">
                        <Tag size={32} className="mx-auto mb-3 opacity-40" />
                        <p>Belum ada genre</p>
                    </div>
                )}
                {genres.map((genre) => (
                    <Card
                        key={genre.id}
                        className="p-4 group hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="text-2xl">{genre.icon || '🏷️'}</div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(genre)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(genre)}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-900 dark:text-white font-semibold text-sm">{genre.name}</p>
                        <p className="text-slate-400 text-xs mt-1">
                            {genre.animes_count ?? 0} anime
                        </p>
                    </Card>
                ))}
            </div>

            <GenreModal
                open={showModal}
                onClose={closeModal}
                onSubmit={handleModalSubmit}
                processing={modalProcessing}
                errors={modalErrors}
                editGenre={editTarget}
            />

            <ConfirmModal
                open={!!deleteTarget}
                title="Hapus Genre"
                description={`Hapus genre "${deleteTarget?.name}"? Genre akan dihapus dari semua anime terkait.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                loading={deleting}
            />
        </AdminLayout>
    );
}
