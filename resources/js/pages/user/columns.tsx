import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteConfirmAlert } from '@/components/ui/delete-confirm-alert'; // (unused after refactor, consider removing)
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useProductStore from '@/stores/useProduct';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserType = {
    id: number;
    name: string;
    email: string;
    created_at: string;
};

const onDelete = (id: number) => {
    router.post(
        route('user.delete'),
        {
            id,
        },
        {
            onSuccess: () => {
                toast.success('Deleted!', {
                    description: 'Your user has been deleted.',
                });
            },
            onError: () => {
                toast.error('Error!', {
                    description: 'Something went wrong.',
                });
            },
            onFinish: () => { },
        },
    );
};

export const columns: ColumnDef<UserType>[] = [
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
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button className="gap-0" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Name
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => {
            return <span className="px-2">{cell.getValue<string>()}</span>;
        },
    },
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return (
                <Button className="gap-0" variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => {
            return <span className="px-2">{cell.getValue<string>()}</span>;
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
            const payment = row.original;
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
                            {/* <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>Copy payment ID</DropdownMenuItem>
                        <DropdownMenuSeparator /> */}
                            <DropdownMenuItem
                                onSelect={() => {
                                    // Urutan penting: set data dulu, biarkan dropdown menutup (tanpa preventDefault), lalu buka dialog setelah frame berikut.
                                    store.setCurrentRow(payment);
                                    store.setDialog('update');
                                    // Fokus elemen active diblur agar tidak kena aria-hidden warning
                                    (document.activeElement as HTMLElement | null)?.blur();
                                    // Delay micro (rAF) supaya popper cleanup selesai sebelum overlay dialog masuk
                                    requestAnimationFrame(() => {
                                        // Tambah sedikit timeout jika masih muncul warning (bisa dinaikkan ke 30-50ms jika perlu)
                                        setTimeout(() => {
                                            store.setOpen(true);
                                        }, 0);
                                    });
                                }}
                            >
                                Edit Data
                            </DropdownMenuItem>
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
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteOpen(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        onDelete(payment.id);
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
