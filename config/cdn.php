<?php

return [

    /*
    | URL CDN gambar (Cloudflare Worker + R2), mis. https://cdn.mangaku.lol
    | Kosongkan untuk menonaktifkan penulisan ulang URL gambar.
    */
    'image_url' => rtrim((string) env('CDN_IMAGE_URL', ''), '/'),

    /*
    | Host sumber gambar yang dialihkan lewat CDN. Harus sama dengan
    | ALLOWED_HOSTS di Worker (cloudflare/cdn-worker.js).
    | Pola regex tanpa delimiter, dicocokkan dengan hostname penuh.
    */
    'image_hosts' => [
        '(?:img|img1|img2|thumbnail)\.komiku\.org',
        'komiku\.org',
        '(?:image\d{1,2}|thumbnail)\.komiku\.to',
        's4\.anilist\.co',
        'novel\.kiryuuid\.net',
    ],

    'image_extensions' => 'jpe?g|png|webp|gif|avif',
];
