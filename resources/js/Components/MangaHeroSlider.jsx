import React from 'react';
import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { ArrowRight, BookMarked } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';

export default function MangaHeroSlider({ items = [] }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="relative w-full mb-10 px-4 md:px-0">
            <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                pagination={{
                    clickable: true,
                    el: '.mhs-pagination',
                }}
                className="w-full h-[360px] md:h-[380px] rounded-[24px] overflow-hidden bg-slate-100 dark:bg-[#0d0e12]"
            >
                {items.map((manga) => {
                    const poster = manga.poster
                        ? (manga.poster.startsWith('http') ? manga.poster : '/storage/' + manga.poster)
                        : '';
                    const banner = manga.banner || poster;
                    const lastCh = manga.last_chapter || manga.lastChapter;
                    const chNum = lastCh ? parseFloat(lastCh.chapter_number).toString() : '0';
                    const genres = (manga.genres || []).slice(0, 3);

                    return (
                        <SwiperSlide key={manga.id} className="relative w-full h-full bg-slate-100 dark:bg-[#0d0e12]">

                            {/* ── DESKTOP ── */}
                            <div className="hidden md:flex w-full h-full">

                                {/* Background: cover at low opacity (no blur) + gradient fade — same as detail page */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img src={poster} className="w-full h-full object-cover opacity-30" alt="" aria-hidden="true" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white dark:via-slate-900/60 dark:to-[#0d0e12]"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-white/50 dark:from-[#0d0e12]/70 dark:via-transparent dark:to-[#0d0e12]/50"></div>
                                </div>


                                {/* Cover Art — left side as tall portrait */}
                                <div className="relative z-10 flex-shrink-0 flex items-center pl-10 lg:pl-14 pr-10">
                                    <div className="relative group/cover">
                                        {/* Glow */}
                                        <div className="absolute -inset-3 bg-yellow-400/10 rounded-[20px] blur-xl opacity-0 group-hover/cover:opacity-100 transition-opacity duration-500"></div>
                                        <img
                                            src={poster}
                                            alt={manga.title}
                                            className="relative h-[290px] w-[195px] object-cover object-top rounded-[16px] shadow-[0_20px_60px_-5px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover/cover:-translate-y-1"
                                        />
                                        {/* Chapter badge on cover */}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#facc15] text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/30">
                                            Ch. {chNum}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Text info */}
                                <div className="relative z-10 flex flex-col justify-center flex-1 pr-14 lg:pr-20">

                                    {/* Tag */}
                                    <div className="flex items-center gap-2 mb-5">
                                        <BookMarked size={13} className="text-yellow-500 dark:text-yellow-400" />
                                        <span className="text-yellow-600 dark:text-yellow-400/80 text-[10px] font-black uppercase tracking-[0.3em]">Featured Manga</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight line-clamp-2 mb-4">
                                        {manga.title}
                                    </h2>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-px w-10 bg-yellow-500/60 dark:bg-yellow-400/50"></div>
                                        <div className="flex gap-2">
                                            {genres.map(g => (
                                                <span key={g.id} className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest">{g.name}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Synopsis */}
                                    <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed line-clamp-3 font-medium mb-8 max-w-[500px]">
                                        {manga.synopsis || `Ikuti kisah selengkapnya dalam seri ${manga.title}. Aksi dan petualangan menanti di setiap chapter.`}
                                    </p>

                                    {/* Action row */}
                                    <div className="flex items-center gap-5">
                                        <Link
                                            href={'/manga/' + manga.slug}
                                            className="group/btn inline-flex items-center gap-2.5 bg-[#facc15] hover:bg-yellow-300 text-zinc-950 font-black text-[12px] uppercase tracking-[0.18em] px-7 py-3.5 rounded-xl transition-all duration-200 shadow-[0_0_25px_rgba(250,204,21,0.2)] hover:shadow-[0_0_35px_rgba(250,204,21,0.4)] active:scale-95"
                                        >
                                            Start Reading
                                            <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                        <Link
                                            href={'/manga/' + manga.slug}
                                            className="text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                        >
                                            View Details
                                            <ArrowRight size={11} />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* ── MOBILE (unchanged) ── */}
                            <div className="md:hidden flex w-full h-full relative">
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <img
                                        src={banner}
                                        className="w-full h-full object-cover object-top transition-transform duration-[10000ms] scale-105"
                                        alt={manga.title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#16181e] via-[#16181e]/80 via-[#16181e]/30 to-transparent"></div>
                                </div>
                                <div className="relative z-20 w-full h-full flex flex-col justify-end pb-16 px-8">
                                    <div className="text-white/60 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">Chapter: {chNum}</div>
                                    <h2 className="text-2xl font-black text-white mb-4 line-clamp-2 uppercase tracking-tighter leading-tight drop-shadow-lg">{manga.title}</h2>
                                    <div className="flex gap-2 mb-6">
                                        {(manga.genres || []).slice(0, 2).map(genre => (
                                            <span key={genre.id} className="px-3 py-1.5 rounded-lg border border-white/20 bg-black/40 text-slate-200 text-[8px] font-black uppercase tracking-widest">
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href={'/manga/' + manga.slug}
                                        className="w-full flex items-center justify-center gap-2 bg-[#facc15] text-zinc-950 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-yellow-500/40"
                                    >
                                        Start Reading
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>

                        </SwiperSlide>
                    );
                })}
            </Swiper>

            {/* Pagination — bottom right */}
            <div className="absolute bottom-5 right-8 z-40 hidden md:block">
                <div className="mhs-pagination flex items-center gap-2"></div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
                <div className="mhs-pagination flex items-center gap-2"></div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .mhs-pagination .swiper-pagination-bullet {
                    width: 6px; height: 6px;
                    background: rgba(255,255,255,0.2);
                    opacity: 1; border-radius: 99px; cursor: pointer;
                    margin: 0 !important;
                    transition: all 0.35s ease;
                }
                .mhs-pagination .swiper-pagination-bullet-active {
                    background: #facc15 !important;
                    width: 24px !important;
                    box-shadow: 0 0 8px rgba(250,204,21,0.5);
                }
            `}} />
        </section>
    );
}
