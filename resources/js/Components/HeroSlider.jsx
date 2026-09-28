import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { PlayCircle, Info } from 'lucide-react';
import { useMemo } from 'react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroSlider({ featured }) {
    if (!featured || featured.length === 0) return null;

    // 🔥 Memo biar gak re-create terus
    const getYoutubeId = useMemo(() => (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }, []);

    return (
        <div className="w-full">
            {/* --- DESKTOP HERO SLIDER --- */}
            <div className="hidden lg:block w-full relative mb-8">
                <div className="container mx-auto mt-6 px-4">
                    <Swiper
                        modules={[Autoplay, Pagination, EffectFade]}
                        effect={'fade'}
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        // 🔥 smoother & ringan
                        speed={600}
                        allowTouchMove={false}
                        className="w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-fuchsia-900/20 h-[500px] bg-slate-950 border border-white/10"
                    >
                        {featured.map((anime) => {
                            const ytId = getYoutubeId(anime.trailer_url);

                            return (
                                <SwiperSlide key={anime.id} className="relative w-full h-full group bg-slate-900">
                                    <div className="absolute inset-0 overflow-hidden">
                                        {ytId ? (
                                            <div className="absolute top-1/2 left-1/2 w-[200vw] h-[200vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}`}
                                                    className="w-full h-full"
                                                    allow="autoplay; encrypted-media"
                                                    loading="lazy"
                                                    style={{ border: 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <img
                                                src={anime.banner || anime.poster}
                                                alt={anime.title}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}

                                        {/* overlay */}
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(217,70,239,.35),transparent_28%),linear-gradient(90deg,rgba(2,6,23,.96),rgba(15,23,42,.62),rgba(2,6,23,.18))]"></div>
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent"></div>
                                    </div>

                                    <div className="absolute inset-0 flex items-center">
                                        <div className="px-10 md:px-16 lg:px-20 text-white w-full max-w-4xl z-10">
                                            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-bold uppercase tracking-wider">
                                                <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1 rounded-full shadow-lg">{anime.type || 'TV'}</span>
                                                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full ring-1 ring-white/15">
                                                    ⭐ {anime.rating || 'N/A'}
                                                </span>
                                                <span className="text-gray-400">|</span>
                                                <span className="bg-white/10 px-3 py-1 rounded-full ring-1 ring-white/10">
                                                    {anime.status || 'Ongoing'}
                                                </span>
                                            </div>

                                            <h2 className="text-4xl md:text-6xl font-black mb-4 line-clamp-2 tracking-tight drop-shadow">
                                                {anime.title}
                                            </h2>

                                            <p className="text-slate-200/90 mb-7 max-w-2xl line-clamp-3 text-sm leading-relaxed">
                                                {anime.synopsis || 'Sinopsis tidak tersedia.'}
                                            </p>

                                            <div className="flex items-center gap-4">
                                                <Link href={`/anime/${anime.slug}/episode/1`}
                                                    className="bg-white text-slate-950 hover:bg-fuchsia-50 px-6 py-3 rounded-full font-black flex items-center gap-2 shadow-xl shadow-black/20">
                                                    <PlayCircle className="w-5 h-5" />
                                                    Mulai
                                                </Link>

                                                <Link href={`/anime/${anime.slug}`}
                                                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full font-black flex items-center gap-2 ring-1 ring-white/20 backdrop-blur">
                                                    <Info className="w-5 h-5" />
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>

            {/* --- MOBILE SLIDER --- */}
            <div className="block lg:hidden relative w-full pt-6 pb-6 px-4">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={12}
                    slidesPerView={1}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    // 🔥 mobile smooth
                    speed={500}
                    touchRatio={1}
                    resistanceRatio={0.85}
                    className="w-full max-w-7xl mx-auto !pb-10"
                >
                    {featured.map((anime) => (
                        <SwiperSlide key={anime.id}>
                            <div className="relative w-full aspect-[3/4] rounded-[1.7rem] overflow-hidden shadow-2xl shadow-fuchsia-900/10 border border-white/60 dark:border-white/10">
                                <img
                                    src={anime.poster}
                                    alt={anime.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent"></div>

                                <div className="absolute bottom-0 p-4 text-white">
                                    <h2 className="text-lg font-bold line-clamp-2">
                                        {anime.title}
                                    </h2>

                                    <p className="text-xs text-white/70 line-clamp-2 mt-1">
                                        {anime.synopsis}
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 mt-2">
                                <Link href={`/anime/${anime.slug}/episode/1`}
                                    className="flex-1 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white py-2.5 rounded-full text-sm text-center font-black shadow-lg">
                                    Tonton
                                </Link>
                                <Link href={`/anime/${anime.slug}`}
                                    className="flex-1 bg-white/80 dark:bg-white/10 py-2.5 rounded-full text-sm text-center font-bold text-slate-700 dark:text-white">
                                    Detail
                                </Link>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}