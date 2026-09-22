import NavbarWrapper from '../components/NavbarWrapper';
import RouteBalance from './components/RouteBalance';
export default function Page() {
  return (
    <NavbarWrapper title="ROUTE BALANCE" active="route-balance">
      <RouteBalance />
    </NavbarWrapper>
  );
}
