import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgSearchIcon = '/invoice-management/assets/figma-0c250c777346a295.svg';
const imgProperty1Home = '/invoice-management/assets/figma-cb6c740391fd60a8.svg';
const imgLS = '/invoice-management/assets/figma-df4259957ec80174.svg';
const imgMenuIcon = '/invoice-management/assets/figma-9eb7a77b599512e6.svg';
const imgMenuIcon1 = '/invoice-management/assets/figma-ade90a8fe29794f1.svg';
const imgMenuIcon2 = '/invoice-management/assets/figma-45eff26857b33345.svg';
const imgMenuIcon3 = '/invoice-management/assets/figma-9a51012419bbc15a.svg';
const imgContainer = '/invoice-management/assets/figma-410ac55350634560.svg';
const imgContainer1 = '/invoice-management/assets/figma-66cd741a9099f1d6.svg';
const imgFrame2 = '/invoice-management/assets/figma-29dab040e2294a7d.svg';
const imgArrow = '/invoice-management/assets/figma-32786950caf83bb8.svg';
const imgContainer2 = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-0051649671f4492e.svg';
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
type UiButtonProps = {
    className?: string;
    label?: string;
    size?: "md" | "sm";
    state?: "Default";
    type?: "Primary" | "Brand";
};
function UiButton({ className, label = "Button", size = "sm", state = "Default", type = "Primary" }: UiButtonProps) {
    const isBrandAndMdAndDefault = type === "Brand" && size === "md" && state === "Default";
    return (<Action className={className || `content-stretch flex items-center justify-center relative ${isBrandAndMdAndDefault ? "bg-[#446900] h-[36px] px-[16px]" : "bg-[#b2f746] h-[28px] px-[12px]"}`} id={isBrandAndMdAndDefault ? "node-90_13014" : "node-90_13005"} label={label}>
      {type === "Primary" && size === "sm" && state === "Default" && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="90:13021">
          {label}
        </p>)}
      {isBrandAndMdAndDefault && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[12px] text-white uppercase whitespace-nowrap" data-node-id="90:13030">
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
type MenuIconProps = {
    className?: string;
    property1?: "home";
};
function MenuIcon({ className, property1 = "home" }: MenuIconProps) {
    return (<div className={className || "h-[11px] relative w-[14px]"} data-node-id="111:14660">
      <img alt="" className="figma-asset" src={imgProperty1Home}/>
    </div>);
}
type MenuItemProps = {
    className?: string;
    property1?: "Closed";
    property2?: "Default";
};
function MenuItem({ className, property1 = "Closed", property2 = "Default" }: MenuItemProps) {
    return (<Action className={className || "border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative w-[58px]"} data-node-id="133:8307">
      <MenuIcon className="h-[11px] relative shrink-0 w-[14px]"/>
    </Action>);
}
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="82:7755" data-name="Invoice Manangement - Schedule for Payment">
      <div className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" data-node-id="82:7756" data-name="Navigation/Sidebar">
        <div className="absolute bg-[#e9e9de] border-[#bfc8c9] border-r border-solid content-stretch flex flex-col inset-[0_16.9%_0_0] items-start justify-between overflow-clip pr-px py-[24px]" data-node-id="I82:7756;129:6805" data-name="Sidebar">
          <div className="h-[109px] relative shrink-0 w-full" data-node-id="I82:7756;129:6806" data-name="Margin">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
              <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-[65px]" data-node-id="I82:7756;129:6807" data-name="Container">
                <div className="content-stretch flex flex-col items-start relative shrink-0 w-[34px]" data-node-id="I82:7756;129:6808" data-name="Heading 1">
                  <div className="h-[61.848px] relative shrink-0 w-[33.14px]" data-node-id="I82:7756;129:6809" data-name="L / S">
                    <img alt="" className="figma-asset" src={imgLS}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="I82:7756;129:6813" data-name="Nav">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
              <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0" data-node-id="I82:7756;129:6814">
                <MenuItem className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]"/>
                <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="I82:7756;135:7344" data-name="Menu Item">
                  <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I82:7756;135:7344;129:7003" data-name="menu-icon">
                    <img alt="" className="figma-asset" src={imgMenuIcon}/>
                  </div>
                </Action>
                <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="I82:7756;135:7348" data-name="Menu Item">
                  <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I82:7756;135:7348;129:7003" data-name="menu-icon">
                    <div className="absolute inset-[-7.5%_-8.33%]">
                      <img alt="" className="figma-asset" src={imgMenuIcon1}/>
                    </div>
                  </div>
                </Action>
                <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="I82:7756;135:7352" data-name="Menu Item">
                  <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I82:7756;135:7352;129:7003" data-name="menu-icon">
                    <div className="absolute inset-[0_0_-36.36%_0]">
                      <img alt="" className="figma-asset" src={imgMenuIcon2}/>
                    </div>
                  </div>
                </Action>
                <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="I82:7756;135:7356" data-name="Menu Item">
                  <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I82:7756;135:7356;129:7003" data-name="menu-icon">
                    <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                  </div>
                </Action>
                <div className="bg-[#b2f746] border-[#003b3e] border-l-4 border-solid content-stretch flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="I82:7756;135:7360" data-name="Menu Item">
                  <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I82:7756;135:7360;129:7014" data-name="menu-icon">
                    <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative shrink-0 w-full" data-node-id="I82:7756;129:6845" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[16px] relative size-full">
              <div className="border-[#bfc8c9] border-solid border-t content-stretch flex flex-col gap-[8px] items-start pt-[17px] relative shrink-0 w-full" data-node-id="I82:7756;129:6846" data-name="HorizontalBorder">
                <div className="relative shrink-0 w-full" data-node-id="I82:7756;129:6847" data-name="Link">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center relative size-full">
                    <div className="relative shrink-0 size-[11.667px]" data-node-id="I82:7756;129:6848" data-name="Container">
                      <img alt="" className="figma-asset" src={imgContainer}/>
                    </div>
                  </div>
                </div>
                <div className="relative shrink-0 w-full" data-node-id="I82:7756;129:6851" data-name="Link">
                  <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center relative size-full">
                    <div className="h-[11.083px] relative shrink-0 w-[10.5px]" data-node-id="I82:7756;129:6852" data-name="Container">
                      <img alt="" className="figma-asset" src={imgContainer1}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute flex items-center justify-center right-0 size-[24px] top-[107px]" data-node-id="I82:7756;129:6855">
          <div className="flex-none rotate-180">
            <div className="relative size-[24px]">
              <img alt="" className="figma-asset" src={imgFrame2}/>
            </div>
          </div>
        </div>
        <div className="absolute bg-[#181818] content-stretch drop-shadow-[0px_2px_3.5px_rgba(0,0,0,0.12)] flex flex-col gap-[8px] items-start left-[43px] p-[4px] top-[343px]" data-node-id="I82:7756;129:6858" data-name="Feedback/Tooltip">
          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#f5f5f5] text-[9px] w-[min-content]" data-node-id="I82:7756;129:6858;89:60184">
            <p className="leading-[normal] mb-[2px]">Invoice Processing</p>
            <p className="mb-[2px]">
              <span className="leading-[normal]">
                {`Deductions & Recharges`}
                <br aria-hidden/>
              </span>
              <span className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic">Schedule for Payment</span>
            </p>
            <p className="leading-[normal]">Invoices History</p>
          </div>
          <div className="-translate-y-1/2 absolute flex items-center justify-center left-[-5px] size-[5px] top-[calc(50%+0.5px)]" data-node-id="I82:7756;129:6858;89:60186">
            <div className="-rotate-90 flex-none">
              <div className="relative size-[5px]" data-name="arrow">
                <img alt="" className="figma-asset" src={imgArrow}/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="82:7757" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="82:7758" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I82:7758;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I82:7758;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I82:7758;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I82:7758;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:7758;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:7758;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:7758;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I82:7758;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I82:7758;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:7758;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:7758;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I82:7758;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I82:7758;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:7758;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:7758;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:7758;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I82:7758;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I82:7758;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I82:7758;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I82:7758;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I82:7758;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I82:7758;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="82:7759" data-name="Content">
          <div className="[word-break:break-word] border-[#707979] border-b border-solid content-stretch flex flex-col gap-[6px] items-start overflow-clip pb-[20px] relative shrink-0 uppercase w-full whitespace-nowrap" data-node-id="82:7760" data-name="Page Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:7761">
              Schedule for Payment
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:7762">
              30 INVOICES SCHEDULED · DHL PAYMENT CYCLE
            </p>
          </div>
          <div className="bg-[#003b3e] content-stretch flex items-center justify-between overflow-clip px-[28px] py-[24px] relative shrink-0 w-full" data-node-id="82:7763" data-name="Next payment run">
            <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0" data-node-id="82:7764" data-name="Run">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#b2f746] text-[11px] uppercase whitespace-nowrap" data-node-id="82:7765">
                NEXT PAYMENT RUN · RUN #1
              </p>
              <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="82:7766" data-name="Date row">
                <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[#fafaef] text-[32px] uppercase whitespace-nowrap" data-node-id="82:7767">
                  25 SEP 2026
                </p>
                <UiButton className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" label="edit EDIT DATE"/>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[#c9d6d3] text-[12px] uppercase whitespace-nowrap" data-node-id="82:7769">
                THURSDAY · DHL PAYMENT CYCLE · 30 INVOICES · 1 ON HOLD · 1 RESCHEDULED
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex gap-[40px] items-start overflow-clip relative shrink-0 whitespace-nowrap" data-node-id="82:7770" data-name="Totals">
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7771" data-name="Metric / Valor bruto">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7772">
                  GROSS AMOUNT
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#fafaef] text-[24px]" data-node-id="82:7773">
                  £61,099.99
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7774" data-name="Metric / Deduções">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7775">
                  DEDUCTIONS
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#ffb4a8] text-[24px]" data-node-id="82:7776">
                  − £4,089.19
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7777" data-name="Metric / Líquido a pagar">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7778">
                  NET PAYABLE
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#b2f746] text-[24px]" data-node-id="82:7779">
                  £57,010.80
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="82:7780" data-name="Payments table">
            <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="82:7781" data-name="Table toolbar">
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH INVOICE OR SUBCONTRACTOR..."/>
              <div className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="82:7783" data-name="Edit selected date">
                <p className="[word-break:break-word] font-['Material_Icons:Regular'] leading-[0] not-italic relative shrink-0 text-[#1a1c16] text-[18px] uppercase whitespace-nowrap" data-node-id="I82:7783;89:60771">
                  <span className="leading-[16px]">{`\uE3C9`}</span>
                  <span className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px]">{` EDIT DATE FOR SELECTED`}</span>
                </p>
              </div>
              <UiButton className="bg-[#446900] content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="MARK SELECTED AS PAID" size="md" type="Brand"/>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="82:7785" data-name="Table">
              <div className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7786" data-name="SchedulePayment/TableHeader">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7786;10:1147" data-name="ColCheck">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1148">
                    SEL
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7786;10:1153" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1154">
                    INVOICE
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:7786;10:1157" data-name="ColSub">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1158">
                    SUBCONTRACTOR / PERIOD
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[140px]" data-node-id="I82:7786;10:1161" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1162">
                    PAYMENT DATE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7786;10:1165" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1166">
                    GROSS
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:7786;10:1169" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1170">
                    DEDUCTION
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7786;10:1178" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1179">
                    NET
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7786;10:1182" data-name="ColStatus">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1183">
                    STATUS
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7786;10:1187" data-name="ColAction">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I82:7786;10:1188">
                    ACTIONS
                  </p>
                </div>
              </div>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7787" data-name="Row / INV-2025001">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7787;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7787;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7787;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7787;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7787;10:1152">
                    INV-2025001
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7787;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7787;10:1156">
                    Charlotte Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7787;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7787;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7787;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7787;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7787;10:1164">
                    £2,219.95
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7787;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7787;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7787;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7787;10:1177">
                    £2,219.95
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7787;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7787;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7787;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7787;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7787;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7787;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7788" data-name="Row / INV-2025002">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7788;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7788;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7788;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7788;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7788;10:1152">
                    INV-2025002
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7788;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7788;10:1156">
                    Benjamin Garcia
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7788;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7788;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7788;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7788;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7788;10:1164">
                    £1,968.64
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7788;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7788;10:1168">
                    − £141.40
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7788;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7788;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7788;10:1177">
                    £1,827.24
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7788;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7788;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7788;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7788;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7788;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7788;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7789" data-name="Row / INV-2025003">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7789;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7789;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7789;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7789;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7789;10:1152">
                    INV-2025003
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7789;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7789;10:1156">
                    Amelia Clark
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7789;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7789;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7789;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7789;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7789;10:1164">
                    £1,873.48
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7789;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7789;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7789;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7789;10:1177">
                    £1,873.48
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7789;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7789;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7789;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7789;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7789;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7789;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7790" data-name="Row / INV-2025004">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7790;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7790;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7790;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7790;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7790;10:1152">
                    INV-2025004
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7790;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7790;10:1156">
                    Benjamin Chen
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7790;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7790;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)] whitespace-nowrap" data-node-id="I82:7790;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7790;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7790;10:1164">
                    £1,774.28
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7790;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7790;10:1168">
                    − £93.74
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7790;28:1358">
                    FAILED DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7790;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7790;10:1177">
                    £1,680.54
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7790;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7790;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7790;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7790;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7790;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7790;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7791" data-name="Row / INV-2025005">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7791;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7791;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7791;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7791;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7791;10:1152">
                    INV-2025005
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7791;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7791;10:1156">
                    Alexander Harris
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7791;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7791;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7791;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7791;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7791;10:1164">
                    £2,006.63
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7791;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7791;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7791;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7791;10:1177">
                    £2,006.63
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7791;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7791;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7791;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7791;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7791;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7791;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7792" data-name="Row / INV-2025006">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7792;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7792;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7792;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7792;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7792;10:1152">
                    INV-2025006
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7792;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7792;10:1156">
                    William Taylor
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7792;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7792;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7792;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7792;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7792;10:1164">
                    £2,897.28
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7792;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7792;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7792;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7792;10:1177">
                    £2,897.28
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7792;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7792;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7792;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7792;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7792;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7792;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7793" data-name="Row / INV-2025007">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7793;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7793;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7793;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7793;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7793;10:1152">
                    INV-2025007
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7793;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7793;10:1156">
                    Alexander Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7793;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7793;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7793;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7793;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7793;10:1164">
                    £2,162.95
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7793;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7793;10:1168">
                    − £295.35
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7793;28:1358">
                    LATE DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7793;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7793;10:1177">
                    £1,867.60
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7793;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7793;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7793;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7793;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7793;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7793;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7794" data-name="Row / INV-2025008">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7794;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7794;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7794;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7794;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7794;10:1152">
                    INV-2025008
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7794;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7794;10:1156">
                    Olivia Martinez
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7794;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7794;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7794;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7794;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7794;10:1164">
                    £1,967.22
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7794;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7794;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7794;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7794;10:1177">
                    £1,967.22
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7794;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7794;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7794;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7794;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7794;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7794;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7795" data-name="Row / INV-2025009">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7795;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7795;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7795;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7795;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7795;10:1152">
                    INV-2025009
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7795;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7795;10:1156">
                    Isabella Lee
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7795;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7795;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7795;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7795;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7795;10:1164">
                    £2,908.77
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7795;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7795;10:1168">
                    − £353.21
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7795;28:1358">
                    INSURANCE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7795;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7795;10:1177">
                    £2,555.56
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7795;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7795;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7795;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7795;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7795;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7795;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7796" data-name="Row / INV-2025010">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7796;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7796;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7796;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7796;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7796;10:1152">
                    INV-2025010
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7796;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7796;10:1156">
                    Daniel Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7796;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7796;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7796;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7796;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7796;10:1164">
                    £2,012.69
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7796;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7796;10:1168">
                    − £192.22
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7796;28:1358">
                    LATE DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7796;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7796;10:1177">
                    £1,820.47
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7796;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7796;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7796;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7796;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7796;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7796;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7797" data-name="Row / INV-2025011">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7797;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7797;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7797;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7797;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7797;10:1152">
                    INV-2025011
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7797;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7797;10:1156">
                    Sarah Walker
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7797;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7797;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7797;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7797;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7797;10:1164">
                    £2,999.90
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7797;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7797;10:1168">
                    − £415.45
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7797;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7797;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7797;10:1177">
                    £2,584.45
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7797;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7797;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7797;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7797;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7797;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7797;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7798" data-name="Row / INV-2025029">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7798;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7798;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7798;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7798;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7798;10:1152">
                    INV-2025029
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7798;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7798;10:1156">
                    Sarah Thomas
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7798;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7798;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7798;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7798;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7798;10:1164">
                    £1,720.09
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-start justify-center relative shrink-0 w-[150px]" data-node-id="I82:7798;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7798;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7798;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7798;10:1177">
                    £1,720.09
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7798;10:1180" data-name="ColStatus">
                  <div className="bg-[#ffdad6] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7798;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7798;10:1181;89:60866">
                      ON HOLD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7798;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7798;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7798;10:1186;89:60777">
                      RELEASE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7799" data-name="Row / INV-2025030">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7799;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7799;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7799;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7799;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7799;10:1152">
                    INV-2025030
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7799;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7799;10:1156">
                    David Harris
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7799;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[140px]" data-node-id="I82:7799;28:1354" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:7799;28:1355">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7799;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7799;10:1164">
                    £1,540.70
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7799;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7799;10:1168">
                    − £193.98
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7799;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:7799;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7799;10:1177">
                    £1,346.72
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7799;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7799;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7799;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7799;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7799;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7799;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
            </div>
            <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pb-[4px] pt-[16px] px-[24px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:7800" data-name="Total footer">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7801">
                SHOWING 13 OF 30 INVOICES
              </p>
              <div className="content-stretch flex gap-[32px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7802" data-name="Totals">
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7803" data-name="Total / Bruto">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7804">
                    GROSS
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:7805">
                    £61,099.99
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7806" data-name="Total / Deduções">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7807">
                    DEDUCTIONS
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#ba1a1a] text-[24px]" data-node-id="82:7808">
                    − £4,089.19
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7809" data-name="Total / Líquido">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7810">
                    NET
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:7811">
                    £57,010.80
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="82:7812" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
