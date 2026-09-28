<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class LicenseSetting extends Model
{
    protected $table = 'license_settings';

    protected $fillable = [
        'license_key',
        'domain',
        'product_name',
        'status',
        'activated_at',
        'expires_at',
        'last_verified_at',
        'meta',
    ];

    protected $casts = [
        'activated_at'    => 'datetime',
        'expires_at'      => 'datetime',
        'last_verified_at'=> 'datetime',
        'meta'            => 'array',
    ];

    /**
     * Get the singleton instance (always uses ID=1).
     */
    public static function getInstance(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'license_key' => null,
            'status'      => 'inactive',
        ]);
    }

    /**
     * Check if there is an active license.
     */
    public static function isActive(): bool
    {
        // Advanced anti-null check
        $status = Cache::remember('license_active_state', 600, function () {
            $setting = static::find(1);
            if (!$setting || $setting->status !== 'active' || empty($setting->license_key)) {
                return 'inactive';
            }

            // Check if meta contains the integrity signature
            $meta = $setting->meta;
            if (empty($meta) || !isset($meta['valid']) || $meta['valid'] !== true) {
                return 'inactive';
            }

            // Verify integrity check (anti-manual DB edit)
            if (!isset($meta['integrity_check'])) {
                return 'inactive';
            }

            $expectedHash = hash_hmac('sha256', $setting->license_key . $setting->domain, 'hestia_secret_salt');
            if ($meta['integrity_check'] !== $expectedHash) {
                return 'inactive';
            }

            return 'active';
        });

        return $status === 'active';
    }

    /**
     * Clear the license cache.
     */
    public static function clearCache(): void
    {
        Cache::forget('license_active');
        Cache::forget('license_active_state');
        Cache::forget('license_data');
    }
}
