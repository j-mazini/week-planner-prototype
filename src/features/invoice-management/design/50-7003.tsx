import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgSearchIcon = '/invoice-management/assets/figma-0c250c777346a295.svg';
const imgChevronLeft = '/invoice-management/assets/figma-ebbe63159e6a7863.svg';
const imgChevronRight = '/invoice-management/assets/figma-cb5acc867f5709cd.svg';
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
const imgCloseIcon = '/invoice-management/assets/figma-663d16bf23f38d8f.svg';
const imgContainer2 = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-bfe6a15e94d69238.svg';
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
    size?: "md";
    state?: "Default";
    type?: "Primary" | "Secondary";
};
function UiButton({ className, label = "Button", size = "md", state = "Default", type = "Primary" }: UiButtonProps) {
    const isSecondaryAndMdAndDefault = type === "Secondary" && size === "md" && state === "Default";
    return (<Action className={className || `border border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative ${isSecondaryAndMdAndDefault ? "bg-[#f5f5f4] border-[#bfc8c9]" : "bg-[#b2f746] border-[#446900]"}`} id={isSecondaryAndMdAndDefault ? "node-90_13006" : "node-90_13001"} label={label}>
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13017">
        {label}
      </p>
    </Action>);
}
type DeductionsTypeItemActiveProps = {
    className?: string;
    amount?: string;
    count?: string;
    label?: string;
    showAdd?: boolean;
    sub?: string;
};
function DeductionsTypeItemActive({ className, amount = "£937.00", count = "5 REG.", label = "Repairs & damages", showAdd = true, sub = "Veículos e danos" }: DeductionsTypeItemActiveProps) {
    return (<div className={className || "bg-[var(--lime\\/500,#b2f746)] border-[var(--text\\/primary,#1a1c16)] border-l-4 border-solid content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative w-[300px]"} data-node-id="50:4662" data-name="Deductions/TypeItem/Active">
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:4663" data-name="Top">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4664">
          {label}
        </p>
        <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="50:4665" data-name="Meta">
          <div className="bg-[var(--background\/card,white)] content-stretch flex items-center overflow-clip px-[8px] py-[3px] relative shrink-0" data-node-id="50:4666" data-name="Count tag">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4667">
              {count}
            </p>
          </div>
          {showAdd && (<Action className="bg-[var(--text\/primary,#1a1c16)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="50:4668" data-name="Add" label="Add: Repairs">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--lime\/500,#b2f746)] whitespace-nowrap" data-node-id="50:4669">
                +
              </p>
            </Action>)}
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-full whitespace-nowrap" data-node-id="50:4670" data-name="Bottom">
        <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px]" data-node-id="50:4671">
          {sub}
        </p>
        <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[22px]" data-node-id="50:4672">
          {amount}
        </p>
      </div>
    </div>);
}
type DeductionsTypeItemDefaultProps = {
    className?: string;
    amount?: string;
    count?: string;
    label?: string;
    showAdd?: boolean;
    sub?: string;
};
function DeductionsTypeItemDefault({ className, amount = "£937.00", count = "5 REG.", label = "Repairs & damages", showAdd = true, sub = "Veículos e danos" }: DeductionsTypeItemDefaultProps) {
    return (<div className={className || "border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative w-[300px]"} data-node-id="50:4651" data-name="Deductions/TypeItem/Default">
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:4652" data-name="Top">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] uppercase whitespace-nowrap" data-node-id="50:4653">
          {label}
        </p>
        <div className="content-stretch flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="50:4654" data-name="Meta">
          <div className="bg-[var(--background\/card,white)] content-stretch flex items-center overflow-clip px-[8px] py-[3px] relative shrink-0" data-node-id="50:4655" data-name="Count tag">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4656">
              {count}
            </p>
          </div>
          {showAdd && (<Action className="bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="50:4657" data-name="Add" label="Add: Repairs">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:4658">
                +
              </p>
            </Action>)}
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="50:4659" data-name="Bottom">
        <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="50:4660">
          {sub}
        </p>
        <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="50:4661">
          {amount}
        </p>
      </div>
    </div>);
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
type ActionsNavigationButtonProps = {
    className?: string;
    property1?: "next" | "preview";
};
function ActionsNavigationButton({ className, property1 = "preview" }: ActionsNavigationButtonProps) {
    const isNext = property1 === "next";
    return (<div className={className || "bg-[#f4f4e9] border border-[#bfc8c9] border-solid content-stretch flex items-start p-[6px] relative"} id={isNext ? "node-36_545" : "node-36_542"}>
      {property1 === "preview" && (<div className="relative shrink-0 size-[10px]" data-node-id="36:543" data-name="chevron-left">
          <img alt="" className="figma-asset" src={imgChevronLeft}/>
        </div>)}
      {isNext && (<div className="relative shrink-0 size-[10px]" data-node-id="36:546" data-name="chevron-right">
          <img alt="" className="figma-asset" src={imgChevronRight}/>
        </div>)}
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
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="50:7003" data-name="Invoice Manangement - Deductions e Recharges">
      <div className="absolute bg-[#fafaef] border border-[#d1d1c4] border-solid content-stretch flex flex-col items-start left-[360px] overflow-clip shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-[72px] w-[720px] z-[4]" data-node-id="50:7004" data-name="Modal">
        <div className="bg-[#f4f4e9] border-[#d1d1c4] border-b border-solid content-stretch flex items-center justify-between overflow-clip px-[24px] py-[20px] relative shrink-0 w-full" data-node-id="50:7005" data-name="Header">
          <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0" data-node-id="50:7006" data-name="Title">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[18px] uppercase whitespace-nowrap" data-node-id="50:7007">
              Other
            </p>
          </div>
          <Action className="relative shrink-0 size-[14px]" data-node-id="71:5335" data-name="Close Icon" label="Close">
            <div className="absolute inset-[-5.36%]">
              <img alt="" className="figma-asset" src={imgCloseIcon}/>
            </div>
          </Action>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[24px] pt-[20px] px-[24px] relative shrink-0 w-full" data-node-id="50:7010" data-name="Body">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="50:7011" data-name="Deductions/Stepper">
            <div className="border-[var(--lime\/500,#b2f746)] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:7011;50:4688" data-name="Step 1 · done">
              <div className="bg-[var(--lime\/500,#b2f746)] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:7011;50:4689" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="I50:7011;50:4690">
                  ✓
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="I50:7011;50:4691">
                Basic information
              </p>
            </div>
            <div className="border-[var(--green\/700,#446900)] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:7011;50:4692" data-name="Step 2 · active">
              <div className="bg-[var(--green\/700,#446900)] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:7011;50:4693" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap" data-node-id="I50:7011;50:4694">
                  2
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="I50:7011;50:4695">
                Details and documents
              </p>
            </div>
            <div className="border-[#e3e3d8] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:7011;50:4696" data-name="Step 3 · todo">
              <div className="bg-[#efefea] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:7011;50:4697" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I50:7011;50:4698">
                  3
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[11px] uppercase whitespace-nowrap" data-node-id="I50:7011;50:4699">
                Review and confirmation
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-node-id="50:7012" data-name="UI/Textarea">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:7012;89:60877">
              DESCRIPTION
            </p>
            <div className="bg-[#f4f4e9] border border-[#d1d1c4] border-solid content-stretch flex flex-col h-[100px] items-start overflow-clip px-[12px] py-[10px] relative shrink-0 w-full" data-node-id="I50:7012;89:60878" data-name="Field">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[11px] w-full" data-node-id="I50:7012;89:60879">
                Describe the reason for the deduction...
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 w-full" data-node-id="50:7013" data-name="Installments preview">
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[#1a1c16] text-[11px] whitespace-nowrap" data-node-id="50:7014">
              INSTALLMENT PREVIEW
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap" data-node-id="50:7015">
              This deduction will be split into 1 installment:
            </p>
            <div className="border border-[#d1d1c4] border-solid content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="50:7016" data-name="Table">
              <div className="bg-[#f4f4e9] content-stretch flex font-['IBM_Plex_Mono:SemiBold'] gap-[8px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0 text-[#1a1c16] text-[11px] uppercase w-full" data-node-id="50:7017" data-name="Head">
                <p className="relative shrink-0 w-[40px]" data-node-id="50:7018">
                  #
                </p>
                <p className="flex-[1_0_0] min-w-px relative" data-node-id="50:7019">
                  Reference
                </p>
                <p className="relative shrink-0 w-[130px]" data-node-id="50:7020">
                  Date
                </p>
                <p className="relative shrink-0 text-right w-[120px]" data-node-id="50:7021">
                  Value
                </p>
              </div>
              <div className="border-[#d1d1c4] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0 text-[12px] w-full" data-node-id="50:7022" data-name="Row">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#1a1c16] w-[40px]" data-node-id="50:7023">
                  1
                </p>
                <p className="flex-[1_0_0] font-['IBM_Plex_Mono:SemiBold'] min-w-px relative text-[#1a1c16]" data-node-id="50:7024">
                  OTH-SSTAN-240926-001
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#1a1c16] w-[130px]" data-node-id="50:7025">
                  25/09/2026
                </p>
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[#095358] text-right w-[120px]" data-node-id="50:7026">
                  £60.00
                </p>
              </div>
              <div className="bg-[#f4f4e9] border-[#1a1c16] border-solid border-t-2 content-stretch flex font-['IBM_Plex_Mono:SemiBold'] gap-[8px] items-center overflow-clip px-[12px] py-[10px] relative shrink-0 text-[12px] w-full" data-node-id="50:7027" data-name="Total">
                <p className="relative shrink-0 text-[#1a1c16] w-[40px]" data-node-id="50:7028">
                  ​
                </p>
                <p className="flex-[1_0_0] min-w-px relative text-[#1a1c16]" data-node-id="50:7029">
                  TOTAL
                </p>
                <p className="relative shrink-0 text-[#1a1c16] w-[130px]" data-node-id="50:7030">
                  ​
                </p>
                <p className="relative shrink-0 text-[#095358] text-right w-[120px]" data-node-id="50:7031">
                  £60.00
                </p>
              </div>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[10px] items-start overflow-clip relative shrink-0 w-full" data-node-id="50:7032" data-name="Upload">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[11px] whitespace-nowrap" data-node-id="50:7033">
              DOCUMENTS
            </p>
            <div className="bg-[#fafaef] border border-[#8a8a84] border-dashed content-stretch flex flex-col gap-[12px] items-center overflow-clip py-[28px] relative shrink-0 w-full" data-node-id="50:7034" data-name="Dropzone">
              <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] relative shrink-0 text-[#6b7280] text-[24px] whitespace-nowrap" data-node-id="50:7035">
                ↑
              </p>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap" data-node-id="50:7036">
                Drag files here or click to select
              </p>
              <Action className="bg-[#f4f4e9] border border-[#d1d1c4] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="50:7037" data-name="UI/Button">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="I50:7037;89:60771">
                  Select files
                </p>
              </Action>
            </div>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between overflow-clip px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="50:7038" data-name="Footer">
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[11px] whitespace-nowrap" data-node-id="50:7039">
            STEP 2 OF 3
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="50:7040" data-name="Buttons">
            <Action className="border border-[#111827] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="50:7041" data-name="UI/Button">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#446900] text-[12px] uppercase whitespace-nowrap" data-node-id="I50:7041;89:60779">
                Cancel
              </p>
            </Action>
            <Action className="bg-[#f4f4e9] border border-[#d1d1c4] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="50:7042" data-name="UI/Button">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="I50:7042;89:60771">
                ← Previous
              </p>
            </Action>
            <Action className="bg-[#a3e635] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="50:7043" data-name="UI/Button">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="I50:7043;89:60761">
                Next →
              </p>
            </Action>
          </div>
        </div>
      </div>
      <div className="absolute bg-[rgba(26,28,22,0.55)] inset-0 z-[3]" data-node-id="50:7044" data-name="Overlay"/>
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="50:7046" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="50:7047" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I50:7047;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I50:7047;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I50:7047;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I50:7047;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:7047;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:7047;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:7047;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I50:7047;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I50:7047;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:7047;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:7047;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I50:7047;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I50:7047;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:7047;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:7047;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:7047;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I50:7047;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I50:7047;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I50:7047;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I50:7047;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I50:7047;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I50:7047;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="50:7048" data-name="Content">
          <div className="[word-break:break-word] border-[#707979] border-b border-solid content-stretch flex flex-col gap-[6px] items-start overflow-clip pb-[20px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:7049" data-name="Page Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)] uppercase" data-node-id="50:7050">{`Deductions & Recharges`}</p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:7051">
              Operational recharges per courier · September 2026
            </p>
          </div>
          <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="50:7052" data-name="Filters">
            <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex gap-[12px] items-center overflow-clip px-[8px] py-[6px] relative shrink-0" data-node-id="50:7053" data-name="Month switcher">
              <ActionsNavigationButton className="bg-[#f4f4e9] border border-[#bfc8c9] border-solid content-stretch flex items-start p-[6px] relative shrink-0"/>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7055">
                September 2026
              </p>
              <ActionsNavigationButton className="bg-[#f4f4e9] border border-[#bfc8c9] border-solid content-stretch flex items-start p-[6px] relative shrink-0" property1="next"/>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="50:7057" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:7057;89:60950">
                SERVICE PARTNER
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I50:7057;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I50:7057;89:60952">
                  All service partners
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I50:7057;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH COURIER OR ID..."/>
            <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="Export" type="Secondary"/>
          </div>
          <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="50:7060" data-name="Desk">
            <div className="border-[var(--border\/default,#bfc8c9)] border-r border-solid content-stretch flex flex-col items-start overflow-clip relative self-stretch shrink-0 w-[300px]" data-node-id="50:7061" data-name="Types list">
              <div className="content-stretch flex items-center justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:7062" data-name="List header">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7063">
                  Deduction types
                </p>
                <div className="bg-[#003b3e] content-stretch flex items-start overflow-clip px-[8px] py-[3px] relative shrink-0" data-node-id="50:7064" data-name="Tag">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap" data-node-id="50:7065">
                    6 TIPOS
                  </p>
                </div>
              </div>
              <div className="bg-[#efefea] content-stretch flex items-start overflow-clip px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="50:7066" data-name="Group">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7067">
                  SEP 2026 · BA Express
                </p>
              </div>
              <DeductionsTypeItemDefault amount="£3,812.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="10 REG." label="Total" showAdd={false} sub="All categories"/>
              <DeductionsTypeItemDefault className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" sub="Vehicles and damages"/>
              <DeductionsTypeItemDefault amount="£2,775.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="4 REG." label="Pre-payments" sub="Advances"/>
              <DeductionsTypeItemDefault amount="£0.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="0 REG." label="Liquidation damages" sub="Failures and AWB"/>
              <DeductionsTypeItemDefault amount="£100.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="1 REG." label="Traffic penalties" sub="PCNs and fines"/>
              <DeductionsTypeItemActive amount="£0.00" className="bg-[var(--lime\/500,#b2f746)] border-[var(--text\/primary,#1a1c16)] border-l-4 border-solid content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative shrink-0 w-full" count="0 REG." label="Other" sub="Miscellaneous deductions"/>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip pt-[20px] px-[24px] relative" data-node-id="50:7074" data-name="Centre">
              <div className="bg-[var(--background\/card,white)] border border-[#707979] border-solid content-stretch flex items-start relative shrink-0 w-full" data-node-id="50:7075" data-name="Type card">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px overflow-clip pb-[24px] pt-[32px] px-[28px] relative" data-node-id="50:7076" data-name="Info">
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[30px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:7077">
                    OTHER
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] min-w-full not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)] w-[min-content]" data-node-id="50:7078">
                    Other deductions that do not fit the categories above.
                  </p>
                  <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip pt-[8px] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:7079" data-name="Details">
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:7080" data-name="Registros">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:7081">
                        RECORDS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:7082">
                        0
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:7083" data-name="Período">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:7084">
                        PERIOD:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:7085">
                        SEP 2026
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:7086" data-name="Status">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:7087">
                        STATUS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:7088">
                        —
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-start left-[23px] overflow-clip px-[12px] py-[4px] top-[-13px]" data-node-id="50:7089" data-name="Type tag">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:7090">
                    TYPE: OTHER
                  </p>
                </div>
                <div className="bg-[#f3f3ec] border-[#8a8a84] border-dashed border-l content-stretch flex flex-col gap-[16px] items-center justify-center overflow-clip relative self-stretch shrink-0 w-[200px]" data-node-id="50:7091" data-name="New entry action">
                  <div className="bg-[var(--background\/card,white)] border-2 border-[#003b3e] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[88px]" data-node-id="50:7092" data-name="Square">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] relative shrink-0 text-[#003b3e] text-[44px] whitespace-nowrap" data-node-id="50:7093">
                      +
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[13px] whitespace-nowrap" data-node-id="50:7094">
                    NEW ENTRY
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7095">
                Type summary
              </p>
              <div className="[word-break:break-word] bg-[var(--background\/card,white)] content-stretch flex gap-[12px] items-start not-italic overflow-clip p-[16px] relative shrink-0 text-[14px] w-full whitespace-nowrap" data-node-id="50:7096" data-name="Summary">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:7097" data-name="Registros">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:7098">
                    Records
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:7099">
                    0
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:7100" data-name="Valor">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:7101">
                    Value
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:7102">
                    £0.00
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:7103" data-name="Tipos">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:7104">
                    Types
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:7105">
                    0
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:7106" data-name="Couriers">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:7107">
                    Couriers
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:7108">
                    0
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7109">
                Records
              </p>
              <div className="bg-[var(--background\/card,white)] content-stretch flex flex-col items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:7110" data-name="Records">
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col gap-[16px] items-center overflow-clip py-[40px] relative shrink-0 w-full" data-node-id="50:7111" data-name="Empty state">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="50:7112">
                    No Other entries in Sep 2026.
                  </p>
                  <UiButton className="bg-[#b2f746] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="+ New entry"/>
                </div>
              </div>
            </div>
            <div className="border-[var(--border\/default,#bfc8c9)] border-l border-solid content-stretch flex flex-col items-start overflow-clip relative self-stretch shrink-0 w-[260px]" data-node-id="50:7114" data-name="By courier">
              <div className="border-[#e3e3d8] border-b-3 border-solid content-stretch flex flex-col items-end overflow-clip pb-[8px] pt-[4px] px-[16px] relative shrink-0 w-full" data-node-id="50:7115" data-name="Total head">
                <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#003b3e] text-[24px] whitespace-nowrap" data-node-id="50:7116">
                  £0.00
                </p>
              </div>
              <div className="border-[var(--border\/default,#bfc8c9)] border-b border-solid content-stretch flex items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:7117" data-name="Label">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:7118">
                  Per courier · 0
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip pt-[8px] px-[8px] relative shrink-0 w-full" data-node-id="50:7119" data-name="Slots">
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7120" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7121" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7122" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7123" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7124" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:7125" data-name="Empty slot"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="50:7126" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
