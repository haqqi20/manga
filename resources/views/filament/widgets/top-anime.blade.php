<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">
            <span class="flex items-center gap-2 text-base font-bold">
                🏆 Top Anime
            </span>
        </x-slot>

        <div class="space-y-3">
            @forelse($topAnime as $index => $anime)
                <div class="flex items-center justify-between gap-3 py-2 {{ !$loop->last ? 'border-b border-gray-100 dark:border-gray-700' : '' }}">
                    <div class="flex items-center gap-3 min-w-0">
                        @php
                            $colors = ['bg-amber-500', 'bg-gray-400', 'bg-amber-700', 'bg-indigo-400', 'bg-indigo-300'];
                            $bgColor = $colors[$index] ?? 'bg-gray-300';
                        @endphp
                        <span class="flex items-center justify-center w-7 h-7 rounded-full {{ $bgColor }} text-white text-xs font-bold shrink-0">
                            {{ $index + 1 }}
                        </span>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {{ $anime->title }}
                        </span>
                    </div>
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0 tabular-nums">
                        {{ $anime->rating }}
                    </span>
                </div>
            @empty
                <p class="text-sm text-gray-500 py-4 text-center">No rated anime yet.</p>
            @endforelse
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
