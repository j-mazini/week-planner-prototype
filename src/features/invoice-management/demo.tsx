import {createContext,useContext,useEffect,useState,isValidElement,Children,type ReactNode,type HTMLAttributes,type ButtonHTMLAttributes} from 'react';
type Demo={screenId:string;search:string;setSearch:(v:string)=>void;act:(label:string)=>void;values:Record<string,string>;edit:(k:string,v:string)=>void};
const Context=createContext<Demo>(null!);
const wizard=[['50-5289','50-5421','50-5577'],['50-5727','50-5855','50-6014'],['50-6159','50-6268','50-6393'],['50-6517','50-6634','50-6765'],['50-6898','50-7003','50-7128']];
const categories=['50-4816','50-4926','50-5031','50-5115','50-5205'];
const categoryLabels=['repairs','pre-payments','liquidation','traffic','other'];
const go=(id:string)=>{location.hash=id;};
export function textOf(children:ReactNode):string{return Children.toArray(children).map(c=>typeof c==='string'||typeof c==='number'?String(c):isValidElement<{children?:ReactNode,label?:string,value?:string}>(c)?[c.props.label,c.props.value,textOf(c.props.children)].filter(Boolean).join(' '):'').join(' ').replace(/\s+/g,' ').trim();}
export function DemoProvider({screenId,children}:{screenId:string;children:ReactNode}){
 const [search,setSearch]=useState('');const [notice,setNotice]=useState('');const [values,setValues]=useState<Record<string,string>>({});
 useEffect(()=>{setSearch('');},[screenId]);useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),4500);return()=>clearTimeout(timer);},[notice]);
 const act=(label:string)=>{
  const l=label.toLowerCase().trim();if(l==='total'){go('50-4736');return;}const group=wizard.find(x=>x.includes(screenId));const step=group?.indexOf(screenId)??-1;
  const close=()=>go(group?categories[wizard.indexOf(group)]:screenId==='82-7814'?'82-7755':'41-2474');
  if(/cancel|close|fechar/.test(l)){close();return;}
  if(group&&/next/.test(l)&&step<2){go(group[step+1]);return;}
  if(group&&/previous/.test(l)&&step>0){go(group[step-1]);return;}
  if(group&&/save entry/.test(l)){close();setNotice('Demonstração concluída. Nenhum registro financeiro foi enviado.');return;}
  if(l==='invoice processing'||l==='home'){go('41-2474');return;}
  if(/deductions.*recharges/.test(l)){go('50-4736');return;}
  if(l.includes('invoices history')){go('82-8787');return;}
  if(l==='schedule for payment'){go('82-7755');return;}
  const category=categoryLabels.findIndex(x=>l.startsWith(x));if(category>=0){go(l.includes('add:')?wizard[category][0]:categories[category]);return;}
  if(l.startsWith('add:')){const i=categoryLabels.findIndex(x=>l.includes(x));go(wizard[Math.max(0,i)][0]);return;}
  if(/edit.*date/.test(l)){go('82-7814');return;}
  if(/apply to selected/.test(l)){go('82-10280');return;}
  if(/export/.test(l)){go(screenId==='82-9457'?'82-9565':'82-9457');return;}
  if(/preview pdf|download pdf/.test(l)){go('82-9770');return;}
  if(l==='verify'){go('82-9956');return;}
  if(l==='generate invoice'&&screenId!=='82-10061'){go('82-10061');return;}
  if(/schedule payment|schedule for payment/.test(l)&&screenId!=='82-10168'){go('82-10168');return;}
  if(l==='view'||l==='view invoice'){go('82-9197');return;}
  if(/mark as verified|generate invoice|schedule payment|confirm|save|mark.*paid/.test(l)){close();setNotice('Ação demonstrada localmente. Sem emissão de invoice ou pagamento real.');return;}
  if(l.includes('return to current')){go('41-2474');return;}
  setNotice('Esta ação é uma referência visual do Figma.');
 };
 return <Context.Provider value={{screenId,search,setSearch,act,values,edit:(k,v)=>setValues(old=>({...old,[k]:v}))}}>{children}{notice&&<div className="demo-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Fechar aviso">×</button></div>}</Context.Provider>;
}
export function Action({label,children,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{label?:string}){const {act}=useContext(Context);return <button {...props} type="button" onClick={e=>{e.stopPropagation();props.onClick?.(e);act(label||e.currentTarget.textContent||'');}} aria-label={label||props['aria-label']||undefined}>{children}</button>;}
export function DemoInput({label,initialValue='',search=false,disabled=false,...props}:HTMLAttributes<HTMLInputElement>&{label:string;initialValue?:string;search?:boolean;disabled?:boolean}){const state=useContext(Context);return <input {...props} className={`${props.className||''} demo-input`} aria-label={label} placeholder={search?label:undefined} disabled={disabled} value={search?state.search:state.values[label]??initialValue} onChange={e=>search?state.setSearch(e.target.value):state.edit(label,e.target.value)}/>;}
export function DemoCheck({initial=false,children,...props}:HTMLAttributes<HTMLButtonElement>&{initial?:boolean}){const [checked,setChecked]=useState(initial);return <button {...props} type="button" role="checkbox" aria-label={textOf(children)||'Selecionar registro'} aria-checked={checked} className={`${props.className||''} demo-check`} data-toggled={checked!==initial} onClick={()=>setChecked(!checked)}>{children}{checked!==initial&&<span className="check-state">{checked?'✓':''}</span>}</button>;}
export function SearchRow({children,...props}:HTMLAttributes<HTMLDivElement>){const {search}=useContext(Context);const visible=textOf(children).toLowerCase().includes(search.toLowerCase());return <div {...props} style={{...props.style,display:visible?undefined:'none'}}>{children}</div>;}
export function Category({label,children,...props}:HTMLAttributes<HTMLDivElement>&{label:string}){const {act}=useContext(Context);return <div {...props} role="link" tabIndex={0} aria-label={label} style={{...props.style,cursor:'pointer'}} onClick={()=>act(label)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act(label);}}}>{children}</div>;}
