import { ChevronRight } from "lucide-react";

interface InvoiceMobileCardProps {
  invoice: {
    invoiceId: number;
    invoiceNumber: string;
    id: string;
    courier: string;
    invoiceCreatedOn: string;
    referenceDate: string;
    totalPayment: string;
  };
  onViewInvoice: (invoiceId: number) => void;
}

export default function InvoiceMobileCard({
  invoice,
  onViewInvoice,
}: InvoiceMobileCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: string) => {
    if (!amount || isNaN(parseFloat(amount))) {
      return "0.00";
    }
    return new Intl.NumberFormat("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const status =
    invoice.invoiceNumber === "PENDING" ? (
      <span className="text-red-500 text-xs font-medium">PENDING</span>
    ) : (
      <span className="text-sm">#{invoice.invoiceNumber}</span>
    );

  return (
    <div
      className="flex items-center justify-between p-4 bg-white border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
      onClick={() => onViewInvoice(invoice.invoiceId)}
    >
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="text-sm font-medium">
          {formatDate(invoice.referenceDate)}
        </div>
        <div className="text-center">{status}</div>
        <div className="text-right font-semibold">
          £{formatCurrency(invoice.totalPayment)}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
    </div>
  );
}
