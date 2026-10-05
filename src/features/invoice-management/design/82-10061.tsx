import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgSearchIcon = '/invoice-management/assets/figma-0c250c777346a295.svg';
const imgProperty1Home = '/invoice-management/assets/figma-cb6c740391fd60a8.svg';
const imgMenuIcon = '/invoice-management/assets/figma-9eb7a77b599512e6.svg';
const imgMenuIcon1 = '/invoice-management/assets/figma-ade90a8fe29794f1.svg';
const imgMenuIcon2 = '/invoice-management/assets/figma-45eff26857b33345.svg';
const imgMenuIcon3 = '/invoice-management/assets/figma-9a51012419bbc15a.svg';
const imgContainer = '/invoice-management/assets/figma-ad0f9ce84c4809a0.svg';
const imgContainer1 = '/invoice-management/assets/figma-1cd7da0eafdabb28.svg';
const imgFrame2 = '/invoice-management/assets/figma-f9fe116e433d7148.svg';
const imgLS = '/invoice-management/assets/figma-019666e6fe687e53.svg';
const imgFrame3 = '/invoice-management/assets/figma-29dab040e2294a7d.svg';
const imgCloseButton = '/invoice-management/assets/figma-1d35d8482efa50be.svg';
const imgContainer2 = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-5c523b774e792569.svg';
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
function UiButton({ className, label = "Button", size = "md", state = "Default", type = "Primary" }: UiButtonProps) {
    const isPrimaryAndMdAndDisabled = type === "Primary" && size === "md" && state === "Disabled";
    const isSecondaryAndMdAndDefault = type === "Secondary" && size === "md" && state === "Default";
    return (<Action className={className || `content-stretch flex h-[36px] items-center justify-center px-[16px] relative ${isSecondaryAndMdAndDefault ? "bg-[#f5f5f4] border border-[#bfc8c9] border-solid" : isPrimaryAndMdAndDisabled ? "bg-[#efefea]" : "bg-[#b2f746] border border-[#446900] border-solid"}`} id={isSecondaryAndMdAndDefault ? "node-90_13006" : isPrimaryAndMdAndDisabled ? "node-90_13003" : "node-90_13001"} label={label}>
      {size === "md" && state === "Default" && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13017">
          {label}
        </p>)}
      {isPrimaryAndMdAndDisabled && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13019">
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
type SubmenuItemProps = {
    className?: string;
    property1?: "Default";
};
function SubmenuItem({ className, property1 = "Default" }: SubmenuItemProps) {
    return (<Action className={className || "content-stretch cursor-pointer flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative w-[174px]"} data-node-id="111:14674">
      <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="111:14676" data-name="Container">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="111:14677">
          Invoice Processing
        </p>
      </div>
    </Action>);
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
type NavigationSidebarProps = {
    className?: string;
    property1?: "Opened" | "Closed";
};
function NavigationSidebar({ className, property1 = "Opened" }: NavigationSidebarProps) {
    const isClosed = property1 === "Closed";
    const isOpened = property1 === "Opened";
    return (<div className={className || `h-[1006px] relative ${isClosed ? "w-[71px]" : "w-[175px]"}`} data-name="Navigation/Sidebar" id={isClosed ? "node-133_8345" : "node-133_8344"}>
      {isOpened && (<>
          <div className="absolute contents inset-0" data-node-id="133:8347">
            <div className="absolute bg-[#e9e9de] border-[#bfc8c9] border-r border-solid content-stretch flex flex-col inset-0 items-start justify-between pr-px py-[24px]" data-node-id="133:8348" data-name="Sidebar">
              <div className="relative shrink-0 w-full" data-node-id="133:8349" data-name="Margin">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
                  <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="133:8350" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="133:8351" data-name="Heading 1">
                      <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold'] font-bold justify-center leading-[0] relative shrink-0 text-[#1a1c16] text-[32px] tracking-[-1.6px] w-full" data-node-id="133:8352">
                        <p className="leading-[38.4px] mb-0">LOGIX /</p>
                        <p className="leading-[38.4px]">SPHERE</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="133:8353" data-name="Nav">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                  <div className="absolute content-stretch flex flex-col gap-[5px] items-start left-0 top-0 w-[174px]" data-node-id="133:8354">
                    <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="133:8355" data-name="Menu Item">
                      <MenuIcon className="h-[11px] relative shrink-0 w-[14px]"/>
                      <div className="relative shrink-0" data-node-id="I133:8355;129:6969" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I133:8355;129:6970">
                            <p className="leading-[12px]">Home</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="133:8356" data-name="Menu Item">
                      <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8356;129:6996" data-name="menu-icon">
                        <img alt="" className="figma-asset" src={imgMenuIcon}/>
                      </div>
                      <div className="relative shrink-0" data-node-id="I133:8356;129:6969" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I133:8356;129:6970">
                            <p className="leading-[12px]">Week Planner</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="133:8357" data-name="Menu Item">
                      <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8357;129:6996" data-name="menu-icon">
                        <div className="absolute inset-[-7.5%_-8.33%]">
                          <img alt="" className="figma-asset" src={imgMenuIcon1}/>
                        </div>
                      </div>
                      <div className="relative shrink-0" data-node-id="I133:8357;129:6969" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I133:8357;129:6970">
                            <p className="leading-[12px]">Route Balance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="133:8358" data-name="Menu Item">
                      <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8358;129:6996" data-name="menu-icon">
                        <div className="absolute inset-[0_0_-36.36%_0]">
                          <img alt="" className="figma-asset" src={imgMenuIcon2}/>
                        </div>
                      </div>
                      <div className="relative shrink-0" data-node-id="I133:8358;129:6969" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I133:8358;129:6970">
                            <p className="leading-[12px]">Daily Game Plan</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="133:8359" data-name="Menu Item">
                      <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8359;129:6996" data-name="menu-icon">
                        <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                      </div>
                      <div className="relative shrink-0" data-node-id="I133:8359;129:6969" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] uppercase whitespace-nowrap" data-node-id="I133:8359;129:6970">
                            <p className="leading-[12px]">Clearing Desk</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[174px]" data-node-id="133:8360" data-name="Menu Item">
                      <div className="bg-[#b2f746] border-[#003b3e] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-full" data-node-id="I133:8360;129:7018" data-name="Link">
                        <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8360;129:7043" data-name="menu-icon">
                          <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                        </div>
                        <div className="relative shrink-0" data-node-id="I133:8360;129:7026" data-name="Container">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                            <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I133:8360;129:7027">
                              <p className="leading-[12px]">Invoice</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="content-stretch cursor-pointer flex flex-col gap-[4px] items-start py-[8px] relative shrink-0 w-full" data-node-id="I133:8360;129:7028">
                        <SubmenuItem className="content-stretch flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]"/>
                        <Action className="content-stretch flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I133:8360;135:7305" data-name="Submenu-item">
                          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I133:8360;135:7305;129:6942" data-name="Container">
                            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I133:8360;135:7305;129:6943">{`Deductions & Recharges`}</p>
                          </div>
                        </Action>
                        <Action className="content-stretch flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I133:8360;135:7314" data-name="Submenu-item">
                          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I133:8360;135:7314;129:6942" data-name="Container">
                            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I133:8360;135:7314;129:6943">
                              Schedule for Payment
                            </p>
                          </div>
                        </Action>
                        <Action className="content-stretch flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I133:8360;135:7323" data-name="Submenu-item">
                          <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I133:8360;135:7323;129:6942" data-name="Container">
                            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I133:8360;135:7323;129:6943">
                              Invoices History
                            </p>
                          </div>
                        </Action>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0 w-full" data-node-id="133:8361" data-name="Container">
                <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[16px] relative size-full">
                  <div className="border-[#bfc8c9] border-solid border-t content-stretch flex flex-col gap-[8px] items-start pt-[17px] relative shrink-0 w-full" data-node-id="133:8362" data-name="HorizontalBorder">
                    <div className="relative shrink-0 w-full" data-node-id="133:8363" data-name="Link">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                        <div className="relative shrink-0 size-[11.667px]" data-node-id="133:8364" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer}/>
                        </div>
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[10px] whitespace-nowrap" data-node-id="133:8366">
                          <p className="leading-[15px]">SUPPORT</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative shrink-0 w-full" data-node-id="133:8367" data-name="Link">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                        <div className="h-[11.083px] relative shrink-0 w-[10.5px]" data-node-id="133:8368" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer1}/>
                        </div>
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[10px] whitespace-nowrap" data-node-id="133:8370">
                          <p className="leading-[15px]">SYSTEM STATUS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Action className="absolute block cursor-pointer right-[-10.5px] size-[24px] top-[107px]" data-node-id="133:8371">
            <img alt="" className="figma-asset" src={imgFrame2}/>
          </Action>
        </>)}
      {isClosed && (<>
          <div className="absolute bg-[#e9e9de] border-[#bfc8c9] border-r border-solid content-stretch flex flex-col inset-[0_16.9%_0_0] items-start justify-between overflow-clip pr-px py-[24px]" data-node-id="133:8373" data-name="Sidebar">
            <div className="h-[109px] relative shrink-0 w-full" data-node-id="133:8374" data-name="Margin">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
                <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-[65px]" data-node-id="133:8375" data-name="Container">
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-[34px]" data-node-id="133:8376" data-name="Heading 1">
                    <div className="h-[61.848px] relative shrink-0 w-[33.14px]" data-node-id="133:8377" data-name="L / S">
                      <img alt="" className="figma-asset" src={imgLS}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="133:8381" data-name="Nav">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0" data-node-id="133:8382">
                  <MenuItem className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]"/>
                  <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="133:8384" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8384;129:7003" data-name="menu-icon">
                      <img alt="" className="figma-asset" src={imgMenuIcon}/>
                    </div>
                  </Action>
                  <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="133:8385" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8385;129:7003" data-name="menu-icon">
                      <div className="absolute inset-[-7.5%_-8.33%]">
                        <img alt="" className="figma-asset" src={imgMenuIcon1}/>
                      </div>
                    </div>
                  </Action>
                  <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="133:8386" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8386;129:7003" data-name="menu-icon">
                      <div className="absolute inset-[0_0_-36.36%_0]">
                        <img alt="" className="figma-asset" src={imgMenuIcon2}/>
                      </div>
                    </div>
                  </Action>
                  <Action className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch cursor-pointer flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="133:8387" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8387;129:7003" data-name="menu-icon">
                      <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                    </div>
                  </Action>
                  <div className="bg-[#b2f746] border-[#003b3e] border-l-4 border-solid content-stretch flex h-[39px] items-center justify-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[58px]" data-node-id="133:8388" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I133:8388;129:7014" data-name="menu-icon">
                      <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-node-id="133:8389" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[16px] relative size-full">
                <div className="border-[#bfc8c9] border-solid border-t content-stretch flex flex-col gap-[8px] items-start pt-[17px] relative shrink-0 w-full" data-node-id="133:8390" data-name="HorizontalBorder">
                  <div className="relative shrink-0 w-full" data-node-id="133:8391" data-name="Link">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center relative size-full">
                      <div className="relative shrink-0 size-[11.667px]" data-node-id="133:8392" data-name="Container">
                        <img alt="" className="figma-asset" src={imgContainer}/>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0 w-full" data-node-id="133:8395" data-name="Link">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center justify-center relative size-full">
                      <div className="h-[11.083px] relative shrink-0 w-[10.5px]" data-node-id="133:8396" data-name="Container">
                        <img alt="" className="figma-asset" src={imgContainer1}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute flex items-center justify-center right-0 size-[24px] top-[107px]" data-node-id="133:8399">
            <div className="flex-none rotate-180">
              <Action className="block cursor-pointer relative size-[24px]">
                <img alt="" className="figma-asset" src={imgFrame3}/>
              </Action>
            </div>
          </div>
        </>)}
    </div>);
}
type UiTextInputProps = {
    className?: string;
    label?: string;
    state?: "Filled" | "Disabled";
    value?: string;
};
function UiTextInput({ className, label = "LABEL", state = "Disabled", value = "Placeholder..." }: UiTextInputProps) {
    const isFilled = state === "Filled";
    return (<div className={className || "content-stretch flex flex-col gap-[6px] h-[10px] items-start relative w-[280px]"} id={isFilled ? "node-50_4638" : "node-50_4634"}>
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="50:4635">
        {label}
      </p>
      <div className={`border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center overflow-clip px-[12px] relative shrink-0 w-full ${isFilled ? "bg-[#eeeee4]" : "bg-[#efefea]"}`} id={isFilled ? "node-50_4640" : "node-50_4636"} data-name="Field">
        {state === "Disabled" && (<DemoInput className="[word-break:break-word] flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] leading-[normal] min-w-px not-italic relative text-[#8a8a84] text-[12px]" data-node-id="50:4637" label={label} initialValue={value} disabled={String(state) === "Disabled"}/>)}
        {isFilled && (<DemoInput className="[word-break:break-word] flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] leading-[normal] min-w-px not-italic relative text-[#1a1c16] text-[12px]" data-node-id="50:4641" label={label} initialValue={value} disabled={String(state) === "Disabled"}/>)}
      </div>
    </div>);
}
type UiBadgeProps = {
    className?: string;
    label?: string;
    type?: "Success" | "Info";
};
function UiBadge({ className, label = "BADGE", type = "Success" }: UiBadgeProps) {
    const isInfo = type === "Info";
    return (<div className={className || `content-stretch flex items-center px-[8px] py-[3px] relative ${isInfo ? "bg-[#afedf3]" : "bg-[#b2f746]"}`} id={isInfo ? "node-17_2890" : "node-17_2887"}>
      {type === "Success" && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="17:2893">
          {label}
        </p>)}
      {isInfo && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="17:2896">
          {label}
        </p>)}
    </div>);
}
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="82:10061" data-name="Invoice Manangement - Invoice Processing Workflow">
      <div className="absolute bg-[#fafaef] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col items-start left-[400px] overflow-clip shadow-[0px_12px_32px_0px_rgba(26,28,23,0.2)] top-[120px] w-[640px] z-[4]" data-node-id="82:10062" data-name="Modal">
        <div className="bg-[#f3f3ec] border-[#e3e3d8] border-b border-solid content-stretch flex items-center justify-between overflow-clip px-[24px] py-[22px] relative shrink-0 w-full" data-node-id="82:10063" data-name="Header">
          <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[18px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:10064">
            GENERATE_INVOICE
          </p>
          <Action className="relative shrink-0 size-[24px]" data-node-id="82:10065" data-name="Close button" label="Close">
            <img alt="" className="figma-asset" src={imgCloseButton}/>
          </Action>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[8px] pt-[20px] px-[24px] relative shrink-0 w-full" data-node-id="82:10067" data-name="Body">
          <div className="bg-[#f3f3ec] border-[var(--green\/700,#446900)] border-l-4 border-solid content-stretch flex items-center justify-between overflow-clip px-[16px] py-[14px] relative shrink-0 w-full" data-node-id="82:10068" data-name="Record context">
            <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0" data-node-id="82:10069" data-name="Record">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:10070">
                REC-2025003 · CHARLOTTE WALKER
              </p>
              <div className="content-stretch flex gap-[8px] items-center overflow-clip relative shrink-0" data-node-id="82:10071" data-name="Meta">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="82:10072">
                  PERIOD SEP 2026
                </p>
                <UiBadge className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" label="READY FOR INVOICING" type="Info"/>
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-end leading-[normal] overflow-clip relative shrink-0 whitespace-nowrap" data-node-id="82:10074" data-name="Amount">
              <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:10075">
                AMOUNT
              </p>
              <p className="font-['Space_Grotesk:Bold'] font-bold relative shrink-0 text-[18px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10076">
                £643.41
              </p>
            </div>
          </div>
          <div className="content-start flex flex-wrap gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="82:10077" data-name="Invoice fields">
            <UiTextInput className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[592px]" label="INVOICE NUMBER" value="SELF BILLING INVOICE #20250331-CW"/>
            <UiTextInput className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[284px]" label="INVOICE DATE *" state="Filled" value="25/09/2026"/>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[284px]" data-node-id="82:10080" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:10080;89:60950">
                PAYMENT TERMS
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I82:10080;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I82:10080;89:60952">
                  NET 15
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I82:10080;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <UiTextInput className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[592px]" label="DUE DATE" value="25/09/2026 · NET 15 from invoice date"/>
          </div>
          <div className="[word-break:break-word] bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[8px] items-start leading-[normal] overflow-clip px-[16px] py-[14px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:10082" data-name="Invoice totals">
            <div className="content-stretch flex items-center justify-between not-italic overflow-clip relative shrink-0 w-full" data-node-id="82:10083" data-name="INVOICE SUBTOTAL · 12 WORKING DAYS">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:10084">
                INVOICE SUBTOTAL · 12 WORKING DAYS
              </p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10085">
                £643.41
              </p>
            </div>
            <div className="content-stretch flex items-center justify-between not-italic overflow-clip relative shrink-0 w-full" data-node-id="82:10086" data-name="VAT">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:10087">
                VAT
              </p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10088">
                £0.00
              </p>
            </div>
            <div className="content-stretch flex items-center justify-between not-italic overflow-clip relative shrink-0 w-full" data-node-id="82:10089" data-name="DEDUCTIONS">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:10090">
                DEDUCTIONS
              </p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10091">
                £0.00
              </p>
            </div>
            <div className="border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pt-[10px] relative shrink-0 w-full" data-node-id="82:10092" data-name="BALANCE DUE">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10093">
                BALANCE DUE
              </p>
              <p className="font-['Space_Grotesk:Bold'] font-bold relative shrink-0 text-[18px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10094">
                £643.41
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="82:10095" data-name="DELIVERY">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:10096">
              DELIVERY
            </p>
            <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="82:10097" data-name="UI/Checkbox" initial={true}>
              <div className="bg-[#446900] overflow-clip relative shrink-0 size-[18px]" data-node-id="I82:10097;89:60835" data-name="Box">
                <p className="[word-break:break-word] absolute font-['IBM_Plex_Mono:Bold'] leading-[normal] left-[3px] not-italic text-[13px] text-white top-0 whitespace-nowrap" data-node-id="I82:10097;89:60836">
                  ✓
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10097;89:60837">
                Email invoice to the subcontractor (c.walker@email.co.uk)
              </p>
            </DemoCheck>
            <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="82:10098" data-name="UI/Checkbox" initial={true}>
              <div className="bg-[#446900] overflow-clip relative shrink-0 size-[18px]" data-node-id="I82:10098;89:60835" data-name="Box">
                <p className="[word-break:break-word] absolute font-['IBM_Plex_Mono:Bold'] leading-[normal] left-[3px] not-italic text-[13px] text-white top-0 whitespace-nowrap" data-node-id="I82:10098;89:60836">
                  ✓
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10098;89:60837">
                Attach PDF copy
              </p>
            </DemoCheck>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between overflow-clip px-[24px] py-[20px] relative shrink-0 w-full" data-node-id="82:10099" data-name="Footer">
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="82:10100">
            STAGE 03 → 04
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="82:10101" data-name="Buttons">
            <Action className="border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="82:10102" data-name="UI/Button">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#446900] text-[12px] uppercase whitespace-nowrap" data-node-id="I82:10102;89:60779">
                CANCEL
              </p>
            </Action>
            <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch cursor-pointer flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="↗ PREVIEW PDF" type="Secondary"/>
            <UiButton className="bg-[#b2f746] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="GENERATE INVOICE"/>
          </div>
        </div>
      </div>
      <div className="absolute bg-[rgba(26,28,22,0.55)] h-[1508px] left-0 top-0 w-[1440px] z-[3]" data-node-id="82:10105" data-name="Overlay"/>
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="82:10107" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="82:10108" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I82:10108;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I82:10108;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I82:10108;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I82:10108;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:10108;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:10108;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:10108;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I82:10108;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I82:10108;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:10108;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:10108;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I82:10108;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I82:10108;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:10108;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:10108;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:10108;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I82:10108;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I82:10108;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I82:10108;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I82:10108;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I82:10108;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I82:10108;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="82:10109" data-name="Content">
          <div className="border-[#707979] border-b border-solid content-stretch flex items-center justify-between overflow-clip pb-[20px] relative shrink-0 w-full" data-node-id="82:10110" data-name="Page Title">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0 uppercase whitespace-nowrap" data-node-id="82:10111" data-name="Title">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10112">
                Invoice Processing Workflow
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:10113">
                FROM CURRENT PERIOD TO INVOICE · 30 RECORDS · SEP 2026 – SEP 2026
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="82:10114" data-name="Pipeline">
            <div className="bg-[var(--background\/card,white)] border-[#707979] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:10115" data-name="Stage / 01 · Current period">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10116">
                01 · Current period
              </p>
              <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:10117" data-name="Value">
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10118">
                  8
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10119">
                  £13,740.66
                </p>
              </div>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10120">
                AWAITING PERIOD CLOSE
              </p>
            </div>
            <div className="bg-[var(--background\/card,white)] border-[#ffa825] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:10121" data-name="Stage / 02 · Pending verification">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10122">
                02 · Pending verification
              </p>
              <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:10123" data-name="Value">
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10124">
                  12
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10125">
                  £20,766.33
                </p>
              </div>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10126">
                NEEDS VERIFICATION
              </p>
            </div>
            <div className="bg-[var(--background\/card,white)] border-[#27676c] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:10127" data-name="Stage / 03 · Ready for invoicing">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10128">
                03 · Ready for invoicing
              </p>
              <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:10129" data-name="Value">
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10130">
                  6
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10131">
                  £11,694.08
                </p>
              </div>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10132">
                READY TO GENERATE INVOICE
              </p>
            </div>
            <div className="bg-[var(--background\/card,white)] border-[#446900] border-solid border-t-4 content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip p-[16px] relative" data-node-id="82:10133" data-name="Stage / 04 · Invoiced">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10134">
                04 · Invoiced
              </p>
              <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:10135" data-name="Value">
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:10136">
                  4
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10137">
                  £7,209.30
                </p>
              </div>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10138">
                INVOICE ISSUED
              </p>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="82:10139" data-name="Records table">
            <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="82:10140" data-name="Table toolbar">
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH SUBCONTRACTOR OR RECORD ID..."/>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="82:10142" data-name="UI/Select">
                <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:10142;89:60940">
                  BATCH ACTION
                </p>
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 text-[#8a8a84] w-full whitespace-nowrap" data-node-id="I82:10142;89:60941" data-name="Field">
                  <p className="not-italic relative shrink-0 text-[12px]" data-node-id="I82:10142;89:60942">
                    MOVE TO NEXT STAGE
                  </p>
                  <p className="font-normal relative shrink-0 text-[14px]" data-node-id="I82:10142;89:60943" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    ▼
                  </p>
                </div>
              </div>
              <UiButton className="bg-[#efefea] content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="APPLY TO SELECTED" state="Disabled"/>
              <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="↓ EXPORT" type="Secondary"/>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="82:10145" data-name="Table">
              <InvoiceWorkflowTableHeader className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full"/>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10147" data-name="Row / REC-2025001">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10147;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10147;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10147;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10147;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10147;7:387">
                    REC-2025001
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10147;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10147;7:391">
                    Benjamin Harris
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10147;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10147;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10147;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10147;7:399">
                    £2,489.20
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10147;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10147;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10147;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10147;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10147;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10147;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10147;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10147;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10147;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10148" data-name="Row / REC-2025002">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10148;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10148;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10148;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10148;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10148;7:387">
                    REC-2025002
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10148;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10148;7:391">
                    James Anderson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10148;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10148;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10148;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10148;7:399">
                    £929.10
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10148;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10148;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10148;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10148;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10148;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10148;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10148;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10148;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10148;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10149" data-name="Row / REC-2025003">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10149;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10149;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10149;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10149;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10149;7:387">
                    REC-2025003
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10149;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10149;7:391">
                    Charlotte Walker
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10149;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10149;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10149;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10149;7:399">
                    £643.41
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10149;7:402" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10149;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10149;7:403;89:60870">
                      READY FOR INVOICING
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10149;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10149;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10149;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10149;7:407" data-name="ColAction">
                  <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10149;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10149;7:408;89:60769">
                      GENERATE INVOICE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10150" data-name="Row / REC-2025004">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10150;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10150;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10150;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10150;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10150;7:387">
                    REC-2025004
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10150;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10150;7:391">
                    Alexander Lee
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10150;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10150;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10150;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10150;7:399">
                    £2,546.77
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10150;7:402" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10150;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10150;7:403;89:60870">
                      READY FOR INVOICING
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10150;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10150;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10150;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10150;7:407" data-name="ColAction">
                  <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10150;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10150;7:408;89:60769">
                      GENERATE INVOICE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10151" data-name="Row / REC-2025005">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10151;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10151;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10151;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10151;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10151;7:387">
                    REC-2025005
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10151;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10151;7:391">
                    Emma Wilson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10151;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10151;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10151;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10151;7:399">
                    £1,670.29
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10151;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10151;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10151;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10151;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10151;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10151;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10151;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10151;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10151;7:408;89:60777">
                      SCHEDULE PAYMENT
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10152" data-name="Row / REC-2025006">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10152;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10152;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10152;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10152;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10152;7:387">
                    REC-2025006
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10152;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10152;7:391">
                    Maria Garcia
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10152;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10152;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10152;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10152;7:399">
                    £1,798.10
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10152;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10152;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10152;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10152;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10152;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10152;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10152;7:407" data-name="ColAction"/>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10153" data-name="Row / REC-2025007">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10153;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10153;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10153;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10153;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10153;7:387">
                    REC-2025007
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10153;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10153;7:391">
                    Maria Garcia
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10153;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10153;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10153;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10153;7:399">
                    £1,324.02
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10153;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10153;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10153;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10153;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10153;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10153;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10153;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10153;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10153;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10154" data-name="Row / REC-2025008">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10154;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10154;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10154;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10154;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10154;7:387">
                    REC-2025008
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10154;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10154;7:391">
                    Olivia Taylor
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10154;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10154;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10154;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10154;7:399">
                    £2,102.02
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10154;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10154;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10154;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10154;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10154;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10154;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10154;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10154;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10154;7:408;89:60777">
                      SCHEDULE PAYMENT
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10155" data-name="Row / REC-2025009">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10155;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10155;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10155;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10155;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10155;7:387">
                    REC-2025009
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10155;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10155;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10155;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10155;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10155;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10155;7:399">
                    £2,697.66
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10155;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10155;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10155;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10155;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10155;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10155;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10155;7:407" data-name="ColAction"/>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10156" data-name="Row / REC-2025010">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10156;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10156;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10156;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10156;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10156;7:387">
                    REC-2025010
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10156;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10156;7:391">
                    Sarah Brown
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10156;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10156;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10156;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10156;7:399">
                    £3,011.18
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10156;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10156;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10156;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10156;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10156;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10156;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10156;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10156;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10156;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10157" data-name="Row / REC-2025027">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10157;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10157;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10157;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10157;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10157;7:387">
                    REC-2025027
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10157;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10157;7:391">
                    Mia Rodriguez
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10157;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10157;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10157;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10157;7:399">
                    £1,529.47
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10157;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10157;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10157;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10157;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10157;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10157;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10157;7:407" data-name="ColAction"/>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10158" data-name="Row / REC-2025028">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10158;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10158;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10158;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10158;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10158;7:387">
                    REC-2025028
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10158;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10158;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10158;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10158;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10158;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10158;7:399">
                    £1,442.86
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10158;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10158;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10158;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10158;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10158;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10158;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex h-[28px] items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10158;7:407" data-name="ColAction"/>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10159" data-name="Row / REC-2025029">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10159;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10159;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10159;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10159;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10159;7:387">
                    REC-2025029
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10159;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10159;7:391">
                    Robert Johnson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10159;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10159;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10159;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10159;7:399">
                    £2,240.20
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10159;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10159;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10159;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10159;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10159;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10159;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10159;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10159;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10159;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:10160" data-name="Row / REC-2025030">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:10160;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:10160;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:10160;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I82:10160;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:10160;7:387">
                    REC-2025030
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:10160;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:10160;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:10160;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:10160;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[120px]" data-node-id="I82:10160;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:10160;7:399">
                    £573.77
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I82:10160;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:10160;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10160;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[80px]" data-node-id="I82:10160;36:5923" data-name="ColView">
                  <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10160;36:5924" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:10160;36:5924;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[170px]" data-node-id="I82:10160;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:10160;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:10160;7:408;89:60777">
                      SCHEDULE PAYMENT
                    </p>
                  </Action>
                </div>
              </SearchRow>
            </div>
            <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pb-[4px] pt-[16px] px-[24px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:10161" data-name="Total footer">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10162">
                SHOWING 14 OF 30 RECORDS
              </p>
              <div className="content-stretch flex gap-[12px] items-baseline overflow-clip relative shrink-0" data-node-id="82:10163" data-name="Total">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:10164">
                  GRAND TOTAL
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:10165">
                  £53,410.37
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="82:10166" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
