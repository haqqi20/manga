import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import MangaForm from './MangaForm';

export default function Create({ genres }) {
    return (
        <AdminLayout title="Tambah Manga Baru">
            <Head title="Tambah Manga" />

            <div className="max-w-7xl mx-auto py-2">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Tambah Manga</h1>
                    <p className="text-sm text-slate-500 mt-1.5 font-medium">Lengkapi formulir di bawah ini untuk menerbitkan judul manga baru di Hestia.</p>
                </div>

                <MangaForm genres={genres} />
            </div>
        </AdminLayout>
    );
}
