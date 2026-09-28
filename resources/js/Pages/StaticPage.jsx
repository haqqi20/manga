import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight, CalendarClock } from 'lucide-react';

const formatDate = (iso) => {
    if (!iso) return null;
    try {
        return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return null;
    }
};

// Halaman statis dari Admin → Pages (Terms, Privacy, DMCA, Kontak, dll).
export default function StaticPage({ page, og }) {
    const updated = formatDate(page.updated_at);

    return (
        <AppLayout>
            <Head title={og?.title || page.title} />

            <div className="w-full max-w-3xl mx-auto px-5 sm:px-8 mt-8 md:mt-12 mb-24">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-6">
                    <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Beranda</Link>
                    <ChevronRight size={14} className="opacity-60" />
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{page.title}</span>
                </nav>

                <article className="bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm px-6 py-8 sm:px-10 sm:py-10">
                    <header className="mb-8 pb-6 border-b border-slate-100 dark:border-white/10">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {page.title}
                        </h1>
                        {updated && (
                            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <CalendarClock size={14} />
                                Terakhir diperbarui: <time dateTime={page.updated_at}>{updated}</time>
                            </p>
                        )}
                    </header>

                    <div
                        className={[
                            'text-[15px] leading-7 text-slate-600 dark:text-slate-300',
                            '[&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mt-10 [&_h2]:mb-3',
                            '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:dark:text-white [&_h3]:mt-6 [&_h3]:mb-2',
                            '[&_p]:my-3 [&_ul]:my-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-3 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-1.5',
                            '[&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80',
                            '[&_strong]:text-slate-800 [&_strong]:dark:text-slate-100',
                            '[&_table]:w-full [&_table]:my-4 [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:py-2 [&_th]:pr-4 [&_th]:align-top [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_tr]:border-b [&_tr]:border-slate-100 [&_tr]:dark:border-white/10',
                            '[&_.note]:my-5 [&_.note]:rounded-2xl [&_.note]:border [&_.note]:border-blue-200 [&_.note]:dark:border-blue-500/30 [&_.note]:bg-blue-50 [&_.note]:dark:bg-blue-500/10 [&_.note]:px-5 [&_.note]:py-4 [&_.note]:text-slate-700 [&_.note]:dark:text-slate-200',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </article>
            </div>
        </AppLayout>
    );
}
