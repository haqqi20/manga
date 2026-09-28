import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable admin UI primitives
 */

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-slate-700 dark:text-slate-200 text-sm font-medium">{label}</label>}
            <input
                {...props}
                className={`bg-white dark:bg-slate-900 border ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}
                    rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm placeholder:text-slate-400
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors`}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = '', ...props }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-slate-700 dark:text-slate-200 text-sm font-medium">{label}</label>}
            <textarea
                {...props}
                className={`bg-white dark:bg-slate-900 border ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}
                    rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm placeholder:text-slate-400
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors resize-y`}
            />
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-slate-700 dark:text-slate-200 text-sm font-medium">{label}</label>}
            <select
                {...props}
                className={`bg-white dark:bg-slate-900 border ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}
                    rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm
                    focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors appearance-none`}
            >
                {children}
            </select>
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', ...props }) {
    return (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl ${className}`} {...props}>
            {children}
        </div>
    );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, action }) {
    return (
        <div className="flex items-start justify-between gap-4 mb-6">
            <div>
                <h1 className="text-slate-900 dark:text-white font-bold text-xl">{title}</h1>
                {description && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</p>}
            </div>
            {action}
        </div>
    );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-[#ff2e2e] hover:bg-[#e82828] text-white shadow-lg shadow-[#ff2e2e]/20',
        secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
        danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
        ghost: 'hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };
    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {loading && (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}

// ─── Badge / Status ───────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
    const map = {
        ongoing:   { label: 'Ongoing',   cls: 'bg-blue-50 text-blue-600' },
        completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600' },
        upcoming:  { label: 'Upcoming',  cls: 'bg-amber-50 text-amber-600' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
            {label}
        </span>
    );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Cari...', className = '', ...props }) {
    return (
        <div className={`relative ${className}`}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="search"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...props}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white text-sm
                    placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ links, meta }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-slate-400 text-sm">
                Menampilkan {meta?.from ?? 1}–{meta?.to ?? '?'} dari {meta?.total ?? '?'} data
            </p>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    if (!link.url && !link.label) return null;
                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                    if (isPrev || isNext) {
                        return (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors
                                    ${!link.url ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 dark:bg-slate-800'}
                                    text-slate-500 dark:text-slate-400`}
                            >
                                {isPrev ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </Link>
                        );
                    }
                    return (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveScroll
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                                ${link.active
                                    ? 'bg-[#ff2e2e] text-white shadow-lg shadow-[#ff2e2e]/20'
                                    : link.url
                                        ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-900 dark:text-white'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
export function ConfirmModal({ open, title, description, onConfirm, onCancel, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>Batal</Button>
                    <Button variant="danger" onClick={onConfirm} loading={loading}>Hapus</Button>
                </div>
            </div>
        </div>
    );
}
