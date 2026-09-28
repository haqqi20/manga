import { useState, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Upload, Check, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '@/Components/Admin/UI';

export default function AdminProfileModal({ open, onClose, user }) {
    const defaultAvatarUrl = user?.avatar_url && user.avatar_url.startsWith('http')
        ? user.avatar_url
        : (user?.avatar_url ? `/storage/${user.avatar_url}` : null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: user?.name || '',
        password: '',
        password_confirmation: '',
        avatar: null,
    });

    const [preview, setPreview] = useState(defaultAvatarUrl);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setPreview(defaultAvatarUrl);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Since we are uploading a file and Inertia uses PUT for update normally,
        // it's easier to use POST with _method = 'PUT' for file uploads,
        // however we defined a POST route in web.php, so just use POST.
        post(route('admin.profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
                        <User size={18} className="text-blue-500" />
                        Pengaturan Profil
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-4">
                    <form id="admin-profile-form" onSubmit={handleSubmit} className="space-y-5">

                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative ${user?.badge === 'vip' ? 'outline outline-2 outline-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : user?.badge === 'premium' ? 'outline outline-2 outline-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : user?.badge === 'developer' ? 'outline outline-2 outline-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : ''}`}>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#ff2e2e] to-[#ff6b2e] flex items-center justify-center text-white font-bold text-3xl">
                                            {user?.name?.[0]?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                    {/* Badge Sheen Overlay */}
                                    {(user?.badge === 'vip' || user?.badge === 'premium' || user?.badge === 'developer') && (
                                        <div className="absolute inset-0 w-full h-full pointer-events-none animate-vip-sheen mix-blend-overlay" style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)', backgroundSize: '200% 100%' }}></div>
                                    )}
                                </div>
                                {user?.badge === 'vip' && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-bold border-2 border-white shadow-sm pointer-events-none z-10 uppercase tracking-widest">VIP</span>
                                )}
                                {user?.badge === 'premium' && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold border-2 border-white shadow-sm pointer-events-none z-10 uppercase tracking-widest">PRO</span>
                                )}
                                {user?.badge === 'developer' && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold border-2 border-white shadow-sm pointer-events-none z-10 uppercase tracking-widest">DEV</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition-colors"
                                >
                                    <Upload size={14} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nama</label>
                            <Input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full"
                                placeholder="Nama Admin"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

                        {/* Password */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock size={16} className="text-slate-400" />
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Ubah Password</h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 -mt-2 mb-4">Kosongkan jika tidak ingin mengubah password.</p>

                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password Baru</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Konfirmasi Password</label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    className="w-full"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                    </form>
                </div>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-2xl">
                    <Button variant="secondary" onClick={handleClose}>
                        Batal
                    </Button>
                    <Button type="submit" form="admin-profile-form" disabled={processing} className="min-w-[120px]">
                        {processing ? 'Menyimpan...' : (
                            <>
                                <Check size={16} className="mr-1.5" /> Simpan
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
