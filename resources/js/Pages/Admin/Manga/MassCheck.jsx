import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AlertTriangle, Download, FileWarning, Loader2, Play, RefreshCw, Trash2 } from 'lucide-react';

export default function MassCheck({ defaultStartPage = 1, defaultEndPage = 15, failedLogs = [] }) {
    const [startPage, setStartPage] = useState(defaultStartPage);
    const [endPage, setEndPage] = useState(defaultEndPage);
    const [limit, setLimit] = useState('');
    const [autoImportMissing, setAutoImportMissing] = useState(true);
    const [running, setRunning] = useState(false);
    const [logs, setLogs] = useState(failedLogs || []);
    const [summary, setSummary] = useState(null);
    const [message, setMessage] = useState('');

    const refreshLogs = async () => {
        const res = await axios.get(route('admin.manga.mass-check.logs'));
        setLogs(res.data.logs || []);
    };

    const runMassCheck = async () => {
        if (!confirm('Mulai cek chapter massal? Log gagal lama akan dihapus otomatis.')) return;

        setRunning(true);
        setMessage('Sedang berjalan. Jangan tutup halaman sampai proses selesai.');
        setSummary(null);

        try {
            const res = await axios.post(route('admin.manga.mass-check.run'), {
                start_page: Number(startPage) || 1,
                end_page: Number(endPage) || 15,
                limit: limit ? Number(limit) : null,
                auto_import_missing: autoImportMissing,
            });

            setSummary(res.data);
            setLogs(res.data.failed_logs || []);
            setMessage('Cek chapter massal selesai.');
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || err.response?.data?.error || 'Gagal menjalankan cek chapter massal.');
            await refreshLogs().catch(() => null);
        } finally {
            setRunning(false);
        }
    };

    const clearLog = async () => {
        if (!confirm('Hapus log gagal sekarang?')) return;
        await axios.post(route('admin.manga.mass-check.clear'));
        setLogs([]);
    };

    return (
        <AdminLayout title="Cek Chapter Massal">
            <Head title="Cek Chapter Massal" />

            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <RefreshCw size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">Cek Chapter Massal</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Mengambil daftar manga terbaru dari Komiku, mencocokkan dengan manga di admin, auto import manga yang belum ada jika diaktifkan, lalu import chapter yang belum ada. Hanya log gagal yang disimpan.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Page</label>
                            <input
                                type="number"
                                min="1"
                                value={startPage}
                                onChange={(e) => setStartPage(e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Page</label>
                            <input
                                type="number"
                                min="1"
                                value={endPage}
                                onChange={(e) => setEndPage(e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm focus:ring-red-500 focus:border-red-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Limit Opsional</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="Kosongkan untuk semua"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-950 text-sm focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                    </div>

                    <label className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoImportMissing}
                            onChange={(e) => setAutoImportMissing(e.target.checked)}
                            className="mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span>
                            <span className="block text-sm font-black text-slate-900 dark:text-white">Auto import manga yang belum ada</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Jika muncul error "Manga tidak ditemukan di admin", sistem akan coba import manga dari URL Komiku dulu, lalu lanjut import chapter-nya.
                            </span>
                        </span>
                    </label>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6">
                        <button
                            type="button"
                            onClick={runMassCheck}
                            disabled={running}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black transition disabled:opacity-60"
                        >
                            {running ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                            {running ? 'Sedang Cek...' : 'Mulai Cek Chapter Massal'}
                        </button>

                        <button
                            type="button"
                            onClick={refreshLogs}
                            disabled={running}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
                        >
                            <RefreshCw size={18} />
                            Refresh Log
                        </button>
                    </div>

                    {message && (
                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-200 px-4 py-3 text-sm flex gap-2">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <span>{message}</span>
                        </div>
                    )}

                    {summary && (
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
                            <SummaryCard label="Dicek" value={summary.checked} />
                            <SummaryCard label="Manga Update" value={summary.updated} />
                            <SummaryCard label="Manga Import" value={summary.imported_manga} />
                            <SummaryCard label="Chapter Import" value={summary.imported_chapters} />
                            <SummaryCard label="Gagal" value={summary.failed} danger />
                        </div>
                    )}
                </div>

                <div id="log-gagal" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 flex items-center justify-center">
                                <FileWarning size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-slate-900 dark:text-white">Log Gagal</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">File: storage/logs/manga-update-failed.log</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={route('admin.manga.mass-check.download')}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
                            >
                                <Download size={16} />
                                Download gagal.txt
                            </a>
                            <button
                                type="button"
                                onClick={clearLog}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                            >
                                <Trash2 size={16} />
                                Hapus Log
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Manga</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Error</th>
                                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                                            Belum ada log gagal.
                                        </td>
                                    </tr>
                                ) : logs.map((log, index) => (
                                    <tr key={`${log.time}-${index}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/40">
                                        <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">{log.title}</td>
                                        <td className="px-5 py-4 text-sm text-red-600 dark:text-red-300 min-w-[280px]">{log.error}</td>
                                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ label, value, danger = false }) {
    return (
        <div className={`rounded-xl border p-4 ${danger ? 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950'}`}>
            <div className={`text-2xl font-black ${danger ? 'text-red-600 dark:text-red-300' : 'text-slate-900 dark:text-white'}`}>{value ?? 0}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{label}</div>
        </div>
    );
}
