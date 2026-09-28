import { usePage } from '@inertiajs/react';
import { Cat, Flame, Star, Zap, Heart, Tv, Play, Moon, Crown, Eye, Compass, Sparkles, Sword, Shield, Ghost, Skull, Wand2, Rabbit, Bird, Fish, Squirrel, Bug, Rocket, Atom, Sun, Video, Camera, Music, Mic, Gamepad2, Joystick, Book, BookOpen, Coffee, Pizza, Cherry, Hexagon, Diamond, Leaf } from 'lucide-react';

const LOGO_ICON_MAP = { cat: Cat, flame: Flame, star: Star, zap: Zap, heart: Heart, tv: Tv, play: Play, moon: Moon, crown: Crown, eye: Eye, compass: Compass, sparkles: Sparkles, sword: Sword, shield: Shield, ghost: Ghost, skull: Skull, wand2: Wand2, rabbit: Rabbit, bird: Bird, fish: Fish, squirrel: Squirrel, bug: Bug, rocket: Rocket, atom: Atom, sun: Sun, video: Video, camera: Camera, music: Music, mic: Mic, gamepad2: Gamepad2, joystick: Joystick, book: Book, bookopen: BookOpen, coffee: Coffee, pizza: Pizza, cherry: Cherry, hexagon: Hexagon, diamond: Diamond, leaf: Leaf };

export default function ApplicationLogo({ className = '', ...props }) {
    const { props: pageProps } = usePage();
    const siteSettings = pageProps.siteSettings;
    const siteName = siteSettings?.site_name || 'Nanime';
    const logoIconName = siteSettings?.logo_icon || 'cat';
    const logoColor = siteSettings?.logo_color || '#ef4444';
    const LogoIcon = LOGO_ICON_MAP[logoIconName] || Cat;

    let splitIndex = Math.ceil(siteName.length / 2);
    if (siteName.includes(' ')) splitIndex = siteName.indexOf(' ');
    const firstHalf = siteName.slice(0, splitIndex);
    const secondHalf = siteName.slice(splitIndex).trim();

    return (
        <div className="flex items-center gap-2 w-fit" {...props}>
            <LogoIcon className={className || "w-8 h-8"} style={{ color: logoColor }} />
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                {firstHalf}<span style={{ color: logoColor }}>{secondHalf}</span>
            </span>
        </div>
    );
}