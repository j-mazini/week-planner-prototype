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
const imgOuter = '/invoice-management/assets/figma-21b7899e4b87a33f.svg';
const imgInner = '/invoice-management/assets/figma-5310df45b9133edd.svg';
const imgOuter1 = '/invoice-management/assets/figma-01a7f9b0f6af47fa.svg';
const imgOuter2 = '/invoice-management/assets/figma-996069e1a5694559.svg';
const imgCloseButton = '/invoice-management/assets/figma-1d35d8482efa50be.svg';
const imgContainer2 = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-4092b096549796d0.svg';
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
function SchedulePaymentTableHeader({ className }: {
    className?: string;
}) {
    return (<div className={className || "border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative w-[1297px]"} data-node-id="78:5615" data-name="SchedulePayment/TableHeader">
      <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="78:5616" data-name="ColCheck">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5617">
          SEL
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="78:5618" data-name="ColID">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5619">
          INVOICE
        </p>
      </div>
      <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="78:5620" data-name="ColSub">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5621">
          SUBCONTRACTOR / PERIOD
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[140px]" data-node-id="78:5622" data-name="ColDate">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5623">
          PAYMENT DATE
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="78:5624" data-name="ColAmount">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5625">
          GROSS
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[150px]" data-node-id="78:5626" data-name="ColDed">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5627">
          DEDUCTION
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="78:5628" data-name="ColNet">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5629">
          NET
        </p>
      </div>
      <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="78:5630" data-name="ColStatus">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5631">
          STATUS
        </p>
      </div>
      <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="78:5632" data-name="ColAction">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="78:5633">
          ACTIONS
        </p>
      </div>
    </div>);
}
type UiButtonProps = {
    className?: string;
    label?: string;
    size?: "md";
    state?: "Default";
    type?: "Primary" | "Brand";
};
function UiButton({ className, label = "Button", size = "md", state = "Default", type = "Primary" }: UiButtonProps) {
    const isBrandAndMdAndDefault = type === "Brand" && size === "md" && state === "Default";
    return (<Action className={className || `content-stretch flex h-[36px] items-center justify-center px-[16px] relative ${isBrandAndMdAndDefault ? "bg-[#446900]" : "bg-[#b2f746] border border-[#446900] border-solid"}`} id={isBrandAndMdAndDefault ? "node-90_13014" : "node-90_13001"} label={label}>
      {type === "Primary" && size === "md" && state === "Default" && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13017">
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
type UiRadioProps = {
    className?: string;
    label?: string;
    state?: "Unchecked" | "Checked" | "Disabled";
};
function UiRadio({ className, label = "Option", state = "Checked" }: UiRadioProps) {
    const isDisabled = state === "Disabled";
    const isUnchecked = state === "Unchecked";
    return (<div className={className || "content-stretch flex gap-[8px] items-center relative"} id={isDisabled ? "node-78_5588" : isUnchecked ? "node-78_5585" : "node-78_5581"}>
      <div className="relative shrink-0 size-[18px]" id={isDisabled ? "node-78_5589" : isUnchecked ? "node-78_5586" : "node-78_5582"} data-name="Outer">
        <img alt="" className="figma-asset" src={isDisabled ? imgOuter2 : isUnchecked ? imgOuter1 : imgOuter}/>
      </div>
      {state === "Checked" && (<div className="absolute left-[5px] size-[8px] top-[5px]" data-node-id="78:5583" data-name="Inner">
          <img alt="" className="figma-asset" src={imgInner}/>
        </div>)}
      {["Checked", "Unchecked"].includes(state) && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="78:5584">
          {label}
        </p>)}
      {isDisabled && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#d1d1c7] text-[12px] whitespace-nowrap" data-node-id="78:5590">
          {label}
        </p>)}
    </div>);
}
type UiTextInputProps = {
    className?: string;
    label?: string;
    state?: "Disabled" | "Focus";
    value?: string;
};
function UiTextInput({ className, label = "LABEL", state = "Disabled", value = "Placeholder..." }: UiTextInputProps) {
    const isFocus = state === "Focus";
    return (<div className={className || "content-stretch flex flex-col gap-[6px] h-[10px] items-start relative w-[280px]"} id={isFocus ? "node-51_2053" : "node-50_4634"}>
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="50:4635">
        {label}
      </p>
      <div className={`border-solid content-stretch flex h-[36px] items-center overflow-clip px-[12px] relative shrink-0 w-full ${isFocus ? "bg-[#eeeee4] border-2 border-[#27676c]" : "bg-[#efefea] border border-[#bfc8c9]"}`} id={isFocus ? "node-51_2055" : "node-50_4636"} data-name="Field">
        <DemoInput className="[word-break:break-word] flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] leading-[normal] min-w-px not-italic relative text-[#8a8a84] text-[12px]" data-node-id="50:4637" label={label} initialValue={value} disabled={String(state) === "Disabled"}/>
      </div>
    </div>);
}
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="82:7814" data-name="Invoice Manangement - Schedule for Payment">
      <div className="absolute bg-[#fafaef] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col items-start left-[420px] overflow-clip shadow-[0px_12px_32px_0px_rgba(26,28,23,0.25)] top-[120px] w-[600px] z-[4]" data-node-id="82:7815" data-name="Modal">
        <div className="bg-[#f3f3ec] border-[#e3e3d8] border-b border-solid content-stretch flex items-center justify-between overflow-clip px-[24px] py-[22px] relative shrink-0 w-full" data-node-id="82:7816" data-name="Header">
          <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[18px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:7817">
            EDIT_PAYMENT_DATE
          </p>
          <Action className="relative shrink-0 size-[24px]" data-node-id="82:7818" data-name="Close button" label="Close">
            <img alt="" className="figma-asset" src={imgCloseButton}/>
          </Action>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[8px] pt-[20px] px-[24px] relative shrink-0 w-full" data-node-id="82:7820" data-name="Body">
          <div className="[word-break:break-word] bg-[#f3f3ec] border-[var(--green\/700,#446900)] border-l-4 border-solid content-stretch flex items-center justify-between leading-[normal] overflow-clip px-[16px] py-[14px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:7821" data-name="Invoice context">
            <div className="content-stretch flex flex-col gap-[4px] items-start not-italic overflow-clip relative shrink-0" data-node-id="82:7822" data-name="Invoice">
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:7823">
                INV-2025002 · BENJAMIN GARCIA
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:7824">
                PERIOD SEP 2026 · RUN #1
              </p>
            </div>
            <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7825" data-name="Net">
              <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:7826">
                NET PAYMENT
              </p>
              <p className="font-['Space_Grotesk:Bold'] font-bold relative shrink-0 text-[18px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:7827">
                £1,827.24
              </p>
            </div>
          </div>
          <div className="content-stretch flex gap-[16px] items-end overflow-clip relative shrink-0 w-full" data-node-id="82:7828" data-name="Dates">
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px relative" label="CURRENT PAYMENT DATE" value="25 SEP 2026 · THU"/>
            <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] relative shrink-0 text-[20px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="82:7830">
              →
            </p>
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px relative" label="NEW PAYMENT DATE *" state="Focus" value="25 SEP 2026 · THU"/>
          </div>
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] w-full" data-node-id="82:7832">
            PAYMENTS RUN ON THURSDAYS (DHL PAYMENT CYCLE). THE NEW DATE MUST BE A THURSDAY AFTER TODAY.
          </p>
          <div className="content-stretch flex flex-col gap-[12px] items-start overflow-clip relative shrink-0 w-full" data-node-id="82:7833" data-name="Apply to">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:7834">
              APPLY TO
            </p>
            <UiRadio className="content-stretch flex gap-[8px] items-center relative shrink-0" label="THIS INVOICE ONLY · INV-2025002"/>
            <UiRadio className="content-stretch flex gap-[8px] items-center relative shrink-0" label="ALL SCHEDULED INVOICES IN RUN #1 · 29" state="Unchecked"/>
            <UiRadio className="content-stretch flex gap-[8px] items-center relative shrink-0" label="SELECTED INVOICES · 0 SELECTED" state="Disabled"/>
          </div>
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-node-id="82:7838" data-name="UI/Textarea">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:7838;89:60877">
              REASON FOR CHANGE *
            </p>
            <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-col h-[100px] items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="I82:7838;89:60878" data-name="Field">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[11px] w-full" data-node-id="I82:7838;89:60879">
                E.G. BANK HOLIDAY, SUBCONTRACTOR REQUEST, PENDING DOCUMENTS...
              </p>
            </div>
          </div>
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] w-full" data-node-id="82:7839">
            THE SUBCONTRACTOR WILL BE NOTIFIED OF THE NEW PAYMENT DATE.
          </p>
        </div>
        <div className="content-stretch flex items-center justify-between overflow-clip px-[24px] py-[20px] relative shrink-0 w-full" data-node-id="82:7840" data-name="Footer">
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="82:7841">
            RUN #1 · DHL PAYMENT CYCLE
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="82:7842" data-name="Buttons">
            <Action className="border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="82:7843" data-name="UI/Button">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#446900] text-[12px] uppercase whitespace-nowrap" data-node-id="I82:7843;89:60779">
                CANCEL
              </p>
            </Action>
            <UiButton className="bg-[#b2f746] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="SAVE NEW DATE"/>
          </div>
        </div>
      </div>
      <div className="absolute bg-[rgba(26,28,22,0.55)] inset-0 z-[3]" data-node-id="82:7845" data-name="Overlay"/>
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="82:7847" data-name="Main">
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="82:7848" data-name="Content">
          <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="82:7849" data-name="Navigation/Navbar-RouteBalance">
            <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I82:7849;89:57150" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I82:7849;89:57151" data-name="Margin"/>
                <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I82:7849;89:57152" data-name="Margin">
                  <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I82:7849;89:57153" data-name="Container">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:7849;89:57154" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:7849;89:57155" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:7849;89:57156">
                          <p className="leading-[16.5px]">25/09/2026 11:20</p>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I82:7849;89:57157" data-name="Margin">
                      <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I82:7849;89:57158" data-name="Vertical Divider"/>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:7849;89:57159">
                      <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:7849;89:57160" data-name="Container">
                        <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I82:7849;89:57161" data-name="Background+Border">
                          <div className="relative shrink-0 size-[20px]" data-node-id="I82:7849;89:57162" data-name="Container">
                            <img alt="" className="figma-asset" src={imgContainer2}/>
                          </div>
                        </div>
                      </div>
                      <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:7849;89:57164" data-name="Container">
                        <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:7849;89:57165" data-name="Container">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:7849;89:57166">
                            <p className="leading-[16.5px]">João</p>
                          </div>
                        </div>
                        <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I82:7849;89:57167">
                          <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                            <img alt="" className="figma-asset" src={imgVector1}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I82:7849;89:57168" data-name="Container">
                  <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I82:7849;89:57169" data-name="Input">
                    <div className="flex-[1_0_0] min-w-px relative" data-node-id="I82:7849;89:57170" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I82:7849;89:57171">
                          <p className="leading-[normal]">SEARCH SYSTEM...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I82:7849;89:57172" data-name="Container"/>
                </div>
              </div>
            </div>
          </div>
          <div className="[word-break:break-word] border-[#707979] border-b border-solid content-stretch flex flex-col gap-[6px] items-start overflow-clip pb-[20px] relative shrink-0 uppercase w-full whitespace-nowrap" data-node-id="82:7850" data-name="Page Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:7851">
              Schedule for Payment
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:7852">
              30 INVOICES SCHEDULED · DHL PAYMENT CYCLE
            </p>
          </div>
          <div className="bg-[#003b3e] content-stretch flex items-center justify-between overflow-clip px-[28px] py-[24px] relative shrink-0 w-full" data-node-id="82:7853" data-name="Next payment run">
            <div className="content-stretch flex flex-col gap-[6px] items-start overflow-clip relative shrink-0" data-node-id="82:7854" data-name="Run">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#b2f746] text-[11px] uppercase whitespace-nowrap" data-node-id="82:7855">
                NEXT PAYMENT RUN · RUN #1
              </p>
              <div className="content-stretch flex gap-[16px] items-center overflow-clip relative shrink-0" data-node-id="82:7856" data-name="Date row">
                <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[#fafaef] text-[32px] uppercase whitespace-nowrap" data-node-id="82:7857">
                  25 SEP 2026
                </p>
                <div className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="82:7858" data-name="Edit run date">
                  <p className="[word-break:break-word] font-['Material_Icons:Regular'] font-normal leading-[14px] relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7858;89:60769" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    edit
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[#c9d6d3] text-[12px] uppercase whitespace-nowrap" data-node-id="82:7859">
                THURSDAY · DHL PAYMENT CYCLE · 30 INVOICES · 1 ON HOLD · 1 RESCHEDULED
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex gap-[40px] items-start overflow-clip relative shrink-0 whitespace-nowrap" data-node-id="82:7860" data-name="Totals">
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7861" data-name="Metric / Valor bruto">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7862">
                  GROSS AMOUNT
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#fafaef] text-[24px]" data-node-id="82:7863">
                  £61,099.99
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7864" data-name="Metric / Deduções">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7865">
                  DEDUCTIONS
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#ffb4a8] text-[24px]" data-node-id="82:7866">
                  − £4,089.19
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-end overflow-clip relative shrink-0" data-node-id="82:7867" data-name="Metric / Líquido a pagar">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#c9d6d3] text-[11px] uppercase" data-node-id="82:7868">
                  NET PAYABLE
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#b2f746] text-[24px]" data-node-id="82:7869">
                  £57,010.80
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="82:7870" data-name="Payments table">
            <div className="content-stretch flex gap-[12px] items-center overflow-clip relative shrink-0 w-full" data-node-id="82:7871" data-name="Table toolbar">
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH INVOICE OR SUBCONTRACTOR..."/>
              <div className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="82:7873" data-name="Edit selected date">
                <p className="[word-break:break-word] font-['Material_Icons:Regular'] font-normal leading-[16px] relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="I82:7873;89:60771" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  edit
                </p>
              </div>
              <UiButton className="bg-[#446900] content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="MARK SELECTED AS PAID" type="Brand"/>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="82:7875" data-name="Table">
              <SchedulePaymentTableHeader className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full"/>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7877" data-name="Row / INV-2025001">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7877;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7877;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7877;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7877;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7877;10:1152">
                    INV-2025001
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7877;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7877;10:1156">
                    Charlotte Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7877;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7877;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7877;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7877;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7877;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7877;10:1164">
                    £2,219.95
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7877;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7877;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7877;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7877;10:1177">
                    £2,219.95
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7877;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7877;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7877;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7877;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7877;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7877;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7878" data-name="Row / INV-2025002">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7878;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7878;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7878;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7878;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7878;10:1152">
                    INV-2025002
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7878;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7878;10:1156">
                    Benjamin Garcia
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7878;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7878;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7878;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7878;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7878;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7878;10:1164">
                    £1,968.64
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7878;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7878;10:1168">
                    − £141.40
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7878;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7878;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7878;10:1177">
                    £1,827.24
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7878;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7878;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7878;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7878;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7878;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7878;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7879" data-name="Row / INV-2025003">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7879;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7879;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7879;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7879;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7879;10:1152">
                    INV-2025003
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7879;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7879;10:1156">
                    Amelia Clark
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7879;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7879;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7879;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7879;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7879;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7879;10:1164">
                    £1,873.48
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7879;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7879;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7879;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7879;10:1177">
                    £1,873.48
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7879;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7879;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7879;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7879;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7879;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7879;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7880" data-name="Row / INV-2025004">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7880;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7880;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7880;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7880;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7880;10:1152">
                    INV-2025004
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7880;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7880;10:1156">
                    Benjamin Chen
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7880;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 text-[color:var(--green\/700,#446900)] w-[140px] whitespace-nowrap" data-node-id="I82:7880;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px]" data-node-id="I82:7880;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px]" data-node-id="I82:7880;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7880;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7880;10:1164">
                    £1,774.28
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7880;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7880;10:1168">
                    − £93.74
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7880;28:1358">
                    FAILED DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7880;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7880;10:1177">
                    £1,680.54
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7880;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7880;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7880;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7880;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7880;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7880;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7881" data-name="Row / INV-2025005">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7881;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7881;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7881;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7881;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7881;10:1152">
                    INV-2025005
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7881;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7881;10:1156">
                    Alexander Harris
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7881;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7881;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7881;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7881;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7881;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7881;10:1164">
                    £2,006.63
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7881;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7881;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7881;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7881;10:1177">
                    £2,006.63
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7881;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7881;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7881;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7881;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7881;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7881;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7882" data-name="Row / INV-2025006">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7882;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7882;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7882;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7882;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7882;10:1152">
                    INV-2025006
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7882;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7882;10:1156">
                    William Taylor
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7882;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7882;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7882;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7882;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7882;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7882;10:1164">
                    £2,897.28
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7882;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7882;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7882;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7882;10:1177">
                    £2,897.28
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7882;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7882;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7882;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7882;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7882;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7882;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7883" data-name="Row / INV-2025007">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7883;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7883;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7883;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7883;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7883;10:1152">
                    INV-2025007
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7883;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7883;10:1156">
                    Alexander Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7883;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7883;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7883;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7883;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7883;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7883;10:1164">
                    £2,162.95
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7883;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7883;10:1168">
                    − £295.35
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7883;28:1358">
                    LATE DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7883;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7883;10:1177">
                    £1,867.60
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7883;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7883;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7883;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7883;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7883;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7883;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7884" data-name="Row / INV-2025008">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7884;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7884;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7884;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7884;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7884;10:1152">
                    INV-2025008
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7884;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7884;10:1156">
                    Olivia Martinez
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7884;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7884;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7884;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7884;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7884;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7884;10:1164">
                    £1,967.22
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7884;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7884;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7884;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7884;10:1177">
                    £1,967.22
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7884;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7884;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7884;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7884;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7884;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7884;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7885" data-name="Row / INV-2025009">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7885;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7885;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7885;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7885;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7885;10:1152">
                    INV-2025009
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7885;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7885;10:1156">
                    Isabella Lee
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7885;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7885;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7885;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7885;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7885;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7885;10:1164">
                    £2,908.77
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7885;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7885;10:1168">
                    − £353.21
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7885;28:1358">
                    INSURANCE
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7885;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7885;10:1177">
                    £2,555.56
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7885;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7885;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7885;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7885;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7885;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7885;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7886" data-name="Row / INV-2025010">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7886;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7886;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7886;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7886;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7886;10:1152">
                    INV-2025010
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7886;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7886;10:1156">
                    Daniel Wilson
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7886;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7886;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7886;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7886;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7886;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7886;10:1164">
                    £2,012.69
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7886;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7886;10:1168">
                    − £192.22
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7886;28:1358">
                    LATE DELIVERY
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7886;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7886;10:1177">
                    £1,820.47
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7886;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7886;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7886;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7886;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7886;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7886;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7887" data-name="Row / INV-2025011">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7887;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7887;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7887;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7887;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7887;10:1152">
                    INV-2025011
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7887;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7887;10:1156">
                    Sarah Walker
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7887;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7887;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7887;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7887;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7887;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7887;10:1164">
                    £2,999.90
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7887;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7887;10:1168">
                    − £415.45
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7887;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7887;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7887;10:1177">
                    £2,584.45
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7887;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7887;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7887;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7887;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7887;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7887;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7888" data-name="Row / INV-2025029">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7888;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7888;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7888;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7888;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7888;10:1152">
                    INV-2025029
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7888;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7888;10:1156">
                    Sarah Thomas
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7888;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7888;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7888;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7888;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7888;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7888;10:1164">
                    £1,720.09
                  </p>
                </div>
                <div className="content-stretch flex flex-col gap-[2px] h-[16px] items-end justify-center relative shrink-0 w-[150px]" data-node-id="I82:7888;10:1167" data-name="ColDed">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I82:7888;10:1168">
                    —
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7888;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7888;10:1177">
                    £1,720.09
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7888;10:1180" data-name="ColStatus">
                  <div className="bg-[#ffdad6] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7888;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7888;10:1181;89:60866">
                      ON HOLD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7888;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7888;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7888;10:1186;89:60777">
                      RELEASE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:7889" data-name="Row / INV-2025030">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I82:7889;10:1145" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I82:7889;10:1146" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I82:7889;10:1146;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:7889;10:1151" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:7889;10:1152">
                    INV-2025030
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] h-[17px] items-start justify-center leading-[normal] min-w-px relative whitespace-nowrap" data-node-id="I82:7889;10:1155" data-name="ColSub">
                  <p className="font-['Space_Grotesk:Medium'] font-medium overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis" data-node-id="I82:7889;10:1156">
                    David Harris
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="I82:7889;28:1357">
                    SEP 2026
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex gap-[8px] items-center leading-[normal] not-italic relative shrink-0 w-[140px] whitespace-nowrap" data-node-id="I82:7889;28:1354" data-name="ColDate">
                  <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#707979] text-[12px]" data-node-id="I82:7889;28:1355">
                    25 SEP 2026
                  </p>
                  <p className="font-['Material_Icons:Regular'] relative shrink-0 text-[14px] text-[color:var(--green\/700,#446900)]" data-node-id="I82:7889;28:1356">
                    edit
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[100px]" data-node-id="I82:7889;10:1163" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7889;10:1164">
                    £1,540.70
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex flex-col font-['IBM_Plex_Mono:SemiBold'] gap-[2px] h-[16px] items-end justify-center leading-[normal] not-italic relative shrink-0 text-[#ba1a1a] w-[150px] whitespace-nowrap" data-node-id="I82:7889;10:1167" data-name="ColDed">
                  <p className="relative shrink-0 text-[12px]" data-node-id="I82:7889;10:1168">
                    − £193.98
                  </p>
                  <p className="relative shrink-0 text-[11px]" data-node-id="I82:7889;28:1358">
                    ADMIN FEE
                  </p>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7889;10:1176" data-name="ColNet">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:7889;10:1177">
                    £1,346.72
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[100px]" data-node-id="I82:7889;10:1180" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:7889;10:1181" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:7889;10:1181;89:60870">
                      SCHEDULED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start justify-end relative shrink-0 w-[110px]" data-node-id="I82:7889;10:1185" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:7889;10:1186" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:7889;10:1186;89:60777">
                      MARK PAID
                    </p>
                  </Action>
                </div>
              </SearchRow>
            </div>
            <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pb-[4px] pt-[16px] px-[24px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:7890" data-name="Total footer">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7891">
                SHOWING 13 OF 30 INVOICES
              </p>
              <div className="content-stretch flex gap-[32px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7892" data-name="Totals">
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7893" data-name="Total / Bruto">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7894">
                    GROSS
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:7895">
                    £61,099.99
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7896" data-name="Total / Deduções">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7897">
                    DEDUCTIONS
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#ba1a1a] text-[24px]" data-node-id="82:7898">
                    − £4,089.19
                  </p>
                </div>
                <div className="content-stretch flex gap-[8px] items-baseline overflow-clip relative shrink-0" data-node-id="82:7899" data-name="Total / Líquido">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:7900">
                    NET
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:7901">
                    £57,010.80
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="82:7902" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
