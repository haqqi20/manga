import React from 'react';
import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Star, Flame, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';

export default function TrendingMangaSlider({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="relative py-8 overflow-hidden">

            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                        Trending <span className="text-orange-500">Now</span>
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button className="trending-prev w-9 h-9 flex items-center justify-center border rounded-lg bg-white dark:bg-slate-900">
                        <ChevronLeft size={18} />
                    </button>
                    <button className="trending-next w-9 h-9 flex items-center justify-center border rounded-lg bg-white dark:bg-slate-900">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <Swiper
                modules={[Navigation]}
                spaceBetween={10}
                slidesPerView={2}
                navigation={{
                    prevEl: '.trending-prev',
                    nextEl: '.trending-next',
                }}
                loop={false} // 🔥 penting: matikan loop
                speed={400}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                }}
            >
                {items.map((manga, idx) => {
                    const poster = manga.poster 
                        ? (manga.poster.startsWith('http') ? manga.poster : '/storage/' + manga.poster)
                        : '';

                    const lastCh = manga.last_chapter || manga.lastChapter;
                    const chNum = lastCh ? parseFloat(lastCh.chapter_number).toString() : '0';
                    const rating = (parseFloat(manga.rating) || 0).toFixed(1);

                    return (
                        <SwiperSlide key={manga.id}>
                            <Link href={'/manga/' + manga.slug} className="block">

                                <div className="relative aspect-[3/4.5] rounded-xl overflow-hidden bg-slate-900 border border-white/5">

                                    <img
                                        src={poster}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                        alt={manga.title}
                                    />

                                    {/* overlay ringan saja */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                                    {/* rank */}
                                    <div className="absolute top-2 left-2 text-xs font-bold text-white bg-black/40 px-2 py-1 rounded">
                                        #{idx + 1}
                                    </div>

                                    {/* status */}
                                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] bg-orange-600 text-white px-2 py-1 rounded">
                                        <Flame size={10} />
                                        TREND
                                    </div>

                                    {/* bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                        <h3 className="text-xs font-bold line-clamp-2">
                                            {manga.title}
                                        </h3>

                                        <div className="flex justify-between mt-1 text-[10px]">
                                            <span className="text-orange-400">Ch. {chNum}</span>
                                            <span className="flex items-center gap-1">
                                                <Star size={10} className="fill-yellow-400" />
                                                {rating}
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </section>
    );
}