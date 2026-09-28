import { Head, Link } from '@inertiajs/react';

export default function License({ status, message }) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
            <Head title="License Required" />
            <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-11a4 4 0 11-8 0 4 4 0 018 0zM7 10h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8a2 2 0 012-2z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Lisensi Diperlukan</h1>
                <p className="text-slate-400 text-sm mb-8">
                    {message || 'Lisensi tidak valid atau belum diaktifkan. Silakan hubungi administrator untuk mengaktifkan fitur ini.'}
                </p>
                <Link 
                    href="/admin" 
                    className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                >
                    Ke Halaman Admin
                </Link>
            </div>
        </div>
    );
}
