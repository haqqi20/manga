import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Upload, RefreshCw, CheckCircle, AlertTriangle, Info,
    Package, Shield, Clock, Terminal, ChevronDown, ChevronUp,
    FileText, Zap, Server, Database, ArrowUpCircle, XCircle
} from 'lucide-react';

export default function UpdaterIndex({ currentVersion, phpVersion, laravelVersion, changelog = [] }) {
    const { flash } = usePage().props;
    const [isDragging, setIsDragging] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [updateLog, setUpdateLog] = useState(flash?.updateLog || []);
    const [fileName, setFileName] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        update_file: null,
    });

    const handleFileSelect = (file) => {
        if (file && file.name.endsWith('.zip')) {
            setData('update_file', file);
            setFileName(file.name);
        } else {
            alert('Hanya file ZIP yang diperbolehkan.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.update_file) return;

        if (!confirm(`Apakah Anda yakin ingin menjalankan update?\n\nFile: ${fileName}\n\nProses ini akan:\n1. Mengaktifkan mode maintenance\n2. Menimpa file yang diperbarui\n3. Menjalankan migrasi database (jika ada)\n4. Membersihkan semua cache\n\nPastikan Anda sudah membackup database dan file!`)) {
            return;
        }

        post(route('admin.updater.upload'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFileName('');
            },
        });
    };

    return (
        <AdminLayout title="Updater">
            <Head title="Script Updater" />

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                                <ArrowUpCircle size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight">Script Updater</h1>
                                <p className="text-slate-400 text-sm mt-0.5">Upload paket update untuk memperbarui script Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <Package size={12} /> Versi Script
                                </div>
                                <p className="text-2xl font-black text-red-400">v{currentVersion}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <Server size={12} /> PHP
                                </div>
                                <p className="text-2xl font-black text-emerald-400">{phpVersion}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <Zap size={12} /> Laravel
                                </div>
                                <p className="text-2xl font-black text-sky-400">{laravelVersion}</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <Shield size={12} /> Status
                                </div>
                                <p className="text-lg font-black text-emerald-400 flex items-center gap-2">
                                    <CheckCircle size={16} /> Up to date
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
                        <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-emerald-800 dark:text-emerald-400">{flash.success}</p>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                        <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-red-800 dark:text-red-400">{flash.error}</p>
                        </div>
                    </div>
                )}

                {flash?.warning && (
                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-400">{flash.warning}</p>
                        </div>
                    </div>
                )}

                {/* Update Log */}
                {(updateLog.length > 0 || flash?.updateLog) && (
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal size={18} className="text-emerald-400" />
                            <h3 className="text-white font-bold text-sm">Update Log</h3>
                        </div>
                        <div className="bg-black/50 rounded-xl p-4 max-h-[300px] overflow-y-auto font-mono text-xs space-y-1.5">
                            {(flash?.updateLog || updateLog).map((line, i) => (
                                <div key={i} className={`${line.startsWith('❌') ? 'text-red-400' : line.startsWith('⚠️') ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Upload size={20} className="text-red-500" />
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Upload Paket Update</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Drag & Drop Zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('update-file-input').click()}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                                isDragging
                                    ? 'border-red-500 bg-red-50 dark:bg-red-500/10 scale-[1.01]'
                                    : fileName
                                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <input
                                id="update-file-input"
                                type="file"
                                accept=".zip"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                            />

                            {fileName ? (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                                        <Package size={28} className="text-emerald-500" />
                                    </div>
                                    <p className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">{fileName}</p>
                                    <p className="text-emerald-600/70 dark:text-emerald-400/70 text-sm">File siap diupload. Klik tombol "Jalankan Update" untuk memulai.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                                        <Upload size={28} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
                                            Drag & Drop file update disini
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">atau klik untuk memilih file • Format: .zip • Maks: 100MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {errors.update_file && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> {errors.update_file}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => { reset(); setFileName(''); }}
                                className="px-5 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                disabled={processing}
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={!data.update_file || processing}
                                className={`px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center gap-3 transition-all duration-300 shadow-lg ${
                                    data.update_file && !processing
                                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 hover:shadow-red-500/40'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Memproses Update...
                                    </>
                                ) : (
                                    <>
                                        <ArrowUpCircle size={18} />
                                        Jalankan Update
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* How to Create Update Package */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Info size={20} className="text-sky-500" />
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Cara Membuat Paket Update</h2>
                    </div>

                    <div className="space-y-5 text-sm">
                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10">
                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-3">📁 Struktur file ZIP:</p>
                            <pre className="bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto">{`update-v1.1.0.zip
├── update.json          ← Manifest (WAJIB)
└── files/               ← File yang akan ditimpa
    ├── app/
    │   └── Http/
    │       └── Controllers/
    │           └── SomeController.php
    ├── resources/
    │   └── js/
    │       └── Pages/
    │           └── Home.jsx
    └── config/
        └── hestia.php`}</pre>
                        </div>

                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/10">
                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-3">📄 Contoh update.json:</p>
                            <pre className="bg-slate-900 text-sky-400 rounded-xl p-4 text-xs font-mono overflow-x-auto">{`{
    "version": "1.1.0",
    "description": "Bug fixes dan fitur baru",
    "migrations": true,
    "commands": [
        "config:clear",
        "cache:clear"
    ],
    "changes": [
        "Fix tampilan halaman detail manga",
        "Tambah fitur share ke sosial media",
        "Perbaikan performa loading"
    ]
}`}</pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-amber-50 dark:bg-amber-500/5 rounded-2xl p-5 border border-amber-200 dark:border-amber-500/10">
                                <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                                    <AlertTriangle size={14} /> Penting
                                </p>
                                <ul className="text-amber-700/80 dark:text-amber-400/80 text-xs space-y-1.5 list-disc pl-4">
                                    <li>Selalu backup database sebelum update</li>
                                    <li>Pastikan versi di update.json lebih tinggi</li>
                                    <li>File dalam folder <code className="bg-amber-200/50 dark:bg-amber-500/20 px-1 rounded">files/</code> akan menimpa file yang ada</li>
                                </ul>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/10">
                                <p className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                                    <CheckCircle size={14} /> Fitur Updater
                                </p>
                                <ul className="text-emerald-700/80 dark:text-emerald-400/80 text-xs space-y-1.5 list-disc pl-4">
                                    <li>Otomatis aktifkan maintenance mode</li>
                                    <li>Jalankan migrasi database otomatis</li>
                                    <li>Bersihkan semua cache setelah update</li>
                                    <li>Log detail setiap proses update</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Changelog */}
                {changelog.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8">
                        <button
                            onClick={() => setShowChangelog(!showChangelog)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-slate-400" />
                                <h2 className="text-lg font-black text-slate-900 dark:text-white">Riwayat Update ({changelog.length})</h2>
                            </div>
                            {showChangelog ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>

                        {showChangelog && (
                            <div className="mt-6 space-y-4">
                                {changelog.map((entry, i) => (
                                    <div key={i} className="relative pl-8 pb-6 border-l-2 border-slate-200 dark:border-slate-700 last:pb-0">
                                        <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] bg-red-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-black text-red-500">v{entry.version}</span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                                                {new Date(entry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{entry.description}</p>
                                        {entry.changes && entry.changes.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {entry.changes.map((change, j) => (
                                                    <li key={j} className="text-xs text-slate-500 dark:text-slate-500 flex items-start gap-2">
                                                        <span className="text-emerald-500 mt-0.5">•</span>
                                                        {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
