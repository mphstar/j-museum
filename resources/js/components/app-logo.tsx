import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {

    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current dark:text-white text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">J-DiMS</span>
            </div>
        </>
    );
}
