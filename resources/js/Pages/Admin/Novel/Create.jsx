import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import NovelForm from './NovelForm';
export default function Create({ genres }) { return <AdminLayout title="Tambah Novel"><Head title="Tambah Novel"/><div className="max-w-6xl mx-auto py-6"><h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tambah Novel</h1><NovelForm genres={genres}/></div></AdminLayout> }
