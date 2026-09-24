import { PrivateRouteLoading } from '../components/PrivateRouteLoading';

/** Shown while the Assets page segment is loading (instant feedback on sidebar click). */
export default function AssetsLoading() {
  return <PrivateRouteLoading />;
}
