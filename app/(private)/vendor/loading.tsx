import { PrivateRouteLoading } from '../components/PrivateRouteLoading';

/** Shown while the Vendor page segment is loading (instant feedback on sidebar click). */
export default function VendorLoading() {
  return <PrivateRouteLoading />;
}
