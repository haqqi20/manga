import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, AlertCircle } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, onSubmit }) {
    const [type, setType] = useState('Player Error');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const types = [
        'Gambar Rusak',
        'Gambar Acak',
        'Halaman Hilang',
        'Isi Salah',
        'Lainnya'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit({ type, message });
        setLoading(false);
        onClose();
        // Reset form
        setType('Gambar Rusak'); // Updated default
        setMessage('');
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-slate-900 dark:text-white">
                                        Laporkan Masalah Series/Chapter
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Alert Box */}
                                <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 mb-6 flex gap-3">
                                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                                        Silakan gunakan formulir ini untuk melaporkan masalah terkait seri ini. Berikan detail yang jelas agar kami dapat menyelesaikan masalah tersebut dengan lebih cepat.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Issue Type */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
                                            Tipe Masalah
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {types.map((t) => (
                                                <label
                                                    key={t}
                                                    className={`
                                                        relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer
                                                        ${type === t 
                                                            ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/30' 
                                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-4 h-4 rounded-full border flex items-center justify-center transition-all
                                                        ${type === t 
                                                            ? 'border-red-500 bg-red-500' 
                                                            : 'border-slate-300 dark:border-slate-600'}
                                                    `}>
                                                        {type === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={t}
                                                        checked={type === t}
                                                        onChange={() => setType(t)}
                                                        className="hidden"
                                                    />
                                                    <span className={`text-sm font-medium ${type === t ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {t}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                            Deskripsi Masalah
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Deskripsikan masalah lebih jelas..."
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[100px] resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            'Submit'
                                        )}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
