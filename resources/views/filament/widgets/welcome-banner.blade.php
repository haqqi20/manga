<x-filament-widgets::widget>
    <div style="position:relative; background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        {{-- Gradient accent bar at top --}}
        <div style="height:4px; background:linear-gradient(90deg, #6366f1,#8b5cf6,#a855f7); border-radius:16px 16px 0 0;"></div>

        <div style="padding:20px 24px 24px 24px; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
            <div>
                <p style="color:#6366f1; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin:0;">
                    {{ $date }}
                </p>
                <h2 style="color:#1e1b4b; font-size:1.5rem; font-weight:800; letter-spacing:-0.02em; margin:6px 0 0 0; line-height:1.3;">
                    Welcome back, {{ $userName }} 👋
                </h2>
                <p style="color:#6b7280; font-size:0.875rem; font-weight:400; margin:4px 0 0 0;">
                    Here's what's happening with your anime library today.
                </p>

                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;">
                    <span style="display:inline-flex; align-items:center; gap:6px; background:#eef2ff; color:#4338ca; font-size:12px; font-weight:600; padding:6px 12px; border-radius:10px;">
                        🎬 {{ $animeToday }} anime added today
                    </span>
                    <span style="display:inline-flex; align-items:center; gap:6px; background:#eef2ff; color:#4338ca; font-size:12px; font-weight:600; padding:6px 12px; border-radius:10px;">
                        ▶️ {{ $episodesToday }} episodes added today
                    </span>
                </div>
            </div>

            <div style="flex-shrink:0;">
                <a href="/admin/animes/create"
                   style="display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-weight:700; font-size:14px; padding:10px 20px; border-radius:12px; text-decoration:none; box-shadow:0 4px 12px rgba(99,102,241,0.3); transition:all 0.2s;"
                   onmouseover="this.style.opacity='0.9'"
                   onmouseout="this.style.opacity='1'">
                    + Add Anime
                </a>
            </div>
        </div>
    </div>
</x-filament-widgets::widget>
