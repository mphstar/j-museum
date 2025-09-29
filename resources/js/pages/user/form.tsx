import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import useProductStore from '@/stores/useProduct';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const FormDialog = () => {
    const context = useProductStore();

    const { data, setData, post, processing, errors, reset } = useForm({
        id: context.currentRow?.id ?? 0,
        name: context.currentRow?.name ?? '',
        email: context.currentRow?.email ?? '',
        password: '',
    });

    useEffect(() => {
        if (context.currentRow && context.dialog == 'update') {
            setData('id', context.currentRow.id);
            setData('name', context.currentRow.name);
            setData('email', context.currentRow.email);
        }
    }, [context.currentRow]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (context.dialog == 'create') {
            
            post(route('user.store'), {
                onSuccess: () => {
                    reset();
                    context.setOpen(false);

                    toast({
                        title: 'Success',
                        description: 'User created successfully',
                    });
                },
                onError: (errors) => {
                    toast({
                        title: 'Error',
                        description: 'Cek kembali data yang anda masukkan',
                    });
                },
            });
        } else {
            post(route('user.update'), {
                onSuccess: () => {
                    reset();
                    context.setOpen(false);

                    toast({
                        title: 'Success',
                        description: 'User updated successfully',
                    });
                },
                onError: (errors) => {
                    toast({
                        title: 'Error',
                        description: 'Cek kembali data yang anda masukkan',
                    });
                },
            });
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    return (
        <Dialog
            open={context.open}
            onOpenChange={(state) => {
                reset();
                context.setOpen(state);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-left">
                    <DialogTitle>{`${context.dialog == 'create' ? 'Add' : 'Update'} New User`}</DialogTitle>
                    <DialogDescription>
                        {`${context.dialog == 'create' ? 'Create new' : 'Update'} User here. `}
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="-mr-4 h-[26.25rem] w-full py-1 pr-4">
                    <form id="user-form" onSubmit={onSubmit} className="space-y-4 p-0.5">
                        <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                            <Label className="col-span-2 text-right">Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) => {
                                    setData('name', e.target.value);
                                }}
                                placeholder="Masukkan nama"
                                className="col-span-4"
                                autoComplete="off"
                            />
                            <InputError message={errors.name} className="col-span-4 col-start-3 mt-2" />
                        </div>

                        <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                            <Label className="col-span-2 text-right">Email</Label>
                            <Input
                                value={data.email}
                                onChange={(e) => {
                                    setData('email', e.target.value);
                                }}
                                placeholder="Masukkan email"
                                className="col-span-4"
                                autoComplete="off"
                            />
                            <InputError message={errors.email} className="col-span-4 col-start-3 mt-2" />
                        </div>
                        
                        {context.dialog == 'create' && (
                            <div className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
                                <Label className="col-span-2 text-right">Password</Label>
                                <div className="relative col-span-4">
                                    <Input
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="off"
                                        className="pr-10" // biar gak ketutupan icon
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <InputError message={errors.password} className="col-span-4 col-start-3 mt-2" />
                            </div>
                        )}
                    </form>
                </ScrollArea>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => context.setOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button type="submit" form="user-form" disabled={processing}>
                        {processing ? 'Loading...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FormDialog;
