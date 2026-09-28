import { Link } from '@inertiajs/react';
import { X, AlertCircle, ChevronRight } from 'lucide-react';
import Modal from './Modal';

export default function AuthModal({ show, onClose }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="relative bg-white dark:bg-slate-900 p-8 text-center">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">
                        <AlertCircle size={32} />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Please Register To Use These Features
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 max-w-sm mx-auto">
                    You need an account to use this feature. It's quick and free — join now to continue!
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    <Link
                        href={route('register')}
                        className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                    >
                        Register Now
                        <ChevronRight size={18} />
                    </Link>
                    
                    <div>
                        <Link
                            href={route('login')}
                            className="text-xs font-semibold text-blue-500 hover:underline"
                        >
                            Have an account?
                        </Link>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
