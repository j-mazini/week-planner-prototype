import NavbarWrapper from "@/components/navbar-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { TodayDateLine } from '@/app/(private)/components';

export default function FinancialPerformancePage() {
  return (
    <NavbarWrapper>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Financial Management</h1>
          <TodayDateLine className="text-xs font-medium text-slate-500" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="w-full border-b flex">
              <div className="h-14 flex items-center px-4">
                <div className="h-14 flex items-center border-b-2 border-primary px-4">
                  <span className="text-foreground text-base font-medium">
                    Performance
                  </span>
                </div>
                <Link
                  href="/financial-invoices"
                  className="text-muted-foreground hover:text-foreground transition-colors text-base font-medium ml-8"
                >
                  Invoices
                </Link>
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-xl font-semibold">Performance Metrics</h2>
              <p className="text-muted-foreground mt-2">
                Financial performance metrics will be displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </NavbarWrapper>
  );
}
