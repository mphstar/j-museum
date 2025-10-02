import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen, BookText, Users, Image, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalUsers: number;
    totalMuseum: number;
    totalOverlays: number;
    recentMuseum: Array<{
        id: number;
        title: string;
        slug: string;
        created_at: string;
    }>;
}

interface DashboardSetting {
    style: 'column' | 'row';
}

interface Props {
    stats: DashboardStats;
    setting: DashboardSetting;
}

export default function Dashboard({ stats, setting }: Props) {
    const { data, setData, post, processing } = useForm({
        style: setting.style,
    });

    const updateSettings = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('settings.update'), {
            onSuccess: () => {
                toast.success('Pengaturan berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui pengaturan');
            },
        });
    };

    const statsCards = [
        {
            title: 'Total Pengguna',
            value: stats.totalUsers,
            description: 'Pengguna terdaftar dalam sistem',
            icon: Users,
        },
        {
            title: 'Total Museum',
            value: stats.totalMuseum,
            description: 'Destinasi museum yang dibuat',
            icon: Image,
        },
        {
            title: 'Total Overlay',
            value: stats.totalOverlays,
            description: 'Gambar overlay yang diunggah',
            icon: BookText,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Selamat datang kembali! Berikut yang terjadi dengan platform Museum Anda.</p>
                </div>

                {/* Settings Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Pengaturan Dashboard
                        </CardTitle>
                        <CardDescription>Sesuaikan tata letak dan tampilan dashboard Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={updateSettings} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="style">Gaya Tata Letak</Label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Select value={data.style} onValueChange={(value) => setData('style', value as 'column' | 'row')}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih gaya tata letak" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="column">Tata Letak Kolom</SelectItem>
                                                <SelectItem value="row">Tata Letak Baris</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Perbarui'}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Pilih bagaimana kartu dashboard disusun
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className={cn(
                    "grid gap-4",
                    setting.style === 'row' ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                    {statsCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <Card key={index} className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">{card.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Museum Terbaru</CardTitle>
                        <CardDescription>Destinasi Museum yang baru dibuat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentMuseum.length > 0 ? (
                                stats.recentMuseum.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                         onClick={() => router.visit(route('Museum.edit', item.id))}>
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Image className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.title}</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.slug}</p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Image className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                    <p className="mt-2 text-sm text-muted-foreground">Belum ada destinasi yang dibuat</p>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="mt-3"
                                        onClick={() => router.visit(route('museum.create'))}
                                    >
                                        Buat Museum Pertama
                                    </Button>
                                </div>
                            )}
                        </div>
                        {stats.recentMuseum.length > 0 && (
                            <div className="pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => router.visit(route('museum.index'))}
                                >
                                    Lihat Semua Destinasi
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Aksi Cepat</CardTitle>
                        <CardDescription>Tugas umum dan pintasan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "grid gap-3",
                            setting.style === 'row' ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        )}>
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.visit(route('museum.create'))}
                            >
                                <Image className="h-8 w-8" />
                                <span className="text-sm">Museum Baru</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.visit(route('museum.index'))}
                            >
                                <BookOpen className="h-8 w-8" />
                                <span className="text-sm">Kelola Museum</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-auto p-4 flex flex-col items-center gap-2"
                                onClick={() => router.visit(route('user.index'))}
                            >
                                <Users className="h-8 w-8" />
                                <span className="text-sm">Kelola Pengguna</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
