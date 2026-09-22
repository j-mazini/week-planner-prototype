"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { FigmaLayer, LayerOverrides, loadScreen, type Layer, type ScreenData, type Style } from './FigmaScreen';
import '../styles.css';

type Mode = 'operations' | 'rebalance';
const screens = { operations: '198-6865', rebalance: '200-9214' };
const CARD_WIDTH = 253;
const CARD_GUTTER = 16;
const CARD_STEP = CARD_WIDTH + CARD_GUTTER;
const CONTENT_WIDTH = 1057;
// Once the grid can't usefully add another column (no cards left to put in
// it), leftover width grows the existing cards/tiles instead of sitting
// unused as margin — capped so they stay proportionate on very wide monitors.
const MAX_BLOCK_SCALE = 1.5;
// Natural width of the "Main Content/home" frame — the screen minus the
// Figma-drawn sidebar/app-bar, which are no longer rendered (the real
// NavbarWrapper shell replaces them, same as the Week Planner page).
const DESIGN_WIDTH = 1105;
// Width of NavbarWrapper's real, fixed sidebar (`.app-sidebar { width: 58px }`),
// subtracted from the viewport before sizing this page's own content.
const REAL_SIDEBAR_WIDTH = 58;
// Frames whose fill/stroke/clip must span the full row on wide screens; guarded by
// width so name collisions with small nested frames of the same auto-generated name
// (e.g. a card's own internal "Frame 11") never get resized.
const GROWABLE_FRAME_NAMES = new Set(['Main Content/home', 'Header', 'Page Title', 'Frame 1', 'Main Workspace: Bento Grid of Route Manifests', 'KPI Header', 'Frame 11', 'Frame 15', 'Footer']);
const textOf = (node: Layer): string => [node.text ?? '', ...(node.c ?? []).map(textOf)].join(' ').replace(/\s+/g, ' ').trim();
function findNodes(node: Layer, predicate: (n: Layer) => boolean): Layer[] {
  return [...(predicate(node) ? [node] : []), ...(node.c ?? []).flatMap(n => findNodes(n, predicate))];
}
function Original({ node, styles }: { node: Layer; styles: Style[] }) {
  return <FigmaLayer node={node} styles={styles} root skipOverride />;
}

export default function RouteBalance() {
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
  const [columns, setColumns] = useState(4);
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
    const resize = () => {
      // The real sidebar now sits outside this canvas (rendered by
      // NavbarWrapper), so only the remaining viewport is available to it.
      const available = Math.max(0, window.innerWidth - REAL_SIDEBAR_WIDTH);
      setScale(Math.min(1, Math.max(available, 883) / DESIGN_WIDTH));
      // Beyond the design width, add whole route-card columns instead of
      // scaling up, so the extra room on a wide monitor shows more routes at
      // their real size rather than stretching the original design. This is
      // naturally bounded later by how many cards actually exist to fill them.
      setColumns(4 + Math.floor(Math.max(0, available - DESIGN_WIDTH) / CARD_STEP));
    };
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
    // Greedy shortest-column masonry: always place the next card in whichever
    // column is currently shortest. With the original 4 columns and no expand
    // interaction this reproduces the exact hand-authored layout (verified
    // against the source export), so it can run unconditionally and also
    // extend cleanly to the extra columns a wide screen adds. Never add more
    // columns than there are cards to fill them, or the header/KPI row above
    // (which always spans the full width) would stretch past a card grid
    // that stops short, leaving mismatched right edges.
    const effectiveColumns = Math.min(columns, Math.max(4, cards.length));
    // `columns` is how many card-slots the viewport has room for; once that
    // exceeds the columns actually in use (no more cards to place), the
    // leftover slot width enlarges the cards themselves instead of the grid
    // just stopping with unused space beside it.
    const leftoverColumns = Math.max(0, columns - effectiveColumns);
    const blockScale = leftoverColumns ? Math.min(MAX_BLOCK_SCALE, 1 + (leftoverColumns * CARD_STEP) / (effectiveColumns * CARD_WIDTH)) : 1;
    const scaledStep = CARD_WIDTH * blockScale + CARD_GUTTER;
    // Column gutters are 16px in both screens' source data, but Rebalance's
    // two card rows sit 17px apart (546.5 tall + 563.5 offset) — a real,
    // if tiny, inconsistency in the original export that a single constant
    // would silently round away.
    const rowGutter = mode === 'rebalance' ? 17 : CARD_GUTTER;
    const colHeights = new Array(effectiveColumns).fill(0);
    let largestBottom = 0;
    cards.forEach(card => {
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
      const col = colHeights.indexOf(Math.min(...colHeights));
      // The matrix's diagonal scales the whole card (and everything drawn
      // inside it) from its top-left corner; left/top stay in unscaled grid
      // coordinates, which is what keeps this in sync with colHeights below.
      style.relativeTransform = [[blockScale, 0, col * scaledStep], [0, blockScale, colHeights[col]]];
      colHeights[col] += (style.height ?? 0) * blockScale + rowGutter;
      largestBottom = Math.max(largestBottom, colHeights[col] - rowGutter);
    });
    const sourceHeight = mode === 'operations' ? 509 : 1110;
    const delta = Math.max(0, largestBottom - sourceHeight);
    if (delta) {
      // The Figma-drawn Sidebar/outer frame are no longer rendered (see the
      // Main Content/home lookup below), so only its own height and the
      // footer's position need to grow with an expanded card.
      for (const node of findNodes(copy.root, n => n.n === 'Main Content/home' || n.n === 'Frame 11' || n.n === 'Footer')) {
        const s = { ...copy.styles[node.s] };
        node.s = copy.styles.push(s) - 1;
        if (node.n === 'Footer' && s.relativeTransform) s.relativeTransform = [[1, 0, s.relativeTransform[0][2]], [0, 1, s.relativeTransform[1][2] + delta]];
        else if (s.height) s.height += delta;
      }
    }
    // Widen every row that must visually span the grid's actual rendered
    // width (backgrounds, dividers, the card grid itself) and re-anchor the
    // pieces that were flush with the original 1057px right edge (toolbars,
    // the search/mode-toggle group, the footer note) to the new one. Driven
    // by the grid's real width — column count and card scale together —
    // rather than column count alone, so a scaled-up grid still lines up.
    const gridWidth = effectiveColumns * CARD_WIDTH * blockScale + (effectiveColumns - 1) * CARD_GUTTER;
    const extraWidth = Math.max(0, gridWidth - (4 * CARD_WIDTH + 3 * CARD_GUTTER));
    if (extraWidth) {
      for (const node of findNodes(copy.root, n => (n === copy.root || GROWABLE_FRAME_NAMES.has(n.n)) && (copy.styles[n.s].width ?? 0) >= 500)) {
        const s = { ...copy.styles[node.s] };
        node.s = copy.styles.push(s) - 1;
        if (s.width) s.width += extraWidth;
      }
      const shiftRightAligned = (node?: Layer) => {
        for (const child of node?.c ?? []) {
          const s = copy.styles[child.s];
          const right = (s.relativeTransform?.[0][2] ?? 0) + (s.width ?? 0);
          if (Math.abs(right - CONTENT_WIDTH) < 1) {
            child.s = copy.styles.push({ ...s, relativeTransform: [[1, 0, (s.relativeTransform?.[0][2] ?? 0) + extraWidth], [0, 1, s.relativeTransform?.[1][2] ?? 0]] }) - 1;
          }
        }
      };
      shiftRightAligned(findNodes(copy.root, n => n.n === 'Page Title')[0]?.c?.[0]);
      shiftRightAligned(findNodes(copy.root, n => n.n === 'Main Workspace: Bento Grid of Route Manifests')[0]);
      shiftRightAligned(findNodes(copy.root, n => n.n === 'Footer')[0]);
      const kpiHeader = findNodes(copy.root, n => n.n === 'KPI Header')[0];
      if (kpiHeader?.c?.length) {
        const n = kpiHeader.c.length;
        const tileWidth = copy.styles[kpiHeader.c[0].s].width ?? 0;
        // Grow the stat tiles themselves (same technique as the cards above)
        // to fill the row, keeping a plain 16px gutter between them, instead
        // of leaving them their original size with a wide gap.
        const targetWidth = CONTENT_WIDTH + extraWidth;
        const tileScale = Math.min(MAX_BLOCK_SCALE, (targetWidth - (n - 1) * CARD_GUTTER) / (n * tileWidth));
        const tileStep = tileWidth * tileScale + CARD_GUTTER;
        kpiHeader.c.forEach((tile, i) => {
          const s = copy.styles[tile.s];
          tile.s = copy.styles.push({ ...s, relativeTransform: [[tileScale, 0, i * tileStep], [0, tileScale, s.relativeTransform?.[1][2] ?? 0]] }) - 1;
        });
      }
    }
    return copy;
  }, [data, mode, expanded, query, columns]);
  // The real NavbarWrapper shell now renders the sidebar and app-bar, so only
  // this subtree (everything the Figma export drew to its right) is shown.
  const mainContent = useMemo(() => prepared && findNodes(prepared.root, n => n.n === 'Main Content/home')[0], [prepared]);

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
  }, [mode, query, shift, expanded, validated, data, changeMode, added]);

  const modalNode = modalData?.root.c?.at(-1);
  const modalWidth = modalNode && modalData ? modalData.styles[modalNode.s].width : undefined;
  // Shared with the added-routes strip below so it centers to the same
  // width as the canvas instead of a leftover fixed offset from when the
  // Figma-drawn sidebar (now replaced by the real one) was part of it.
  const canvasWidth = (prepared?.styles[mainContent?.s ?? -1]?.width ?? DESIGN_WIDTH) * scale;
  return <main className="rb-app" aria-label="Route Balance">
    {error ? <p role="alert">{error} <button onClick={() => location.reload()}>Try again</button></p> : !prepared || !mainContent ? <p className="rb-loading" role="status">Loading Route Balance…</p> : <div className="rb-canvas-size" style={{width:canvasWidth,height:(prepared.styles[mainContent.s].height ?? 950)*scale}}><div className="rb-canvas" style={{width:prepared.styles[mainContent.s].width ?? DESIGN_WIDTH,transform:`scale(${scale})`}}><LayerOverrides.Provider value={override}><FigmaLayer node={mainContent} styles={prepared.styles} root /></LayerOverrides.Provider>{query && !findNodes(mainContent,n => n.n==='Route Card' && !n.renderHidden).length && <p className="rb-empty">No routes match “{query}”. <button onClick={() => setQuery('')}>Clear search</button></p>}</div></div>}
    {added.length > 0 && <section className="rb-added" aria-label="New flex routes" style={{maxWidth:canvasWidth}}>{added.map((r,i) => <article key={i}><strong>{r.name}</strong><p>{r.driver}</p><span>FLEX · {shift ?? 'AM'} · 0 STOPS</span></article>)}</section>}
    {modal && <dialog ref={dialog} className={`rb-dialog ${modalNode ? 'rb-reference-dialog' : ''}`} style={modalWidth ? {width:modalWidth+2} : undefined} onCancel={() => setModal(undefined)} onClick={e => {if(e.target===e.currentTarget)setModal(undefined);}} aria-label={modal === 'flex' ? 'Add new flex route' : modal === 'import' ? 'Import routes' : 'Route details'}>
      <button className="rb-dialog-close" aria-label="Close dialog" onClick={() => setModal(undefined)}>×</button>
      {modalNode && modalData ? <LayerOverrides.Provider value={(n, s, css) => n.n === 'Button' && !textOf(n) ? <button className="rb-source-button" style={css} aria-label="Close details" onClick={() => setModal(undefined)}><Original node={n} styles={s}/></button> : undefined}><FigmaLayer node={modalNode} styles={modalData.styles} root /></LayerOverrides.Provider> : modal === 'flex' ? <form onSubmit={e => {e.preventDefault();setAdded(prev => [...prev,{name:newRoute.trim(),driver:newDriver.trim()}]);setNewRoute('');setNewDriver('');setModal(undefined);setToast('Flex route added to this draft.');}}><h2>ADD NEW FLEX ROUTE</h2><p>Assign a route and driver to your operation.</p><label>ROUTE<input required value={newRoute} onChange={e => setNewRoute(e.target.value)} placeholder="Route name" /></label><label>DRIVER<input required value={newDriver} onChange={e => setNewDriver(e.target.value)} placeholder="Driver name" /></label><div className="rb-form-actions"><button type="button" onClick={() => setModal(undefined)}>Cancel</button><button className="rb-primary" disabled={!newRoute.trim() || !newDriver.trim()}>Add route</button></div></form> : modal === 'import' ? <div><h2>IMPORT ROUTES</h2><p>Select your DISCO spreadsheet.</p><label className="rb-file">Choose file<input type="file" accept=".xlsx,.xls,.xlsm" onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}/></label>{fileName && <p>{fileName}</p>}<p className="rb-note">Spreadsheet processing requires the route import service. This prototype does not upload files.</p></div> : modal === 'send' ? <div><h2>SEND TO DRIVERS</h2><p>This prototype has no driver delivery service connected. Your draft can be reviewed in Rebalance.</p><button className="rb-primary" onClick={() => {setModal(undefined);changeMode('rebalance');}}>Review routes</button></div> : <p role="status">Loading details…</p>}
    </dialog>}
    {toast && <div className="rb-toast" role="status"><span>✓</span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}>×</button></div>}
  </main>;
}
