"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FigmaLayer, LayerOverrides, loadScreen, type Layer, type ScreenData, type Style } from './FigmaScreen';
import '../styles.css';

type Mode = 'operations' | 'rebalance';
const screens = { operations: '198-6865', rebalance: '200-9214' };
const textOf = (node: Layer): string => [node.text ?? '', ...(node.c ?? []).map(textOf)].join(' ').replace(/\s+/g, ' ').trim();
function findNodes(node: Layer, predicate: (n: Layer) => boolean): Layer[] {
  return [...(predicate(node) ? [node] : []), ...(node.c ?? []).flatMap(n => findNodes(n, predicate))];
}
function Original({ node, styles }: { node: Layer; styles: Style[] }) {
  return <FigmaLayer node={node} styles={styles} root skipOverride />;
}

export default function RouteBalance() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('operations');
  const [data, setData] = useState<ScreenData>();
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [shift, setShift] = useState<string>();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [validated, setValidated] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<string>();
  const [modalData, setModalData] = useState<ScreenData>();
  const [toast, setToast] = useState('');
  const [scale, setScale] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [newRoute, setNewRoute] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [added, setAdded] = useState<{name:string;driver:string}[]>([]);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const sync = () => setMode(new URLSearchParams(location.search).get('mode') === 'rebalance' ? 'rebalance' : 'operations');
    sync(); window.addEventListener('popstate', sync);
    try {
      const draft = JSON.parse(localStorage.getItem('route-balance-draft') ?? 'null');
      if (draft && typeof draft === 'object') {
        if (draft.validated && typeof draft.validated === 'object') setValidated(draft.validated);
        if (Array.isArray(draft.added)) setAdded(draft.added.filter((r: {name?: unknown;driver?: unknown}) => typeof r?.name === 'string' && typeof r?.driver === 'string'));
      }
    } catch { /* An unavailable or old browser draft must not prevent opening the screen. */ }
    const resize = () => setScale(Math.min(1, Math.max(window.innerWidth, 1024) / 1281));
    resize(); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('resize', resize); };
  }, []);
  useEffect(() => {
    let active = true; setError('');
    loadScreen(screens[mode]).then(d => { if (active) setData(d); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [mode]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timer); } }, [toast]);
  useEffect(() => {
    if (!modal) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const activeDialog = dialog.current;
    activeDialog?.showModal();
    return () => { activeDialog?.close(); returnFocus.current?.focus(); };
  }, [modal]);
  useEffect(() => {
    setModalData(undefined);
    if (!modal || !/^\d/.test(modal)) return;
    let active = true;
    loadScreen(modal).then(d => { if (active) setModalData(d); }).catch(() => setToast('Unable to load details. Please try again.'));
    return () => { active = false; };
  }, [modal]);

  const changeMode = useCallback((next: Mode) => {
    setMode(next); setExpanded({}); setShift(undefined);
    window.history.pushState({}, '', `/route-balance?mode=${next}`);
  }, []);

  const prepared = useMemo(() => {
    if (!data) return undefined;
    const copy: ScreenData = structuredClone(data);
    const cards = findNodes(copy.root, n => n.n === 'Route Card');
    const first = cards[0];
    // Keep each source card's header, status colors and identity when expanding.
    const sourceNotes = first?.c?.find(n => n.n === 'Notes:margin');
    const columns = [0, 0, 0, 0];
    let largestBottom = 0;
    cards.forEach((card, index) => {
      const style = { ...copy.styles[card.s] };
      card.s = copy.styles.push(style) - 1;
      const naturalExpanded = (style.height ?? 0) > 400;
      const isExpanded = expanded[card.i] ?? naturalExpanded;
      if (mode === 'operations' && isExpanded !== naturalExpanded) {
        if (isExpanded && sourceNotes) {
          card.c = card.c?.map(n => n.n === 'Notes:margin' ? structuredClone(sourceNotes) : n);
          style.height = 490.8;
        } else {
          card.c = card.c?.map(n => {
            if (n.n !== 'Notes:margin') return n;
            const notes = structuredClone(n); notes.c = notes.c?.slice(0, 1); return notes;
          });
          style.height = 238.8;
        }
      }
      if (mode === 'rebalance' && !isExpanded) {
        card.c = card.c?.slice(0, 1); style.height = 180;
      }
      if (query && !textOf(card).toLowerCase().includes(query.toLowerCase())) card.renderHidden = true;
      // Preserve the original masonry order and 16px gutters.
      const col = mode === 'operations' ? [0, 1, 2, 3, 2, 3, 1][index] : index % 4;
      const old = style.relativeTransform ?? [[1, 0, 0], [0, 1, 0]];
      if (Object.keys(expanded).length) style.relativeTransform = [[1, 0, old[0][2]], [0, 1, columns[col]]];
      columns[col] += (style.height ?? 0) + 16;
      largestBottom = Math.max(largestBottom, columns[col] - 16);
    });
    const sourceHeight = mode === 'operations' ? 509 : 1110;
    const delta = Math.max(0, largestBottom - sourceHeight);
    if (delta) {
      for (const node of findNodes(copy.root, n => n === copy.root || n.n === 'Sidebar' || n.n === 'Main Content/home' || n.n === 'Frame 11' || n.n === 'Footer')) {
        const s = { ...copy.styles[node.s] };
        node.s = copy.styles.push(s) - 1;
        if (node.n === 'Footer' && s.relativeTransform) s.relativeTransform = [[1, 0, s.relativeTransform[0][2]], [0, 1, s.relativeTransform[1][2] + delta]];
        else if (s.height) s.height += delta;
      }
    }
    return copy;
  }, [data, mode, expanded, query]);

  const override = useCallback((node: Layer, styles: Style[], css: CSSProperties): ReactNode | undefined => {
    const label = textOf(node);
    const style = styles[node.s];
    const original = <Original node={node} styles={styles} />;
    const button = (action: () => void, name = label, extra?: ReactNode) => <button className="rb-source-button" style={css} aria-label={name} onClick={action}>{extra ?? original}</button>;
    if (node.n === 'Input') {
      const routeSearch = label.startsWith('Search routes');
      return <input className="rb-source-input" style={{...css, padding:'0 12px', fontFamily:'IBM Plex Mono', fontSize:11, paddingLeft:routeSearch ? 36 : 12, border:routeSearch ? '1px solid #6b7280' : '1px solid #bfc8c9', borderRadius:routeSearch ? 2 : 0}} type="search" aria-label={routeSearch ? 'Search routes' : 'Search system'} placeholder={label} value={routeSearch ? query : undefined} onChange={routeSearch ? e => setQuery(e.target.value) : undefined} />;
    }
    if (node.n === 'Option' && node.t !== 'TEXT') {
      if (label === 'Operations' || label === 'Rebalance') return <button className="rb-source-button" style={css} aria-pressed={mode === label.toLowerCase()} onClick={() => changeMode(label.toLowerCase() as Mode)}>{original}</button>;
      if (label === 'AM' || label === 'PM') return <button className="rb-source-button" style={{...css, ...(shift ? {backgroundImage:'none', background: shift === label ? '#334f00' : 'transparent', color:shift === label ? '#fff' : '#424936'} : {})}} aria-pressed={(shift ?? (mode === 'operations' ? 'PM' : 'AM')) === label} onClick={() => setShift(label)}>{shift ? label : original}</button>;
    }
    if (node.n === 'Link' && label === 'Week Planner') return button(() => router.push('/week-planner'));
    if (node.n === 'Link' && label === 'Route Balance') return button(() => changeMode('operations'));
    if (node.n === 'Route Card') {
      if (node.renderHidden) return null;
      const isExpanded = expanded[node.i] ?? ((style.height ?? 0) > 400);
      const toggle = () => setExpanded(prev => ({ ...prev, [node.i]: !isExpanded }));
      return <section style={css} aria-label={`Route ${node.i}`}>
        <LayerOverrides.Provider value={(child, childStyles, childCSS) => {
          if ((child.n === 'Frame 20' || child.n === 'Frame 21') && childStyles[child.s].width === 23) return <button className="rb-source-button" style={childCSS} aria-label={isExpanded ? 'Collapse route' : 'Expand route'} aria-expanded={isExpanded} onClick={toggle}>{isExpanded === (child.n === 'Frame 21') ? <Original node={child} styles={childStyles} /> : <span className="rb-expand">{isExpanded ? '−' : '+'}</span>}</button>;
          if (child.n === 'Button' && textOf(child) === 'VALIDATE') return <button className="rb-source-button" style={childCSS} onClick={() => setValidated(prev => ({...prev,[node.i]:!prev[node.i]}))} aria-pressed={!!validated[node.i]}>{validated[node.i] ? '✓ VALIDATED' : <Original node={child} styles={childStyles} />}</button>;
          if (shift && child.t === 'TEXT' && child.text === 'AM') return <div style={childCSS}>{shift}</div>;
          return override(child, childStyles, childCSS);
        }}>{original}</LayerOverrides.Provider>
        {mode === 'rebalance' && !isExpanded && <button className="rb-card-expand" onClick={toggle}>+ Expand route</button>}
      </section>;
    }
    if (node.n === 'Button') {
      if (label === 'SEE DETAILS') return button(() => setModal('132-8635'));
      if (label === 'SEE ALL STOPS') return button(() => setModal('132-9631'));
      if (label === 'SPECIAL DELIVERIES') return button(() => setModal('320-14396'));
      if (label.includes('Add New Flex')) return button(() => setModal('flex'));
      if (label === 'Importar') return button(() => setModal('import'));
      if (label === 'Colapse Routes') return button(() => {
        const cards = data ? findNodes(data.root,n => n.n === 'Route Card') : [];
        const allCollapsed = cards.every(n => expanded[n.i] === false);
        setExpanded(Object.fromEntries(cards.map(n => [n.i, allCollapsed])));
      });
      if (label === 'Save') return button(() => {
        try { localStorage.setItem('route-balance-draft',JSON.stringify({validated,added})); setToast('Draft saved on this device.'); }
        catch { setToast('Unable to save. Please enable browser storage.'); }
      });
      if (label === 'Send to Drivers') return button(() => setModal('send'));
    }
    return undefined;
  }, [mode, query, shift, expanded, validated, data, changeMode, router, added]);

  const modalNode = modalData?.root.c?.at(-1);
  const modalWidth = modalNode && modalData ? modalData.styles[modalNode.s].width : undefined;
  return <main className="rb-app" aria-label="Route Balance">
    {error ? <p role="alert">{error} <button onClick={() => location.reload()}>Try again</button></p> : !prepared ? <p className="rb-loading" role="status">Loading Route Balance…</p> : <div className="rb-canvas-size" style={{width:1281*scale,height:(prepared.styles[prepared.root.s].height ?? 1006)*scale}}><div className="rb-canvas" style={{transform:`scale(${scale})`}}><LayerOverrides.Provider value={override}><FigmaLayer node={prepared.root} styles={prepared.styles} root /></LayerOverrides.Provider>{query && !findNodes(prepared.root,n => n.n==='Route Card' && !n.renderHidden).length && <p className="rb-empty">No routes match “{query}”. <button onClick={() => setQuery('')}>Clear search</button></p>}</div></div>}
    {added.length > 0 && <section className="rb-added" aria-label="New flex routes">{added.map((r,i) => <article key={i}><strong>{r.name}</strong><p>{r.driver}</p><span>FLEX · {shift ?? 'AM'} · 0 STOPS</span></article>)}</section>}
    {modal && <dialog ref={dialog} className={`rb-dialog ${modalNode ? 'rb-reference-dialog' : ''}`} style={modalWidth ? {width:modalWidth+2} : undefined} onCancel={() => setModal(undefined)} onClick={e => {if(e.target===e.currentTarget)setModal(undefined);}} aria-label={modal === 'flex' ? 'Add new flex route' : modal === 'import' ? 'Import routes' : 'Route details'}>
      <button className="rb-dialog-close" aria-label="Close dialog" onClick={() => setModal(undefined)}>×</button>
      {modalNode && modalData ? <LayerOverrides.Provider value={(n, s, css) => n.n === 'Button' && !textOf(n) ? <button className="rb-source-button" style={css} aria-label="Close details" onClick={() => setModal(undefined)}><Original node={n} styles={s}/></button> : undefined}><FigmaLayer node={modalNode} styles={modalData.styles} root /></LayerOverrides.Provider> : modal === 'flex' ? <form onSubmit={e => {e.preventDefault();setAdded(prev => [...prev,{name:newRoute.trim(),driver:newDriver.trim()}]);setNewRoute('');setNewDriver('');setModal(undefined);setToast('Flex route added to this draft.');}}><h2>ADD NEW FLEX ROUTE</h2><p>Assign a route and driver to your operation.</p><label>ROUTE<input required value={newRoute} onChange={e => setNewRoute(e.target.value)} placeholder="Route name" /></label><label>DRIVER<input required value={newDriver} onChange={e => setNewDriver(e.target.value)} placeholder="Driver name" /></label><div className="rb-form-actions"><button type="button" onClick={() => setModal(undefined)}>Cancel</button><button className="rb-primary" disabled={!newRoute.trim() || !newDriver.trim()}>Add route</button></div></form> : modal === 'import' ? <div><h2>IMPORT ROUTES</h2><p>Select your DISCO spreadsheet.</p><label className="rb-file">Choose file<input type="file" accept=".xlsx,.xls,.xlsm" onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}/></label>{fileName && <p>{fileName}</p>}<p className="rb-note">Spreadsheet processing requires the route import service. This prototype does not upload files.</p></div> : modal === 'send' ? <div><h2>SEND TO DRIVERS</h2><p>This prototype has no driver delivery service connected. Your draft can be reviewed in Rebalance.</p><button className="rb-primary" onClick={() => {setModal(undefined);changeMode('rebalance');}}>Review routes</button></div> : <p role="status">Loading details…</p>}
    </dialog>}
    {toast && <div className="rb-toast" role="status"><span>✓</span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}>×</button></div>}
  </main>;
}
