import { useRef, useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Camera, Save, User, AtSign, FileText, Globe, Lock, AlertCircle, CheckCircle } from 'lucide-react';

function InputField({ label, id, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
        </div>
    );
}

export default function EditProfile({ profileUser }) {
    const { auth } = usePage().props;
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [avatarPreview, setAvatarPreview] = useState(
        profileUser.avatar_url
            ? (profileUser.avatar_url.startsWith('http') ? profileUser.avatar_url : `/storage/${profileUser.avatar_url}`)
            : null
    );
    const [coverPreview, setCoverPreview] = useState(
        profileUser.cover_url
            ? (profileUser.cover_url.startsWith('http') ? profileUser.cover_url : `/storage/${profileUser.cover_url}`)
            : null
    );

    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverError, setCoverError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const profileForm = useForm({
        name: profileUser.name || '',
        username: profileUser.username || '',
        bio: profileUser.bio || '',
        profile_public: profileUser.profile_public ?? true,
    });

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarError(null);
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append('avatar', file);
        router.post('/profile/avatar', fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000); },
            onError: (errs) => { setAvatarError(errs.avatar || 'Upload gagal'); },
            onFinish: () => setAvatarUploading(false),
        });
    }

    function handleCoverChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setCoverPreview(URL.createObjectURL(file));
        setCoverError(null);
        setCoverUploading(true);
        const fd = new FormData();
        fd.append('cover', file);
        router.post('/profile/cover', fd, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setUploadSuccess(true); setTimeout(() => setUploadSuccess(false), 3000); },
            onError: (errs) => { setCoverError(errs.cover || 'Upload gagal'); },
            onFinish: () => setCoverUploading(false),
        });
    }

    function submitProfile(e) {
        e.preventDefault();
        profileForm.post('/profile/update', { preserveScroll: true });
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&background=ef4444&color=fff&size=128`;

    return (
        <AppLayout>
            <Head title="Edit Profil" />

            {/* Cover Banner */}
            <div className="relative w-full h-48 md:h-56 bg-gradient-to-br from-primary via-indigo-700 to-slate-900 overflow-hidden cursor-pointer group"
                style={coverPreview ? { backgroundImage: `url(${coverPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                onClick={() => coverInputRef.current?.click()}
            >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition flex items-center justify-center">
                    <div className="text-white text-center opacity-0 group-hover:opacity-100 transition">
                        <Camera className="w-8 h-8 mx-auto mb-1" />
                        <p className="text-sm font-semibold">Ubah Cover</p>
                        <p className="text-xs opacity-75">Maks. 4MB</p>
                    </div>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                {coverUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-14 relative z-10 pb-16 pt-0">
                {/* Avatar */}
                <div className="flex items-end gap-4 mb-6">
                    <div className="relative cursor-pointer group" onClick={() => avatarInputRef.current?.click()}>
                        <img
                            src={avatarPreview || defaultAvatar}
                            alt={profileUser.name}
                            className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        {avatarUploading && (
                            <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="pb-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Foto Profil</p>
                        <p className="text-xs text-slate-500">Klik foto untuk mengubah. Maks. 2MB</p>
                        {avatarError && <p className="text-xs text-red-500 mt-0.5">{avatarError}</p>}
                        {coverError && <p className="text-xs text-red-500 mt-0.5">{coverError}</p>}
                        {uploadSuccess && (
                            <p className="text-xs text-green-500 flex items-center gap-1 mt-0.5"><CheckCircle className="w-3 h-3" /> Tersimpan</p>
                        )}
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-5">Informasi Profil</h2>

                    {profileForm.recentlySuccessful && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                            <CheckCircle className="w-4 h-4" /> Profil berhasil disimpan!
                        </div>
                    )}

                    <form onSubmit={submitProfile} className="space-y-5">
                        <InputField label="Nama Tampilan" id="name" error={profileForm.errors.name}>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    maxLength={100}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                    placeholder="Nama kamu"
                                />
                            </div>
                        </InputField>

                        <InputField label="Username" id="username" error={profileForm.errors.username}>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="username"
                                    type="text"
                                    value={profileForm.data.username}
                                    onChange={e => profileForm.setData('username', e.target.value.toLowerCase())}
                                    maxLength={30}
                                    pattern="[a-z0-9_]+"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                                    placeholder="username_kamu"
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-400">Hanya huruf kecil, angka, dan underscore. Akan tampil di URL: <span className="font-mono text-primary">/u/{profileForm.data.username || 'username'}</span></p>
                        </InputField>

                        <InputField label="Bio" id="bio" error={profileForm.errors.bio}>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    id="bio"
                                    value={profileForm.data.bio}
                                    onChange={e => profileForm.setData('bio', e.target.value)}
                                    maxLength={500}
                                    rows={3}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition resize-none"
                                    placeholder="Ceritakan sedikit tentang dirimu..."
                                />
                            </div>
                            <p className="mt-1 text-xs text-right text-slate-400">{profileForm.data.bio.length}/500</p>
                        </InputField>

                        {/* Visibility Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                            <div className="flex items-center gap-3">
                                {profileForm.data.profile_public
                                    ? <Globe className="w-4 h-4 text-green-500" />
                                    : <Lock className="w-4 h-4 text-slate-400" />
                                }
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Profil Publik</p>
                                    <p className="text-xs text-slate-400">{profileForm.data.profile_public ? 'Semua orang bisa melihat profilmu' : 'Hanya kamu yang bisa melihat profilmu'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => profileForm.setData('profile_public', !profileForm.data.profile_public)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${profileForm.data.profile_public ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${profileForm.data.profile_public ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={profileForm.processing}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition shadow-md shadow-primary/20"
                        >
                            <Save className="w-4 h-4" />
                            {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
