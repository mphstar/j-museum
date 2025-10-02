import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import useProductStore from '@/stores/useProduct';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import { columns, RuanganType } from './columns';
import { DataTable } from './data-table';

export default function Ruangan() {
    const store = useProductStore();
    const { data, museum } = usePage().props as unknown as { data: RuanganType[]; museum: any };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Museum', href: '/museum' },
        { title: museum.title, href: `/museum/edit/${museum.id}` },
        { title: 'Ruangan', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ruangan - ${museum.title}`} />
            <div className="flex h-full w-full flex-col">
                {/* Header Section */}
                <div className="bg-white border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-4">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.visit(route('museum.index'))}
                                className="gap-2 w-fit"
                            >
                                <ArrowLeft size={16} />
                                Kembali
                            </Button>
                            <div className="">
                                <h1 className="text-2xl font-bold tracking-tight">Ruangan {museum.title}</h1>
                                <p className="text-sm text-muted-foreground">Kelola ruangan museum dan marker interaktifnya</p>
                            </div>
                        </div>
                        <Button onClick={() => router.visit(route('museum.ruangan.create', museum.id))} className="gap-2">
                            <Plus size={18} />
                            <span>Tambah Ruangan</span>
                        </Button>
                    </div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-6">
                    <DataTable columns={columns} data={data} museum={museum} />
                </div>
            </div>
        </AppLayout>
    );
}