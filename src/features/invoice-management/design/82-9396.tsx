import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgSearchIcon = '/invoice-management/assets/figma-0c250c777346a295.svg';
const imgContainer = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-54a7952a3d0e579f.svg';
function LayoutFooter({ className }: {
    className?: string;
}) {
    return (<div className={className || "border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative w-[1057px]"} data-node-id="25:343" data-name="Layout/Footer">
      <div className="relative shrink-0" data-node-id="25:344" data-name="Container">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-end relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#707979] text-[10px] whitespace-nowrap" data-node-id="25:345">
            <p className="leading-[15px]">© 2026 LOGIX / SPHERE OPERATIONAL SYSTEMS</p>
          </div>
        </div>
      </div>
    </div>);
}
function InvoiceWorkflowTableHeader({ className }: {
    className?: string;
}) {
    return (<div className={className || "border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative w-[1326px]"} data-node-id="82:9163" data-name="InvoiceWorkflow/TableHeader">
      <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="82:9164" data-name="ColCheck">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9165">
          SEL
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="82:9166" data-name="ColID">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9167">
          RECORD ID
        </p>
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="82:9168" data-name="ColSub">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9169">
          SUBCONTRACTOR
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="82:9170" data-name="ColPeriod">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9171">
          PERIOD
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="82:9172" data-name="ColAmount">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9173">
          AMOUNT
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="82:9174" data-name="ColStatus">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9175">
          STAGE
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="82:9176" data-name="ColView">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9177">{` `}</p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="82:9178" data-name="ColAction">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="82:9179">
          NEXT ACTION
        </p>
      </div>
    </div>);
}
type UiButtonProps = {
    className?: string;
    label?: string;
    size?: "md";
    state?: "Default" | "Disabled";
    type?: "Primary" | "Secondary";
};
function UiButton({ className, label = "Button", size = "md", state = "Disabled", type = "Primary" }: UiButtonProps) {
    const isSecondaryAndMdAndDefault = type === "Secondary" && size === "md" && state === "Default";
    return (<Action className={className || `content-stretch flex h-[36px] items-center justify-center px-[16px] relative ${isSecondaryAndMdAndDefault ? "bg-[#f5f5f4] border border-[#bfc8c9] border-solid" : "bg-[#efefea]"}`} id={isSecondaryAndMdAndDefault ? "node-90_13006" : "node-90_13003"} label={label}>
      {type === "Primary" && size === "md" && state === "Disabled" && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13019">
          {label}
        </p>)}
      {isSecondaryAndMdAndDefault && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13022">
          {label}
        </p>)}
    </Action>);
}
type UiSearchBarProps = {
    className?: string;
    placeholder?: string;
    state?: "Default";
};
function UiSearchBar({ className, placeholder = "SEARCH SYSTEM...", state = "Default" }: UiSearchBarProps) {
    return (<div className={className || "bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex gap-[8px] h-[36px] items-center px-[12px] relative w-[280px]"} data-node-id="36:554">
      <div className="relative shrink-0 size-[16px]" data-node-id="36:555" data-name="SearchIcon">
        <img alt="" className="figma-asset" src={imgSearchIcon}/>
      </div>
      <DemoInput className="[word-break:break-word] flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] leading-[normal] min-w-px not-italic relative text-[#8a8a84] text-[11px] uppercase" data-node-id="36:558" label={placeholder} search={true}/>
    </div>);
}
export default function Screen() {
    return (<div className="content-stretch flex flex-col items-start relative size-full" data-node-id="82:9396" data-name="Main">
      <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="82:9397" data-name="Navigation/Navbar-RouteBalance">
        <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I82:9397;89:57150" data-name="Container">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
            <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I82:9397;89:57151" data-name="Margin"/>
            <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I82:9397;89:57152" data-name="Margin">
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I82:9397;89:57153" data-name="Container">
                <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:9397;89:57154" data-name="Container">
                  <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:9397;89:57155" data-name="Container">
                    <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:9397;89:57156">
                      <p className="leading-[16.5px]">25/09/2026 11:20</p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I82:9397;89:57157" data-name="Margin">
                  <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I82:9397;89:57158" data-name="Vertical Divider"/>
                </div>
                <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:9397;89:57159">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:9397;89:57160" data-name="Container">
                    <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I82:9397;89:57161" data-name="Background+Border">
                      <div className="relative shrink-0 size-[20px]" data-node-id="I82:9397;89:57162" data-name="Container">
                        <img alt="" className="figma-asset" src={imgContainer}/>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:9397;89:57164" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:9397;89:57165" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:9397;89:57166">
                        <p className="leading-[16.5px]">João</p>
                      </div>
                    </div>
                    <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I82:9397;89:57167">
                      <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                        <img alt="" className="figma-asset" src={imgVector1}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I82:9397;89:57168" data-name="Container">
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I82:9397;89:57169" data-name="Input">
                <div className="flex-[1_0_0] min-w-px relative" data-node-id="I82:9397;89:57170" data-name="Container">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                    <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I82:9397;89:57171">
                      <p className="leading-[normal]">SEARCH SYSTEM...</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I82:9397;89:57172" data-name="Container"/>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="82:9398" data-name="Content">
        <div className="border-[#707979] border-b border-solid content-stretch flex items-center justify-between overflow-clip pb-[20px] relative shrink-0 w-full" data-node-id="82:9399" data-name="Page Title">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0 uppercase whitespace-nowrap" data-node-id="82:9400" data-name="Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9401">
              Invoice Processing Workflow
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9402">
              FROM CURRENT PERIOD TO INVOICE · 30 RECORDS · SEP 2026 – SEP 2026
            </p>
          </div>
        </div>
        <div className="[word-break:break-word] content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9403" data-name="Pipeline">
          <div className="bg-[var(--background\/card,white)] border-[#707979] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:9404" data-name="Stage / 01 · Current period">
            <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9405">
              01 · Current period
            </p>
            <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:9406" data-name="Value">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9407">
                8
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:9408">
                £13,740.66
              </p>
            </div>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9409">
              AWAITING PERIOD CLOSE
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#ffa825] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:9410" data-name="Stage / 02 · Pending verification">
            <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9411">
              02 · Pending verification
            </p>
            <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:9412" data-name="Value">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9413">
                12
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:9414">
                £20,766.33
              </p>
            </div>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9415">
              NEEDS VERIFICATION
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#27676c] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:9416" data-name="Stage / 03 · Ready for invoicing">
            <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9417">
              03 · Ready for invoicing
            </p>
            <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:9418" data-name="Value">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9419">
                6
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:9420">
                £11,694.08
              </p>
            </div>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9421">
              READY TO GENERATE INVOICE
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#446900] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:9422" data-name="Stage / 04 · Invoiced">
            <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9423">
              04 · Invoiced
            </p>
            <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:9424" data-name="Value">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9425">
                4
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:9426">
                £7,209.30
              </p>
            </div>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9427">
              INVOICE ISSUED
            </p>
          </div>
        </div>
        <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="82:9428" data-name="Records table">
          <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="82:9429" data-name="Table toolbar">
            <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH SUBCONTRACTOR OR RECORD ID..."/>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="82:9431" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:9431;89:60940">
                BATCH ACTION
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 text-[#8a8a84] w-full whitespace-nowrap" data-node-id="I82:9431;89:60941" data-name="Field">
                <p className="not-italic relative shrink-0 text-[12px]" data-node-id="I82:9431;89:60942">
                  MOVE TO NEXT STAGE
                </p>
                <p className="font-normal relative shrink-0 text-[14px]" data-node-id="I82:9431;89:60943" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <UiButton className="bg-[#efefea] content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="APPLY TO SELECTED"/>
            <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="↓ EXPORT" state="Default" type="Secondary"/>
          </div>
          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="82:9434" data-name="Table">
            <InvoiceWorkflowTableHeader className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full"/>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9436" data-name="Row / REC-2025001">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9436;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9436;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9436;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9436;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9436;7:387">
                  REC-2025001
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9436;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9436;7:391">
                  Benjamin Harris
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9436;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9436;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9436;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9436;7:399">
                  £2,489.20
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9436;7:402" data-name="ColStatus">
                <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9436;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9436;7:403;89:60868">
                    PENDING VERIFICATION
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9436;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9436;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9436;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9436;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9436;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9436;7:408;89:60777">
                    VERIFY
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9437" data-name="Row / REC-2025002">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9437;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9437;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9437;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9437;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9437;7:387">
                  REC-2025002
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9437;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9437;7:391">
                  James Anderson
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9437;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9437;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9437;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9437;7:399">
                  £929.10
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9437;7:402" data-name="ColStatus">
                <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9437;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9437;7:403;89:60868">
                    PENDING VERIFICATION
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9437;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9437;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9437;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9437;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9437;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9437;7:408;89:60777">
                    VERIFY
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9438" data-name="Row / REC-2025003">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9438;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9438;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9438;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9438;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9438;7:387">
                  REC-2025003
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9438;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9438;7:391">
                  Charlotte Walker
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9438;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9438;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9438;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9438;7:399">
                  £643.41
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9438;7:402" data-name="ColStatus">
                <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9438;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9438;7:403;89:60870">
                    READY FOR INVOICING
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9438;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9438;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9438;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9438;7:407" data-name="ColAction">
                <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9438;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9438;7:408;89:60769">
                    GENERATE INVOICE
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9439" data-name="Row / REC-2025004">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9439;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9439;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9439;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9439;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9439;7:387">
                  REC-2025004
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9439;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9439;7:391">
                  Alexander Lee
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9439;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9439;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9439;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9439;7:399">
                  £2,546.77
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9439;7:402" data-name="ColStatus">
                <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9439;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9439;7:403;89:60870">
                    READY FOR INVOICING
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9439;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9439;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9439;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9439;7:407" data-name="ColAction">
                <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9439;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9439;7:408;89:60769">
                    GENERATE INVOICE
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9440" data-name="Row / REC-2025005">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9440;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9440;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9440;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9440;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9440;7:387">
                  REC-2025005
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9440;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9440;7:391">
                  Emma Wilson
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9440;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9440;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9440;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9440;7:399">
                  £1,670.29
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9440;7:402" data-name="ColStatus">
                <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9440;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9440;7:403;89:60864">
                    INVOICED
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9440;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9440;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9440;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9440;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9440;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9440;7:408;89:60777">
                    SCHEDULE PAYMENT
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9441" data-name="Row / REC-2025006">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9441;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9441;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9441;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9441;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9441;7:387">
                  REC-2025006
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9441;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9441;7:391">
                  Maria Garcia
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9441;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9441;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9441;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9441;7:399">
                  £1,798.10
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9441;7:402" data-name="ColStatus">
                <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9441;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9441;7:403;89:60872">
                    CURRENT PERIOD
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9441;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9441;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9441;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9441;7:407" data-name="ColAction"/>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9442" data-name="Row / REC-2025007">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9442;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9442;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9442;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9442;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9442;7:387">
                  REC-2025007
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9442;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9442;7:391">
                  Maria Garcia
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9442;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9442;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9442;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9442;7:399">
                  £1,324.02
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9442;7:402" data-name="ColStatus">
                <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9442;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9442;7:403;89:60868">
                    PENDING VERIFICATION
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9442;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9442;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9442;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9442;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9442;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9442;7:408;89:60777">
                    VERIFY
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9443" data-name="Row / REC-2025008">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9443;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9443;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9443;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9443;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9443;7:387">
                  REC-2025008
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9443;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9443;7:391">
                  Olivia Taylor
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9443;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9443;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9443;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9443;7:399">
                  £2,102.02
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9443;7:402" data-name="ColStatus">
                <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9443;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9443;7:403;89:60864">
                    INVOICED
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9443;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9443;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9443;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9443;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9443;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9443;7:408;89:60777">
                    SCHEDULE PAYMENT
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9444" data-name="Row / REC-2025009">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9444;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9444;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9444;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9444;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9444;7:387">
                  REC-2025009
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9444;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9444;7:391">
                  Amelia Lewis
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9444;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9444;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9444;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9444;7:399">
                  £2,697.66
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9444;7:402" data-name="ColStatus">
                <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9444;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9444;7:403;89:60872">
                    CURRENT PERIOD
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9444;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9444;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9444;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9444;7:407" data-name="ColAction"/>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9445" data-name="Row / REC-2025010">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9445;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9445;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9445;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9445;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9445;7:387">
                  REC-2025010
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9445;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9445;7:391">
                  Sarah Brown
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9445;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9445;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9445;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9445;7:399">
                  £3,011.18
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9445;7:402" data-name="ColStatus">
                <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9445;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9445;7:403;89:60868">
                    PENDING VERIFICATION
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9445;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9445;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9445;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9445;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9445;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9445;7:408;89:60777">
                    VERIFY
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9446" data-name="Row / REC-2025027">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9446;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9446;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9446;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9446;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9446;7:387">
                  REC-2025027
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9446;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9446;7:391">
                  Mia Rodriguez
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9446;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9446;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9446;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9446;7:399">
                  £1,529.47
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9446;7:402" data-name="ColStatus">
                <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9446;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9446;7:403;89:60872">
                    CURRENT PERIOD
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9446;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9446;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9446;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9446;7:407" data-name="ColAction"/>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9447" data-name="Row / REC-2025028">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9447;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9447;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9447;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9447;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9447;7:387">
                  REC-2025028
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9447;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9447;7:391">
                  Amelia Lewis
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9447;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9447;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9447;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9447;7:399">
                  £1,442.86
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9447;7:402" data-name="ColStatus">
                <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9447;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9447;7:403;89:60872">
                    CURRENT PERIOD
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9447;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9447;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9447;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9447;7:407" data-name="ColAction"/>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9448" data-name="Row / REC-2025029">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9448;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9448;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9448;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9448;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9448;7:387">
                  REC-2025029
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9448;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9448;7:391">
                  Robert Johnson
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9448;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9448;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9448;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9448;7:399">
                  £2,240.20
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9448;7:402" data-name="ColStatus">
                <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9448;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9448;7:403;89:60868">
                    PENDING VERIFICATION
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9448;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9448;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9448;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9448;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9448;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9448;7:408;89:60777">
                    VERIFY
                  </p>
                </Action>
              </div>
            </SearchRow>
            <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:9449" data-name="Row / REC-2025030">
              <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:9449;7:380" data-name="ColCheck">
                <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:9449;7:381" data-name="UI/Checkbox" initial={false}>
                  <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:9449;7:381;89:60832" data-name="Box"/>
                </DemoCheck>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:9449;7:386" data-name="ColID">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:9449;7:387">
                  REC-2025030
                </p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:9449;7:390" data-name="ColSub">
                <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:9449;7:391">
                  Amelia Lewis
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:9449;7:394" data-name="ColPeriod">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:9449;7:395">
                  Sep 2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:9449;7:398" data-name="ColAmount">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:9449;7:399">
                  £573.77
                </p>
              </div>
              <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:9449;7:402" data-name="ColStatus">
                <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:9449;7:403" data-name="UI/Badge">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9449;7:403;89:60864">
                    INVOICED
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:9449;36:5923" data-name="ColView">
                <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9449;36:5924" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:9449;36:5924;89:60777">
                    VIEW
                  </p>
                </Action>
              </div>
              <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:9449;7:407" data-name="ColAction">
                <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:9449;7:408" data-name="UI/Button">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:9449;7:408;89:60777">
                    SCHEDULE PAYMENT
                  </p>
                </Action>
              </div>
            </SearchRow>
          </div>
          <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pb-[4px] pt-[16px] px-[24px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9450" data-name="Total footer">
            <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9451">
              SHOWING 14 OF 30 RECORDS
            </p>
            <div className="content-stretch flex gap-[12px] items-baseline overflow-clip relative shrink-0" data-node-id="82:9452" data-name="Total">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:9453">
                GRAND TOTAL
              </p>
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:9454">
                £53,410.37
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="82:9455" data-name="Footer wrap">
        <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
      </div>
    </div>);
}
