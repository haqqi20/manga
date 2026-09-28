import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, PageHeader, Button } from '@/Components/Admin/UI';
import { Download, Loader2, RefreshCw, Search, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';

export default function AnimeMassUpdate() {
    const [limit, setLimit] = useState(20);
    const [mode, setMode] = useState('full');
    const [titles, setTitles] = useState([]);
    const [fetchingTitles, setFetchingTitles] = useState(false);
    const [running, setRunning] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const titleText = useMemo(() => titles.join('\n'), [titles]);

    const fetchTitles = async () => {
        setFetchingTitles(true);
        setError('');
        setResult(null);
        try {
            const res = await axios.get('/admin/otakudesu/ongoing-titles', {
                params: { limit },
                timeout: 60000,
            });
            setTitles(res.data?.titles || []);
            if (!res.data?.titles?.length) {
                setError('Tidak ada title yang berhasil diambil dari Otakudesu.');
            }
        } catch (e) {
            setError(e.response?.data?.message || e.response?.data?.error || 'Gagal mengambil title ongoing Otakudesu.');
        } finally {
            setFetchingTitles(false);
        }
    };

    const runUpdate = async () => {
        if (!titles.length) return;
        setRunning(true);
        setError('');
        setResult(null);
        try {
            const res = await axios.post('/admin/otakudesu/mass-update-latest', {
                titles,
                mode,
            }, { timeout: 600000 });
            setResult(res.data);
        } catch (e) {
            setError(e.response?.data?.message || e.response?.data?.error || 'Gagal menjalankan update episode massal.');
        } finally {
            setRunning(false);
        }
    };

    const downloadFailedLog = () => {
        const failed = result?.logs?.filter((item) => item.status === 'failed') || [];
        const content = failed.map((item) => {
            return `[${new Date().toLocaleString()}]\n${item.title}\nError: ${item.message}\n`;
        }).join('\n');

        const blob = new Blob([content || 'Tidak ada log gagal.'], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gagal-anime.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const summary = result?.summary || {};

    return (
        <AdminLayout title="Cek Episode Anime Massal">
            <Head title="Admin - Cek Episode Anime Massal" />

            <PageHeader
                title="Cek Episode Anime Massal"
                description="Ambil title dari ongoing Otakudesu, lalu auto update episode terbaru yang paling bawah/terbaru."
            />

            <Card className="p-5 mb-5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Ambil berapa title?
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="200"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            Mode import
                        </label>
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        >
                            <option value="full">Full scrape streaming & download</option>
                            <option value="stub">Stub only cepat</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-3">
                        <Button onClick={fetchTitles} disabled={fetchingTitles || running} className="w-full justify-center">
                            {fetchingTitles ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                            Ambil Title
                        </Button>
                        <Button onClick={runUpdate} disabled={!titles.length || running || fetchingTitles} className="w-full justify-center">
                            {running ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
                            Jalankan
                        </Button>
                    </div>
                </div>

                <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-sm text-amber-700 dark:text-amber-300">
                    Sistem akan mencari anime di database admin berdasarkan title. Kalau ketemu, sistem search Otakudesu, ambil episode paling baru, lalu import hanya 1 episode itu saja.
                </div>
            </Card>

            {error && (
                <Card className="p-4 mb-5 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-300 text-sm">
                        <AlertTriangle size={16} />
                        {error}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Title dari Otakudesu</h3>
                        <span className="text-xs text-slate-400">{titles.length} title</span>
                    </div>
                    <textarea
                        value={titleText}
                        onChange={(e) => setTitles(e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))}
                        rows={18}
                        placeholder="Klik Ambil Title untuk mengambil daftar ongoing dari Otakudesu..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 font-mono"
                    />
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Hasil Update</h3>
                        <Button variant="secondary" size="sm" onClick={downloadFailedLog} disabled={!result}>
                            <Download size={14} />
                            Download Gagal
                        </Button>
                    </div>

                    {!result ? (
                        <div className="text-center py-20 text-slate-400">
                            <RefreshCw size={34} className="mx-auto mb-3 opacity-40" />
                            <p>Hasil akan tampil setelah proses dijalankan.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                                <SummaryBox label="Diproses" value={summary.processed || 0} />
                                <SummaryBox label="Ketemu" value={summary.found || 0} />
                                <SummaryBox label="Ditambah" value={summary.imported || 0} green />
                                <SummaryBox label="Update" value={summary.updated || 0} blue />
                                <SummaryBox label="Gagal" value={summary.failed || 0} red />
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs uppercase text-slate-400">Anime</th>
                                            <th className="px-3 py-3 text-left text-xs uppercase text-slate-400">Episode</th>
                                            <th className="px-3 py-3 text-left text-xs uppercase text-slate-400">Status</th>
                                            <th className="px-3 py-3 text-left text-xs uppercase text-slate-400">Pesan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {result.logs?.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">{item.anime_title || item.title}</td>
                                                <td className="px-3 py-3 text-slate-500 dark:text-slate-300">{item.episode || '—'}</td>
                                                <td className="px-3 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${item.status === 'failed' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                                                        {item.status !== 'failed' && <CheckCircle size={12} />}
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-slate-500 dark:text-slate-300">{item.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}

function SummaryBox({ label, value, green, blue, red }) {
    const cls = red
        ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20'
        : green
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
            : blue
                ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20'
                : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800';

    return (
        <div className={`rounded-xl border p-3 text-center ${cls}`}>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
        </div>
    );
}
