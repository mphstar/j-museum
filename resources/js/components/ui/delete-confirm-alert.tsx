import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmAlertProps {
    children: React.ReactNode;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

export function DeleteConfirmAlert({
    children,
    onConfirm,
    title = "Are you sure?",
    description = "You won't be able to revert this!",
    confirmText = "Yes, delete it!",
    cancelText = "Cancel",
}: DeleteConfirmAlertProps) {
    const [open, setOpen] = React.useState(false);

    // Jika child adalah ReactElement (misal DropdownMenuItem), kita clone dan inject handler
    let trigger = children;
    if (React.isValidElement(children)) {
        const original: any = children;
        trigger = React.cloneElement(original, {
            onSelect: (e: any) => {
                if (typeof original.props?.onSelect === 'function') {
                    original.props.onSelect(e);
                }
                requestAnimationFrame(() => setOpen(true));
            },
            onClick: (e: any) => {
                if (typeof original.props?.onClick === 'function') {
                    original.props.onClick(e);
                }
                requestAnimationFrame(() => setOpen(true));
            },
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger}
            <AlertDialogContent
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                }}
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                }}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setOpen(false)}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm();
                            setOpen(false);
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}