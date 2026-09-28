import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Key, ShieldCheck, ShieldAlert, RefreshCw, Globe, Power, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function LicenseIndex({ license }) {
    const [isReverifying, setIsReverifying] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        license_key: license.license_key || '',
        domain: license.domain || window.location.hostname,
    });

    const handleActivate = (e) => {
        e.preventDefault();
        post(route('admin.license.activate'));
    };

    const handleDeactivate = () => {
        if (confirm('Apakah Anda yakin ingin menonaktifkan lisensi? Website tidak akan dapat diakses oleh publik.')) {
            router.post(route('admin.license.deactivate'));
        }
    };

    const handleReverify = () => {
        setIsReverifying(true);
        post(route('admin.license.reverify'), {
            onFinish: () => setIsReverifying(false)
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    Aktif
                </span>;
            case 'invalid':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                    ✕ Tidak Valid
                </span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    ○ Non-Aktif
                </span>;
        }
    };

    return (
        <AdminLayout title="Manajemen Lisensi">
            <Head title="Manajemen Lisensi - Admin Panel" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Key size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Status Lisensi</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Kelola aktivasi dan validasi lisensi untuk domain Anda.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    {getStatusBadge(license.status)}
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Produk</span>
                                    <span className="font-bold text-slate-900 dark:text-white capitalize">{license.product_name}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Terakhir Diverifikasi</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{license.last_verified_at || '-'}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Tanggal Aktivasi</span>
                                    <span className={`text-sm ${license.activated_at ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-600 italic'}`}>
                                        {license.activated_at || 'Belum Aktivasi'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-sm font-medium text-slate-500">Versi Script</span>
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 rounded text-[10px] font-black uppercase tracking-widest">
                                        v{license.version}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {license.has_license && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button 
                                    onClick={handleReverify}
                                    disabled={isReverifying}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    <RefreshCw size={16} className={isReverifying ? 'animate-spin' : ''} />
                                    Cek Validitas
                                </button>
                                <button 
                                    onClick={handleDeactivate}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                                >
                                    <Power size={16} />
                                    Nonaktifkan Lisensi
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activation Form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="text-lg font-bold">Aktivasi Lisensi Baru</h3>
                    </div>

                    <form onSubmit={handleActivate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Key size={14} /> License Key
                                </label>
                                <input 
                                    type="text"
                                    value={data.license_key}
                                    onChange={e => setData('license_key', e.target.value)}
                                    placeholder="SATULAGI-XXXXX-XXXXX-XXXXX"
                                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.license_key ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all`}
                                />
                                {errors.license_key && <p className="text-xs text-red-500 mt-1">{errors.license_key}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Globe size={14} /> Domain / Host
                                </label>
                                <input 
                                    type="text"
                                    value={data.domain}
                                    onChange={e => setData('domain', e.target.value)}
                                    placeholder="example.com"
                                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.domain ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all`}
                                />
                                {errors.domain && <p className="text-xs text-red-500 mt-1">{errors.domain}</p>}
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl flex gap-3">
                            <Info size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                Pastikan Anda memasukkan domain yang benar. Lisensi biasanya terkunci pada satu domain. Jika Anda menggunakan localhost, gunakan 127.0.0.1 atau localhost sesuai URL yang sedang diakses.
                            </p>
                        </div>

                        <button 
                            type="submit"
                            disabled={processing}
                            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : (license.has_license ? 'Simpan & Re-aktivasi' : 'Aktifkan Lisensi')}
                        </button>
                    </form>
                </div>

                {/* Support Card */}
                <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                            <ShieldAlert size={24} className="text-indigo-500" />
                        </div>
                        <div>
                            <h4 className="font-bold">Butuh bantuan lisensi?</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hubungi developer di admin@satulagistudio.com untuk reset domain atau masalah key.</p>
                        </div>
                    </div>
                    <a href="https://satulagistudio.com" target="_blank" className="px-5 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-all">
                        Kunjungi Satulagi Studio
                    </a>
                </div>
            </div>
        </AdminLayout>
    );
}
