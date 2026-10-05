import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
export default function Screen() {
    return (<div className="bg-[var(--primary\/primary-container,#a3e635)] content-stretch flex flex-col items-start justify-between p-[74px] relative size-full" data-node-id="1:90" data-name="cover">
      <div className="content-stretch flex flex-col h-[100px] items-start relative shrink-0 w-full" data-node-id="1:91" data-name="Heading 1">
        <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold'] font-bold justify-center leading-[0] relative shrink-0 text-[#1a1c16] text-[60px] tracking-[-1.6px] w-[215px]" data-node-id="1:92">
          <p className="leading-[50px] mb-0">LOGIX /</p>
          <p className="leading-[50px]">SPHERE</p>
        </div>
      </div>
      <div className="content-stretch flex flex-col h-[39px] items-end relative shrink-0 w-full" data-node-id="1:93" data-name="Heading 2">
        <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold'] font-semibold justify-center leading-[0] relative shrink-0 text-[#1a1c16] text-[32px] uppercase whitespace-nowrap" data-node-id="1:94">
          <p className="leading-[38.4px]">Invoice Manangement</p>
        </div>
      </div>
    </div>);
}
