import Link from "next/link";
import NavbarWrapper from "@/components/navbar-wrapper";

const sections = [
  { href: "/daily-financial-insights", title: "Financial insights", description: "Review revenue, costs and daily financial performance." },
  { href: "/financial-invoices", title: "Financial invoices", description: "Review invoices and payment details." },
  { href: "/service-partner-invoices", title: "Partner invoices", description: "Manage service partner billing and deductions." },
  { href: "/invoice-processing-workflow", title: "Invoice processing", description: "Follow invoices through the processing workflow." },
  { href: "/deductions-disbursements-recharges", title: "Deductions and recharges", description: "Review deductions, disbursements and recharges." },
  { href: "/schedule", title: "Payment schedule", description: "Review scheduled payments." },
];

export default function FinancialManagementPage() {
  return (
    <NavbarWrapper>
      <main className="mx-auto w-full min-w-0 max-w-content-wide space-y-6 page-stagger">
        <p className="max-w-2xl text-sm">Choose a financial workspace to review performance, manage invoices or track payments.</p>
        <nav aria-label="Financial workspaces" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map(({ href, title, description }) => (
            <Link key={href} href={href} className="min-w-0 border border-border bg-card p-5 transition-colors hover:bg-accent/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              <p className="m-0 text-sm leading-relaxed">{description}</p>
            </Link>
          ))}
        </nav>
      </main>
    </NavbarWrapper>
  );
}
