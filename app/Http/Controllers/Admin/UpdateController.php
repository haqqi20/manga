<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use ZipArchive;

class UpdateController extends \App\Http\Controllers\Controller
{
    /**
     * Show the updater page.
     */
    public function index()
    {
        $currentVersion = config('hestia.version', '1.0.0');
        $phpVersion = PHP_VERSION;
        $laravelVersion = app()->version();

        // Check changelog history
        $changelog = [];
        $changelogPath = base_path('changelog.json');
        if (File::exists($changelogPath)) {
            $changelog = json_decode(File::get($changelogPath), true) ?: [];
        }

        return Inertia::render('Admin/Updater/Index', [
            'currentVersion' => $currentVersion,
            'phpVersion' => $phpVersion,
            'laravelVersion' => $laravelVersion,
            'changelog' => $changelog,
        ]);
    }

    /**
     * Handle the update package upload and apply.
     */
    public function upload(Request $request)
    {
        set_time_limit(0);
        ini_set('memory_limit', '512M');

        $request->validate([
            'update_file' => 'required|file|mimes:zip|max:102400', // Max 100MB
        ]);

        $file = $request->file('update_file');
        $currentVersion = config('hestia.version', '1.0.0');

        // Store uploaded zip in temp
        $tempDir = storage_path('app/updates');
        if (!File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        $zipPath = $tempDir . '/update_' . time() . '.zip';
        $file->move($tempDir, basename($zipPath));

        // Extract zip
        $extractPath = $tempDir . '/extracted_' . time();
        $zip = new ZipArchive();

        if ($zip->open($zipPath) !== true) {
            File::delete($zipPath);
            return back()->with('error', 'Gagal membuka file ZIP. Pastikan file tidak korup.');
        }

        $zip->extractTo($extractPath);
        $zip->close();

        // Check for update.json manifest
        $manifestPath = $extractPath . '/update.json';
        if (!File::exists($manifestPath)) {
            // Try to find it in a subdirectory (sometimes zip adds an extra folder)
            $dirs = File::directories($extractPath);
            if (count($dirs) === 1) {
                $manifestPath = $dirs[0] . '/update.json';
                if (File::exists($manifestPath)) {
                    $extractPath = $dirs[0];
                }
            }
        }

        if (!File::exists($manifestPath)) {
            File::deleteDirectory($extractPath);
            File::delete($zipPath);
            return back()->with('error', 'File update.json tidak ditemukan dalam paket update. Paket tidak valid.');
        }

        $manifest = json_decode(File::get($manifestPath), true);

        if (!$manifest || empty($manifest['version'])) {
            File::deleteDirectory($extractPath);
            File::delete($zipPath);
            return back()->with('error', 'Format update.json tidak valid. Pastikan terdapat field "version".');
        }

        $newVersion = $manifest['version'];

        // Version comparison
        if (version_compare($newVersion, $currentVersion, '<=')) {
            File::deleteDirectory($extractPath);
            File::delete($zipPath);
            return back()->with('error', "Versi paket update ({$newVersion}) sama atau lebih rendah dari versi saat ini ({$currentVersion}). Update dibatalkan.");
        }

        // Enable maintenance mode
        try {
            Artisan::call('down', ['--secret' => 'hestia-update-' . time()]);
        } catch (\Exception $e) {
            // Continue even if down fails
            Log::warning('Could not enable maintenance mode: ' . $e->getMessage());
        }

        $log = [];
        $errors = [];

        try {
            // Copy files from the 'files' directory in the package
            $filesDir = $extractPath . '/files';
            if (File::exists($filesDir) && File::isDirectory($filesDir)) {
                // AGGRESSIVE: If package has public/build, delete the current public/build to avoid manifest/hash conflicts
                if (File::exists($filesDir . '/public/build')) {
                    $log[] = '🧹 Cleaning old public/build directory...';
                    File::deleteDirectory(public_path('build'));
                }

                $this->copyFilesRecursively($filesDir, base_path(), $log, $errors);
            }

            // Run migrations if specified
            if (!empty($manifest['migrations']) && $manifest['migrations'] === true) {
                try {
                    Artisan::call('migrate', ['--force' => true]);
                    $log[] = '✅ Database migrations executed successfully.';
                } catch (\Exception $e) {
                    $errors[] = '⚠️ Migration error: ' . $e->getMessage();
                }
            }

            // Run additional artisan commands if specified
            if (!empty($manifest['commands']) && is_array($manifest['commands'])) {
                foreach ($manifest['commands'] as $cmd) {
                    try {
                        Artisan::call($cmd);
                        $log[] = "✅ Command '{$cmd}' executed.";
                    } catch (\Exception $e) {
                        $errors[] = "⚠️ Command '{$cmd}' failed: " . $e->getMessage();
                    }
                }
            }

            // Clear all caches
            try {
                Artisan::call('view:clear');
                Artisan::call('config:clear');
                Artisan::call('cache:clear');
                Artisan::call('route:clear');
                Artisan::call('optimize:clear');
                
                // Reset OPCache if available
                if (function_exists('opcache_reset')) {
                    @opcache_reset();
                }
                
                $log[] = '✅ All caches cleared and optimized (including OPCache).';
            } catch (\Exception $e) {
                $errors[] = '⚠️ Cache clear error: ' . $e->getMessage();
            }

            // Update version in config
            $this->updateVersionInConfig($newVersion);
            $backupLog[] = "✅ Version updated to {$newVersion}.";

            // Save changelog
            $changelogEntry = [
                'version' => $newVersion,
                'date' => now()->toDateTimeString(),
                'description' => $manifest['description'] ?? 'Update to version ' . $newVersion,
                'changes' => $manifest['changes'] ?? [],
            ];
            $this->appendChangelog($changelogEntry);

        } catch (\Exception $e) {
            $errors[] = '❌ Critical error: ' . $e->getMessage();
        }

        // Cleanup
        File::deleteDirectory($extractPath);
        File::delete($zipPath);

        // Disable maintenance mode
        try {
            Artisan::call('up');
        } catch (\Exception $e) {
            Log::warning('Could not disable maintenance mode: ' . $e->getMessage());
        }

        if (count($errors) > 0) {
            return back()->with('warning', 'Update ke v' . $newVersion . ' selesai dengan beberapa peringatan.')
                ->with('updateLog', array_merge($log, $errors));
        }

        return back()->with('success', 'Update ke v' . $newVersion . ' berhasil! Semua file telah diperbarui.')
            ->with('updateLog', $log);
    }

    /**
     * Recursively copy files from source to destination.
     */
    private function copyFilesRecursively($source, $destination, &$log, &$errors)
    {
        $items = File::allFiles($source);
        $successCount = 0;

        foreach ($items as $item) {
            $sourcePath = realpath($source);
            $itemPath = realpath($item->getPathname());
            
            // Fix for different OS separators and absolute paths
            $relativePath = str_replace($sourcePath, '', $itemPath);
            $relativePath = ltrim($relativePath, DIRECTORY_SEPARATOR);
            $relativePath = ltrim($relativePath, '/');
            $relativePath = ltrim($relativePath, '\\');
            
            $destPath = $destination . DIRECTORY_SEPARATOR . $relativePath;
            $destDir = dirname($destPath);

            try {
                // Ensure the destination is writable if it exists
                if (File::exists($destPath)) {
                    @chmod($destPath, 0664); 
                }
                
                // Final destination folder must exist
                if (!File::exists($destDir)) {
                    if (!@File::makeDirectory($destDir, 0775, true)) {
                        $errors[] = "❌ Could not create directory: {$relativePath}";
                        continue;
                    }
                }

                if (File::copy($item->getPathname(), $destPath)) {
                    @chmod($destPath, 0664);
                    $successCount++;
                } else {
                    $errors[] = '❌ Failed to copy ' . $relativePath . ' (Permission Denied?)';
                    // If it's a critical path like app/ or resources/, we might want to flag this
                }
            } catch (\Exception $e) {
                $errors[] = '❌ Error copying ' . $relativePath . ': ' . $e->getMessage();
            }
        }
        
        $log[] = "✅ Berhasil memperbarui {$successCount} file.";
    }

    /**
     * Update version number in config/hestia.php
     */
    private function updateVersionInConfig($newVersion)
    {
        $configPath = config_path('hestia.php');

        if (File::exists($configPath)) {
            $content = File::get($configPath);
            $content = preg_replace(
                "/'version'\s*=>\s*'[^']*'/",
                "'version' => '{$newVersion}'",
                $content
            );
            File::put($configPath, $content);
        }
    }

    /**
     * Append an entry to the changelog.json file.
     */
    private function appendChangelog($entry)
    {
        $changelogPath = base_path('changelog.json');
        $changelog = [];

        if (File::exists($changelogPath)) {
            $changelog = json_decode(File::get($changelogPath), true) ?: [];
        }

        // Prepend new entry (newest first)
        array_unshift($changelog, $entry);

        File::put($changelogPath, json_encode($changelog, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
