import { Logo } from './atoms/Logo';

export default function AppLogo() {
    return (
        <>
            <Logo />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">J-DiMS</span>
            </div>
        </>
    );
}
