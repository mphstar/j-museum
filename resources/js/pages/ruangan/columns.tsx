import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useProductStore from '@/stores/useProduct';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// This type is used to define the shape of our data.
export type RuanganType = {
    id: number;
    museum_id: number;
    nama_ruangan: string;
    slug: string;
    is_main: boolean;
    panorama_url: string;
    audio_guide_url: string;
    created_at: string;
};

const onDelete = (id: number, museumId: number) => {
    router.post(
        route('museum.ruangan.destroy', [museumId, id]),
        {},
        {
            onSuccess: () => {
                toast.success('Deleted!', {
                    description: 'Ruangan telah dihapus.',
                });
            },
            onError: () => {
                toast.error('Error!', {
                    description: 'Gagal menghapus data.',
                });
            },
        },
    );
};

export const columns: ColumnDef<RuanganType>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'rowNumber',
        header: '#',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'nama_ruangan',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
                    Nama Ruangan
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'slug',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
                    Slug
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'is_main',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="flex items-center gap-2">
                    Main Room
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => {
            const isMain = cell.getValue<boolean>();
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isMain 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {isMain ? 'Main' : 'Regular'}
                </span>
            );
        },
    },
    {
        accessorKey: 'panorama_url',
        header: 'Panorama',
        cell: ({ cell }) => {
            const url = cell.getValue<string>();
            return url ? (
                <span className="text-green-600 text-sm">✓ Available</span>
            ) : (
                <span className="text-red-600 text-sm">✗ Not set</span>
            );
        },
    },
    {
        accessorKey: 'audio_guide_url',
        header: 'Audio Guide',
        cell: ({ cell }) => {
            const url = cell.getValue<string>();
            return url ? (
                <span className="text-green-600 text-sm">✓ Available</span>
            ) : (
                <span className="text-red-600 text-sm">✗ Not set</span>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ cell }) => {
            const date = new Date(cell.getValue<string>());
            return <span>{date.toLocaleDateString('id-ID')}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const ruangan = row.original;
            const store = useProductStore();
            const [deleteOpen, setDeleteOpen] = React.useState(false);

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onSelect={() => {
                                    router.visit(route('museum.ruangan.edit', [ruangan.museum_id, ruangan.id]));
                                }}
                            >Edit Data</DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    router.visit(route('museum.ruangan.markers.manage', [ruangan.museum_id, ruangan.id]));
                                }}
                            >Kelola Marker</DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    // Tutup dialog edit jika masih terbuka agar tidak ada dua overlay menumpuk
                                    if (store.open) {
                                        store.setOpen(false);
                                    }
                                    // Buka dialog delete setelah dropdown menutup
                                    requestAnimationFrame(() => setDeleteOpen(true));
                                }}
                            >
                                Hapus Data
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogContent
                            onOpenAutoFocus={(e) => { e.preventDefault(); }}
                            onCloseAutoFocus={(e) => { e.preventDefault(); }}
                        >
                            <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Tindakan ini tidak dapat dibatalkan dan akan menghapus ruangan beserta semua marker dan file terkait.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        onDelete(ruangan.id, ruangan.museum_id);
                                        setDeleteOpen(false);
                                    }}
                                >Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },
];