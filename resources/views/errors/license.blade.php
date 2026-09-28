@extends('app')
@section('content')
<div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div class="max-w-md w-full text-center">
        <div class="mb-6 text-6xl opacity-20">🛡️</div>
        <h1 class="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">License Inactive</h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {{ $message ?? 'Lisensi tidak valid atau belum diaktifkan. Silakan hubungi administrator.' }}
        </p>
        <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            Hubungi: <a href="https://nanimeindo.com" target="_blank" class="font-bold underline">satulagistudio.com</a>
        </div>
    </div>
</div>
@endsection
