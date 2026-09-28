import AvatarFrame from './AvatarFrame';

export const BADGE_CONFIG = {
    vip:       { label:'VIP', grad:'from-amber-400 to-yellow-500', bg:'bg-gradient-to-r from-amber-400 to-yellow-500' },
    premium:   { label:'PRO', grad:'from-blue-500 to-indigo-600',  bg:'bg-gradient-to-r from-blue-500 to-indigo-600'  },
    developer: { label:'DEV', grad:'from-emerald-500 to-teal-500', bg:'bg-gradient-to-r from-emerald-500 to-teal-500' },
};

/**
 * Reusable user avatar with ornamental badge frame.
 *
 * Props:
 *   user       – object with .badge, .avatar_url, .name
 *   sizeClass  – Tailwind size string, e.g. "w-10 h-10" (default)
 *   showBadge  – show the badge label pill (default true)
 *   className  – extra classes on the wrapper
 */
export default function UserAvatar({ user, sizeClass = 'w-10 h-10', showBadge = true, className = '' }) {
    const badge    = user?.badge;
    const badgeCfg = BADGE_CONFIG[badge];
    const avatarSrc = !user?.avatar_url
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '?')}&background=random`
        : user.avatar_url.startsWith('http')
            ? user.avatar_url
            : `/storage/${user.avatar_url}`;

    return (
        <div className={`relative shrink-0 ${sizeClass} ${className}`} style={{ overflow: 'visible' }}>
            {/* aura glow (badged only) */}
            {badgeCfg && (
                <div className={`absolute inset-0 rounded-full blur-xl opacity-35 scale-[1.5] -z-10 bg-gradient-to-br ${badgeCfg.grad}`} />
            )}
            {/* avatar photo */}
            <div className="relative w-full h-full rounded-full overflow-hidden">
                <img
                    src={avatarSrc}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover block"
                />
            </div>
            {/* ornamental SVG frame */}
            {badgeCfg && <AvatarFrame tier={badge} />}
            {/* badge label pill */}
            {showBadge && badgeCfg && (
                <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-black uppercase tracking-[0.15em] text-white px-2 py-0.5 rounded-full shadow z-30 ${badgeCfg.bg}`}>
                    {badgeCfg.label}
                </span>
            )}
        </div>
    );
}
