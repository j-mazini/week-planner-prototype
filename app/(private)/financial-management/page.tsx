import NavbarWrapper from "@/components/navbar-wrapper";
import { TodayDateLine } from '@/app/(private)/components';

export default function Page() {
    return (
        <NavbarWrapper>
            <div className="flex flex-col gap-1">
                <h1>Financial Management</h1>
                <TodayDateLine className="text-xs font-medium text-slate-500" />
            </div>
        </NavbarWrapper>
    );
}
