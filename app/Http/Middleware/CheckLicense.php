<?php

namespace App\Http\Middleware;

use App\Models\LicenseSetting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLicense
{
    /**
     * Routes yang TIDAK perlu lisensi (admin, auth, api internal, dll).
     */
    private array $bypass = [
        'filament',
        'admin',
        'login',
        'register',
        'password',
        'auth',
        'up',
        'storage',
        'api/license-verify',
        '_ignition',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Bypass untuk route khusus
        foreach ($this->bypass as $path) {
            if ($request->is($path) || $request->is($path . '/*')) {
                return $next($request);
            }
        }

        // Cek lisensi aktif
        if (!LicenseSetting::isActive()) {
            // Jika request Inertia, kembalikan Inertia error page
            if ($request->header('X-Inertia')) {
                return response()->json([
                    'component' => 'Errors/License',
                    'props'     => ['status' => 403],
                    'url'       => $request->url(),
                    'version'   => null,
                ], 200)->withHeaders([
                    'X-Inertia' => 'true',
                ]);
            }

            // Regular request - return view / abort
            return response()->view('errors.license', [
                'message' => 'Lisensi tidak valid atau belum diaktifkan. Silakan hubungi administrator.',
            ], 403);
        }

        return $next($request);
    }
}
