<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global: security headers on every response
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        // Global: alihkan URL gambar eksternal ke CDN sendiri (aktif jika CDN_IMAGE_URL diisi)
        $middleware->append(\App\Http\Middleware\RewriteImageCdn::class);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\CheckLicense::class,
        ]);

        $middleware->alias([
            'admin'    => \App\Http\Middleware\EnsureIsAdmin::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
            'license'  => \App\Http\Middleware\CheckLicense::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
