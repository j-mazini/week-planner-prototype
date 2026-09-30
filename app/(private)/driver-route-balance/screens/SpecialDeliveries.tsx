import {MOCK_MODE} from "@/lib/mock-api";
import {demoStops, normalizeStops} from "../stop-order";
import {useApp} from "../state";
const imgArrowLeft = "/route-balance-mobile/assets/295eebc1-5b33-4cb1-959a-764c19770e19.svg";

export default function SpecialDeliveries() {
  const {navigate, routes, routeIndex, routeLoading} = useApp();
  const route = routes[routeIndex];
  const demo = MOCK_MODE && !route?.stops.length;
  const stops = (demo ? demoStops : normalizeStops(route?.stops ?? [])).filter(stop => stop.special);
  return (
    <div className="design-4" data-node-id="322:14709" data-name="LogixSphere [Route Balance - mobile]">
      <div className="design-113" data-node-id="322:14718" data-name="main-scroll">
        <button type="button" onClick={() => navigate('overview')} aria-label="Back to route overview" className="design-114" data-node-id="322:14719" data-name="back-header">
          <div className="design-115" data-node-id="322:14720" data-name="back-arrow-container">
            <div className="design-116" data-node-id="322:14721" data-name="arrow-left">
              <img alt="" className="asset" src={imgArrowLeft} />
            </div>
          </div>
          <div className="design-19" data-node-id="322:14723" data-name="header-title">
            <p className="design-117" data-node-id="322:14724">
              SPECIAL DELIVERIES
            </p>
          </div>
        </button>
        <div className="design-118 special-deliveries" data-name="deliveries-container" aria-busy={routeLoading}>
          {demo && <p className="special-deliveries__note">Demo deliveries</p>}
          <div className="design-119 special-deliveries__row" data-name="table-header-label">
            <p>ADDRESS / POSTCODE</p><p>CUSTOMER</p><p>CATEGORY</p>
          </div>
          {routeLoading ? <p className="special-deliveries__note">Loading deliveries…</p> : stops.length === 0 ?
            <p className="special-deliveries__note">No special deliveries are available for this route.</p> : stops.map(stop =>
            <div className="design-121 special-deliveries__row" key={stop.id} data-name="delivery-row">
              <div className="special-deliveries__address"><p className="design-122">{stop.address || 'Address unavailable'}</p><p className="special-deliveries__postcode">{stop.postcode || '—'}</p></div>
              <p className="design-123">{stop.customer || '—'}</p>
              <div className="design-124"><div className={stop.flag.toUpperCase() === 'ASR' ? 'design-127' : stop.flag.toUpperCase() === 'BSR' ? 'design-129' : 'design-125'} data-name="category-badge"><p className="design-126">{stop.flag || 'Special'}</p></div></div>
            </div>)}
        </div>
      </div>
      <div className="design-109" data-node-id="322:14842" data-name="Footer">
        <div className="design-53" data-node-id="I322:14842;194:3636" data-name="Container">
          <div className="design-110">
            <div className="design-111" data-node-id="I322:14842;194:3637">
              <p className="design-112">© 2026 LOGIXSPHERE OPERATIONAL SYSTEMS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
