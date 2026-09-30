import {useEffect, useMemo, useState} from "react";
import {Reorder, useDragControls} from "framer-motion";
import {useAuth} from "@/hooks/useAuth";
import {MOCK_MODE} from "@/lib/mock-api";
import {demoStops, normalizeStops, reconcileStopOrder, moveStop, type OrderedStop} from "../stop-order";
import {useApp} from "../state";
const imgArrowLeft = "/route-balance-mobile/assets/236dcf69-85c7-40a7-b093-4a5a2071a6ec.svg";

function DraggableStop({stop, index, onMove, onDrop}: {stop: OrderedStop; index: number; onMove: (id: string, position: number) => void; onDrop: () => void}) {
  const controls = useDragControls();
  return <Reorder.Item as="li" value={stop} className="stop-order__row" dragListener={false} dragControls={controls}
    whileDrag={{zIndex: 2, boxShadow: '0 6px 16px #1a1c1626'}} onDragEnd={onDrop}>
    <button type="button" className="stop-order__handle" onPointerDown={event => controls.start(event)}
      aria-label={`Move stop ${index + 1}: ${stop.address || 'Address unavailable'}`}
      aria-describedby="stop-drag-help"
      onKeyDown={event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          onMove(stop.id, index + (event.key === 'ArrowUp' ? -1 : 1));
        }
      }}><span aria-hidden="true">⠿</span><span className="stop-order__number">{index + 1}</span></button>
    <div className="stop-order__address"><p>{stop.address || 'Address unavailable'}</p><span>{stop.postcode || '—'}</span></div>
    <p className="stop-order__customer">{stop.customer || '—'}</p>
    <span className="stop-order__flag">{stop.flag || '—'}</span>
  </Reorder.Item>;
}

export default function AllStops() {
  const {navigate, driverName, routes, routeIndex, routeLoading} = useApp();
  const {user} = useAuth();
  const route = routes[routeIndex];
  const demo = MOCK_MODE && !route?.stops.length;
  const source = useMemo(() => demo ? demoStops : normalizeStops(route?.stops ?? []), [demo, route?.stops]);
  const storageKey = JSON.stringify(['driver-stop-order-v1', user?.companyId ?? '', user?.id ?? driverName,
    demo ? 'demo' : 'live', route?.assignment.date ?? 'demo', route?.assignment.raw.routeId ?? route?.assignment.route ?? 'demo', route?.assignment.raw.id ?? '']);
  const [stops, setStops] = useState<OrderedStop[]>([]);
  const [readyKey, setReadyKey] = useState('');
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let saved: unknown;
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { saved = null; }
    setStops(reconcileStopOrder(source, saved));
    setReadyKey(storageKey);
    setDirty(false);
    setMessage('');
  }, [storageKey, source]);

  const ready = !routeLoading && readyKey === storageKey;
  const reorder = (id: string, position: number) => {
    if (position < 0 || position >= stops.length) return;
    setStops(current => moveStop(current, id, position));
    setDirty(true);
    setMessage(`Stop moved to position ${position + 1}. Save your order.`);
  };
  const save = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(stops.map(stop => stop.id)));
      setDirty(false);
      setMessage('Order saved on this device.');
    } catch { setMessage('Could not save on this device. Your order is still available until you leave this screen.'); }
  };
  return (
    <div className="design-4" data-node-id="322:14843" data-name="LogixSphere [Route Balance - mobile]">
      <div className="design-113" data-node-id="322:14852" data-name="main-scroll">
        <button type="button" onClick={() => navigate('overview')} aria-label="Back to route overview" className="design-114" data-node-id="322:14853" data-name="back-header">
          <div className="design-115" data-node-id="322:14854" data-name="back-arrow-container">
            <div className="design-116" data-node-id="322:14855" data-name="arrow-left">
              <img alt="" className="asset" src={imgArrowLeft} />
            </div>
          </div>
          <div className="design-19" data-node-id="322:14857" data-name="header-title">
            <p className="design-117" data-node-id="322:14858">
              ALL STOPS {route?.assignment.route ? `/ ${route.assignment.route}` : ""}
            </p>
          </div>
        </button>
        <section className="stop-order" aria-label="Stop order" aria-busy={!ready}>
          <div className="stop-order__toolbar">
            <div><h2>Organize your stops</h2><p id="stop-drag-help">{demo ? 'Demo stops · ' : ''}Drag the handle to reorder, or focus it and use the arrow keys. Saved on this device.</p></div>
            <button className="stop-order__save" type="button" onClick={save} disabled={!ready || !dirty}>Save order</button>
          </div>
          <p className="stop-order__status" role="status" aria-live="polite">{message || (dirty ? 'Unsaved changes' : '')}</p>
          {!ready ? <p className="stop-order__empty">Loading stops…</p> : stops.length === 0 ?
            <p className="stop-order__empty">No stop addresses are available for this route yet.</p> :
            <Reorder.Group as="ol" axis="y" values={stops} className="stop-order__list" onReorder={next => {
              setStops(next);
              setDirty(true);
              setMessage('Order changed. Save your order.');
            }}>
              {stops.map((stop, index) => <DraggableStop key={stop.id} stop={stop} index={index} onMove={reorder}
                onDrop={() => setMessage('Stop dropped. Save your order to keep these positions.')} />)}
            </Reorder.Group>}
        </section>
      </div>
      <div className="design-109" data-node-id="322:14977" data-name="Footer">
        <div className="design-53" data-node-id="I322:14977;194:3636" data-name="Container">
          <div className="design-110">
            <div className="design-111" data-node-id="I322:14977;194:3637">
              <p className="design-112">© 2026 LOGIXSPHERE OPERATIONAL SYSTEMS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
