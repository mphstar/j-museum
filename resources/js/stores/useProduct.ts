import { create } from 'zustand';

interface Product {
    open: boolean;
    setOpen: (open: boolean) => void;
    dialog: "create" | "update";
    setDialog: (dialog: "create" | "update") => void;
    currentRow: any;
    setCurrentRow: (currentRow: any) => void;
    loadingSubmit: boolean;
    setLoadingSubmit: (loadingSubmit: boolean) => void;
}

const useProductStore = create<Product>((set) => ({
    open: false,
    setOpen: (open: boolean) => set({ open }),
    dialog: "create",
    setDialog: (dialog: "create" | "update") => set({ dialog }),
    currentRow: null,
    setCurrentRow: (currentRow) => set({ currentRow }),
    loadingSubmit: false,
    setLoadingSubmit: (loadingSubmit: boolean) => set({ loadingSubmit }),
}));

export default useProductStore;