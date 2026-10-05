import NavbarWrapper from '../components/NavbarWrapper';
import InvoiceManagement from '@/src/features/invoice-management/InvoiceManagement';

export default function Page() {
  return (
    <NavbarWrapper title="INVOICE MANAGEMENT">
      <InvoiceManagement />
    </NavbarWrapper>
  );
}
