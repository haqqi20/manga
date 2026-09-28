/**
 * Ornamental SVG avatar frame for badged users (VIP / PRO / DEV).
 * Usage: <AvatarFrame tier="vip" />
 * Must be placed inside a `position: relative; overflow: visible` container.
 * Extends 24% beyond the container edges via negative inset.
 */
export default function AvatarFrame({ tier }) {
    const C = {
        /* VIP — rich gold, ruby gems, gold-tinted wings */
        vip: {
            a:'#fff9c4', b:'#FFD700', c:'#a36000', d:'#FFA500', e:'#ffe066',
            gem:'#cc1010', gemHi:'#ff6060', glow:'#FFD700',
            wa:'#FFD700',  wb:'#b8860b', wStroke:'rgba(200,160,0,0.8)',
        },
        /* PRO — sapphire blue, white gems, blue wings */
        premium: {
            a:'#dbeafe', b:'#60a5fa', c:'#1e3a8a', d:'#3b82f6', e:'#bfdbfe',
            gem:'#1d4ed8', gemHi:'#93c5fd', glow:'#60a5fa',
            wa:'#60a5fa',  wb:'#1e40af', wStroke:'rgba(59,130,246,0.8)',
        },
        /* DEV — emerald, ruby gems, emerald wings */
        developer: {
            a:'#d1fae5', b:'#34d399', c:'#065f46', d:'#10b981', e:'#6ee7b7',
            gem:'#cc1010', gemHi:'#ff7070', glow:'#34d399',
            wa:'#34d399',  wb:'#065f46', wStroke:'rgba(16,185,129,0.8)',
        },
    };
    const col = C[tier] || C.developer;
    const id  = `avf-${tier || 'x'}`;
    return (
        <svg viewBox="0 0 240 240" fill="none"
             className="absolute pointer-events-none z-20"
             style={{ inset: '-24%', width: '148%', height: '148%' }}>
            <defs>
                {/* ring gradient: bright-edge → deep-mid → bright-edge */}
                <linearGradient id={`rg-${id}`} x1="5%" y1="0%" x2="95%" y2="100%">
                    <stop offset="0%"   stopColor={col.e} />
                    <stop offset="18%"  stopColor={col.b} />
                    <stop offset="42%"  stopColor={col.c} />
                    <stop offset="68%"  stopColor={col.b} />
                    <stop offset="85%"  stopColor={col.d} />
                    <stop offset="100%" stopColor={col.e} />
                </linearGradient>
                {/* wing gradient — same palette */}
                <linearGradient id={`wg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor={col.e} />
                    <stop offset="45%"  stopColor={col.wb} />
                    <stop offset="100%" stopColor={col.wa} />
                </linearGradient>
                {/* gem gradient */}
                <radialGradient id={`gg-${id}`} cx="32%" cy="28%" r="62%">
                    <stop offset="0%"   stopColor={col.gemHi} />
                    <stop offset="100%" stopColor={col.gem} />
                </radialGradient>
                {/* glow filter for ring */}
                <filter id={`rf-${id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                {/* glow filter for gems */}
                <filter id={`gf-${id}`} x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>

            {/* ── RINGS ── */}
            {/* outermost hairline */}
            <circle cx="120" cy="120" r="105" stroke={col.b} strokeWidth="0.7" opacity="0.25"/>
            {/* soft glow halo */}
            <circle cx="120" cy="120" r="91" stroke={col.glow} strokeWidth="20" opacity="0.20" filter={`url(#rf-${id})`}/>
            {/* main metallic ring */}
            <circle cx="120" cy="120" r="91" stroke={`url(#rg-${id})`} strokeWidth="13"/>
            {/* mid ridge line */}
            <circle cx="120" cy="120" r="91" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5"/>
            {/* inner accent */}
            <circle cx="120" cy="120" r="83" stroke={col.b} strokeWidth="0.7" opacity="0.20"/>
            {/* shimmer sweep */}
            <circle cx="120" cy="120" r="91"
                    stroke="rgba(255,255,255,0.70)" strokeWidth="5.5"
                    strokeLinecap="round" strokeDasharray="70 500"
                    className="avatar-shimmer"/>
            {/* second shimmer offset */}
            <circle cx="120" cy="120" r="91"
                    stroke="rgba(255,255,255,0.25)" strokeWidth="2.5"
                    strokeLinecap="round" strokeDasharray="30 500"
                    style={{ animationDelay:'-1.5s' }}
                    className="avatar-shimmer"/>

            {/* ── TOP CROWN ornament ── */}
            <path d="M 96 31 Q 120 18 144 31 L 140 40 Q 120 28 100 40 Z" fill={col.c} opacity="0.5"/>
            <path d="M 100 37 Q 120 25 140 37" stroke={col.e} strokeWidth="1.2" fill="none" opacity="0.7"/>
            <path d="M 104 34 L 97 26 L 108 29 Z" fill={col.b} opacity="0.8"/>
            <path d="M 136 34 L 143 26 L 132 29 Z" fill={col.b} opacity="0.8"/>
            {/* center gem */}
            <polygon points="120,13 133,27 120,41 107,27" fill={`url(#gg-${id})`} filter={`url(#gf-${id})`}/>
            <polygon points="120,13 133,27 120,27"   fill="rgba(255,255,255,0.45)"/>
            <polygon points="120,13 133,27 120,41 107,27" stroke={col.b} strokeWidth="1.4" fill="none"/>

            {/* ── BOTTOM ORNAMENT ── */}
            <path d="M 96 209 Q 120 222 144 209 L 140 200 Q 120 212 100 200 Z" fill={col.c} opacity="0.5"/>
            <path d="M 100 203 Q 120 215 140 203" stroke={col.e} strokeWidth="1.2" fill="none" opacity="0.7"/>
            <path d="M 104 206 L 97 214 L 108 211 Z" fill={col.b} opacity="0.8"/>
            <path d="M 136 206 L 143 214 L 132 211 Z" fill={col.b} opacity="0.8"/>
            <polygon points="120,227 133,213 120,199 107,213" fill={`url(#gg-${id})`} filter={`url(#gf-${id})`}/>
            <polygon points="120,227 133,213 120,213"         fill="rgba(255,255,255,0.40)"/>
            <polygon points="120,227 133,213 120,199 107,213" stroke={col.b} strokeWidth="1.4" fill="none"/>

            {/* ── LEFT WING ── */}
            <path d="M 31 100 L 11 112 L 24 118 L 5 130 L 23 127 L 17 147 L 33 130 L 27 122 L 38 120 Z"
                  fill={`url(#wg-${id})`} stroke={col.wStroke} strokeWidth="0.9"/>
            <path d="M 31 100 L 14 114 L 25 118" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M 5 130 L 20 128" stroke="rgba(255,255,255,0.40)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M 17 147 L 26 135" stroke="rgba(255,255,255,0.30)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M 26 108 L 16 104 L 21 112 Z" fill={col.wa} opacity="0.65"/>

            {/* ── RIGHT WING (mirror) ── */}
            <path d="M 209 100 L 229 112 L 216 118 L 235 130 L 217 127 L 223 147 L 207 130 L 213 122 L 202 120 Z"
                  fill={`url(#wg-${id})`} stroke={col.wStroke} strokeWidth="0.9"/>
            <path d="M 209 100 L 226 114 L 215 118" stroke="rgba(255,255,255,0.60)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M 235 130 L 220 128" stroke="rgba(255,255,255,0.40)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M 223 147 L 214 135" stroke="rgba(255,255,255,0.30)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <path d="M 214 108 L 224 104 L 219 112 Z" fill={col.wa} opacity="0.65"/>
        </svg>
    );
}
