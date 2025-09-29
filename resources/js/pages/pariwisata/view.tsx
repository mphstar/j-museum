import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import useProductStore from '@/stores/useProduct';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PariwisataType, columns } from './columns';
import { router } from '@inertiajs/react';
import { DataTable } from './data-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pariwisata',
        href: '/pariwisata',
    },
];

export default function Product() {
    const store = useProductStore();
    const { data } = usePage().props as unknown as { data: PariwisataType[] };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pariwisata" />
            <div className="flex h-full w-full flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Pariwisata</h2>
                        <p className="text-muted-foreground">Here&apos;s a list of your users for this month!</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.visit(route('pariwisata.create'))} className="space-x-1">
                            <span>Create</span> <Plus size={18} />
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={data} />
            </div>
        </AppLayout>
    );
}
