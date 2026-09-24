import { PrivateRouteLoading } from './components/PrivateRouteLoading';

/**
 * Shown immediately when navigating to any (private) route.
 * Gives instant feedback so the user does not think the app is frozen.
 * The actual page then loads and shows its own loading states in tables/content.
 */
export default function PrivateRouteLoadingPage() {
  return <PrivateRouteLoading />;
}
