import { PrivateRouteLoading } from '../components/PrivateRouteLoading';

/** Shown while the Contract Management page segment is loading (instant feedback on sidebar click). */
export default function ContractManagementLoading() {
  return <PrivateRouteLoading />;
}
