import React, { useEffect, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Image, Music, Save, ArrowLeft } from 'lucide-react';

interface Props {
    item?: any | null;
    mode: 'create' | 'edit';
    museum: any;
}

const defaultValues = {
    nama_ruangan: '',
    slug: '',
    is_main: false,
    panorama_url: '',
    audio_guide_url: ''
};

export default function RuanganFormBase({ item, mode, museum }: Props) {
    const editing = mode === 'edit' && !!item;
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const { data, setData, processing, errors, clearErrors, post, transform } = useForm<{ 
        [K in keyof typeof defaultValues]: (typeof defaultValues)[K] 
    } & { 
        panorama_image?: File | null;
        audio_guide_file?: File | null;
    }>({ 
        ...defaultValues, 
        panorama_image: null,
        audio_guide_file: null
    });

    const [panoramaPreview, setPanoramaPreview] = useState<string | null>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);

    useEffect(() => {
        if (editing) {
            setData({ ...defaultValues, ...item });
            if (item.panorama_url) {
                setPanoramaPreview(item.panorama_url);
            }
            if (item.audio_guide_url) {
                setAudioPreview(item.audio_guide_url);
            }
        }
    }, [editing, item]);

    useEffect(() => {
        if (!editing) {
            setData({ ...defaultValues });
        }
    }, [mode]);

    useEffect(() => {
        if (!slugManuallyEdited && !editing) {
            const s = data.nama_ruangan
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            setData('slug', s);
        }
    }, [data.nama_ruangan, slugManuallyEdited, editing]);

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugManuallyEdited(true);
        setData('slug', e.target.value);
    };

    const handlePanoramaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('panorama_image', file);
            const reader = new FileReader();
            reader.onload = (e) => setPanoramaPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('audio_guide_file', file);
            setAudioPreview(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const url = editing ? route('museum.ruangan.update', [museum.id, item.id]) : route('museum.ruangan.store', museum.id);

        // Transform data for submission (serialize boolean as 1/0)
        transform((form) => ({
            ...form,
            is_main: form.is_main ? '1' : '0',
        }));

        // Use useForm.post to enable `processing` state and auto-handle files
        post(url, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Success!', {
                    description: editing ? 'Ruangan berhasil diupdate' : 'Ruangan berhasil dibuat'
                });
                
            },
            onError: () => {
                toast.error('Error!', {
                    description: 'Terjadi kesalahan saat menyimpan data'
                });
            }
        });
    };

    return (
        <div className="flex h-full w-full flex-col">
            {/* Header Section */}
            <div className="border-b px-6 py-4">
                <div className="flex flex-col gap-4">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.visit(route('museum.ruangan.index', museum.id))}
                        className="gap-2 w-fit"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </Button>
                    <div className="">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {editing ? 'Edit Ruangan' : 'Tambah Ruangan'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Museum: {museum.title}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6">
                <div className="">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Dasar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_ruangan">
                                            Nama Ruangan <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="nama_ruangan"
                                            value={data.nama_ruangan}
                                            onChange={(e) => setData('nama_ruangan', e.target.value)}
                                            placeholder="Masukkan nama ruangan"
                                            required
                                        />
                                        {errors.nama_ruangan && (
                                            <p className="text-sm text-red-600">{errors.nama_ruangan}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">
                                            Slug <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={handleSlugChange}
                                            placeholder="slug-ruangan"
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            URL-friendly identifier untuk ruangan ini
                                        </p>
                                        {errors.slug && (
                                            <p className="text-sm text-red-600">{errors.slug}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_main"
                                        checked={data.is_main}
                                        onCheckedChange={(checked) => setData('is_main', checked as boolean)}
                                    />
                                    <Label htmlFor="is_main" className="text-sm">
                                        Jadikan sebagai ruangan utama
                                    </Label>
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Ruangan utama akan menjadi entry point museum)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Image size={20} />
                                    Panorama 360° (Opsional)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="panorama_image">Upload Panorama</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            id="panorama_image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePanoramaChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('panorama_image')?.click()}
                                            className="gap-2"
                                        >
                                            <Upload size={16} />
                                            Pilih Gambar Panorama
                                        </Button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Format: JPG, PNG, max 4MB
                                        </p>
                                        {panoramaPreview && (
                                            <div className="mt-4">
                                                <img
                                                    src={panoramaPreview}
                                                    alt="Panorama Preview"
                                                    className="max-w-full h-32 object-cover rounded-lg mx-auto border"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {errors.panorama_image && (
                                        <p className="text-sm text-red-600">{errors.panorama_image}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music size={20} />
                                    Audio Guide (Opsional)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="audio_guide_file">Upload Audio Guide</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            id="audio_guide_file"
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleAudioChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('audio_guide_file')?.click()}
                                            className="gap-2"
                                        >
                                            <Upload size={16} />
                                            Pilih File Audio
                                        </Button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Format: MP3, WAV, OGG, max 10MB
                                        </p>
                                        {audioPreview && (
                                            <div className="mt-4">
                                                {data.audio_guide_file ? (
                                                    <p className="text-sm text-green-600 flex items-center justify-center gap-2">
                                                        <Music size={16} />
                                                        {audioPreview}
                                                    </p>
                                                ) : (
                                                    <audio controls className="mx-auto">
                                                        <source src={audioPreview} type="audio/mpeg" />
                                                        Browser Anda tidak mendukung audio player.
                                                    </audio>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.audio_guide_file && (
                                        <p className="text-sm text-red-600">{errors.audio_guide_file}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route('museum.ruangan.index', museum.id))}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 min-w-[120px]"
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : (editing ? 'Update' : 'Simpan')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}