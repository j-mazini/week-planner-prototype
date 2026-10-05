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
const imgVector1 = '/invoice-management/assets/figma-1f7b1437be272fb5.svg';
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
type UiButtonProps = {
    className?: string;
    label?: string;
    size?: "md";
    state?: "Default";
    type?: "Primary" | "Secondary" | "Ghost";
};
function UiButton({ className, label = "Button", size = "md", state = "Default", type = "Primary" }: UiButtonProps) {
    const isGhostAndMdAndDefault = type === "Ghost" && size === "md" && state === "Default";
    const isSecondaryAndMdAndDefault = type === "Secondary" && size === "md" && state === "Default";
    return (<Action className={className || `border border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative ${isGhostAndMdAndDefault ? "border-[#111827]" : isSecondaryAndMdAndDefault ? "bg-[#f5f5f4] border-[#bfc8c9]" : "bg-[#b2f746] border-[#446900]"}`} id={isGhostAndMdAndDefault ? "node-90_13010" : isSecondaryAndMdAndDefault ? "node-90_13006" : "node-90_13001"} label={label}>
      {size === "md" && state === "Default" && ["Primary", "Secondary"].includes(type) && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13017">
          {label}
        </p>)}
      {isGhostAndMdAndDefault && (<p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#446900] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13026">
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
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="50:5727" data-name="Invoice Manangement - Deductions e Recharges">
      <div className="absolute bg-[#fafaef] border border-[#d1d1c4] border-solid content-stretch flex flex-col items-start left-[360px] overflow-clip shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-[72px] w-[720px] z-[4]" data-node-id="50:5728" data-name="Modal">
        <div className="bg-[#f4f4e9] border-[#d1d1c4] border-b border-solid content-stretch flex items-center justify-between overflow-clip px-[24px] py-[20px] relative shrink-0 w-full" data-node-id="50:5729" data-name="Header">
          <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0" data-node-id="50:5730" data-name="Title">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[18px] uppercase whitespace-nowrap" data-node-id="50:5731">
              Pre-payments
            </p>
          </div>
          <Action className="relative shrink-0 size-[14px]" data-node-id="71:5325" data-name="Close Icon" label="Close">
            <div className="absolute inset-[-5.36%]">
              <img alt="" className="figma-asset" src={imgCloseIcon}/>
            </div>
          </Action>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[24px] pt-[20px] px-[24px] relative shrink-0 w-full" data-node-id="50:5734" data-name="Body">
          <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full" data-node-id="50:5735" data-name="Deductions/Stepper">
            <div className="border-[var(--green\/700,#446900)] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:5735;50:4675" data-name="Step 1 · active">
              <div className="bg-[var(--green\/700,#446900)] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:5735;50:4676" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap" data-node-id="I50:5735;50:4677">
                  1
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="I50:5735;50:4678">
                Basic information
              </p>
            </div>
            <div className="border-[#e3e3d8] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:5735;50:4679" data-name="Step 2 · todo">
              <div className="bg-[#efefea] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:5735;50:4680" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I50:5735;50:4681">
                  2
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[11px] uppercase whitespace-nowrap" data-node-id="I50:5735;50:4682">
                Details and documents
              </p>
            </div>
            <div className="border-[#e3e3d8] border-b-3 border-solid content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px overflow-clip pb-[10px] relative" data-node-id="I50:5735;50:4683" data-name="Step 3 · todo">
              <div className="bg-[#efefea] content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[22px]" data-node-id="I50:5735;50:4684" data-name="Num">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="I50:5735;50:4685">
                  3
                </p>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#8a8a84] text-[11px] uppercase whitespace-nowrap" data-node-id="I50:5735;50:4686">
                Review and confirmation
              </p>
            </div>
          </div>
          <div className="content-start flex flex-wrap gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="50:5736" data-name="Fields">
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-[327px] relative" label="REFERENCE" value="Auto-generated"/>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[normal] min-w-[327px] relative" data-node-id="50:5738" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:5738;89:60950">
                VENDOR *
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I50:5738;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I50:5738;89:60952">
                  Pedro Monte
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I50:5738;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-[327px] relative" label="TOTAL VALUE *" state="Filled" value="£1,000.00"/>
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-[327px] relative" label="PAYMENT DATE *" state="Filled" value="25/09/2026"/>
            <UiTextInput className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-[327px] relative" label="START MONTH" state="Filled" value="October 2026"/>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[normal] min-w-[327px] relative" data-node-id="50:5742" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:5742;89:60950">
                INSTALLMENTS
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I50:5742;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I50:5742;89:60952">
                  2 installments
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I50:5742;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start leading-[normal] min-w-[327px] relative" data-node-id="50:5743" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:5743;89:60950">
                FEE *
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I50:5743;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I50:5743;89:60952">
                  £25.00 per installment
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I50:5743;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <p className="[word-break:break-word] flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] leading-[normal] min-w-[327px] not-italic relative text-[#6b7280] text-[11px]" data-node-id="50:5744">
              Month in which the first deduction starts. If left blank, deductions start in the current month.
            </p>
          </div>
        </div>
        <div className="content-stretch flex items-center justify-between overflow-clip px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="50:5745" data-name="Footer">
          <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[11px] whitespace-nowrap" data-node-id="50:5746">
            STEP 1 OF 3
          </p>
          <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="50:5747" data-name="Buttons">
            <UiButton className="border border-[#111827] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="Cancel" type="Ghost"/>
            <UiButton className="bg-[#b2f746] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="Next →"/>
          </div>
        </div>
      </div>
      <div className="absolute bg-[rgba(26,28,22,0.55)] inset-0 z-[3]" data-node-id="50:5750" data-name="Overlay"/>
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="50:5752" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="50:5753" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I50:5753;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I50:5753;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I50:5753;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I50:5753;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:5753;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:5753;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:5753;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I50:5753;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I50:5753;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:5753;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:5753;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I50:5753;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I50:5753;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:5753;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:5753;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:5753;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I50:5753;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I50:5753;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I50:5753;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I50:5753;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I50:5753;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I50:5753;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="50:5754" data-name="Content">
          <div className="[word-break:break-word] border-[#707979] border-b border-solid content-stretch flex flex-col gap-[6px] items-start overflow-clip pb-[20px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5755" data-name="Page Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)] uppercase" data-node-id="50:5756">{`Deductions & Recharges`}</p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:5757">
              Operational recharges per courier · September 2026
            </p>
          </div>
          <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="50:5758" data-name="Filters">
            <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex gap-[12px] items-center overflow-clip px-[8px] py-[6px] relative shrink-0" data-node-id="50:5759" data-name="Month switcher">
              <ActionsNavigationButton className="bg-[#f4f4e9] border border-[#bfc8c9] border-solid content-stretch flex items-start p-[6px] relative shrink-0"/>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5761">
                September 2026
              </p>
              <ActionsNavigationButton className="bg-[#f4f4e9] border border-[#bfc8c9] border-solid content-stretch flex items-start p-[6px] relative shrink-0" property1="next"/>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="50:5763" data-name="UI/Select">
              <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I50:5763;89:60950">
                SERVICE PARTNER
              </p>
              <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I50:5763;89:60951" data-name="Field">
                <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I50:5763;89:60952">
                  All service partners
                </p>
                <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I50:5763;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                  ▼
                </p>
              </div>
            </div>
            <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH COURIER OR ID..."/>
            <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="Export" type="Secondary"/>
          </div>
          <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="50:5766" data-name="Desk">
            <div className="border-[var(--border\/default,#bfc8c9)] border-r border-solid content-stretch flex flex-col items-start overflow-clip relative self-stretch shrink-0 w-[300px]" data-node-id="50:5767" data-name="Types list">
              <div className="content-stretch flex items-center justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:5768" data-name="List header">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5769">
                  Deduction types
                </p>
                <div className="bg-[#003b3e] content-stretch flex items-start overflow-clip px-[8px] py-[3px] relative shrink-0" data-node-id="50:5770" data-name="Tag">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap" data-node-id="50:5771">
                    6 TIPOS
                  </p>
                </div>
              </div>
              <div className="bg-[#efefea] content-stretch flex items-start overflow-clip px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="50:5772" data-name="Group">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5773">
                  SEP 2026 · BA Express
                </p>
              </div>
              <DeductionsTypeItemDefault amount="£3,812.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="10 REG." label="Total" showAdd={false} sub="All categories"/>
              <DeductionsTypeItemDefault className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" sub="Vehicles and damages"/>
              <DeductionsTypeItemActive amount="£2,775.00" className="bg-[var(--lime\/500,#b2f746)] border-[var(--text\/primary,#1a1c16)] border-l-4 border-solid content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative shrink-0 w-full" count="4 REG." label="Pre-payments" sub="Advances"/>
              <DeductionsTypeItemDefault amount="£0.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="0 REG." label="Liquidation damages" sub="Failures and AWB"/>
              <DeductionsTypeItemDefault amount="£100.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="1 REG." label="Traffic penalties" sub="PCNs and fines"/>
              <DeductionsTypeItemDefault amount="£0.00" className="border-[#e3e3d8] border-b border-solid content-stretch flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" count="0 REG." label="Other" sub="Miscellaneous deductions"/>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip pt-[20px] px-[24px] relative" data-node-id="50:5780" data-name="Centre">
              <div className="bg-[var(--background\/card,white)] border border-[#707979] border-solid content-stretch flex items-start relative shrink-0 w-full" data-node-id="50:5781" data-name="Type card">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px overflow-clip pb-[24px] pt-[32px] px-[28px] relative" data-node-id="50:5782" data-name="Info">
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[30px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:5783">
                    PRE-PAYMENTS
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] min-w-full not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)] w-[min-content]" data-node-id="50:5784">
                    Advances to the courier, deducted in installments with a fee.
                  </p>
                  <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip pt-[8px] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:5785" data-name="Details">
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:5786" data-name="Registros">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:5787">
                        RECORDS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:5788">
                        4
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:5789" data-name="Período">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:5790">
                        PERIOD:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:5791">
                        SEP 2026
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:5792" data-name="Status">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:5793">
                        STATUS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:5794">
                        4 PENDING
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-start left-[23px] overflow-clip px-[12px] py-[4px] top-[-13px]" data-node-id="50:5795" data-name="Type tag">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:5796">
                    TYPE: PRE-PAYMENTS
                  </p>
                </div>
                <div className="bg-[#f3f3ec] border-[#8a8a84] border-dashed border-l content-stretch flex flex-col gap-[16px] items-center justify-center overflow-clip relative self-stretch shrink-0 w-[200px]" data-node-id="50:5797" data-name="New entry action">
                  <div className="bg-[var(--background\/card,white)] border-2 border-[#003b3e] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[88px]" data-node-id="50:5798" data-name="Square">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] relative shrink-0 text-[#003b3e] text-[44px] whitespace-nowrap" data-node-id="50:5799">
                      +
                    </p>
                  </div>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[13px] whitespace-nowrap" data-node-id="50:5800">
                    NEW ENTRY
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5801">
                Type summary
              </p>
              <div className="[word-break:break-word] bg-[var(--background\/card,white)] content-stretch flex gap-[12px] items-start not-italic overflow-clip p-[16px] relative shrink-0 text-[14px] w-full whitespace-nowrap" data-node-id="50:5802" data-name="Summary">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:5803" data-name="Registros">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:5804">
                    Records
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5805">
                    4
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:5806" data-name="Valor">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:5807">
                    Value
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5808">
                    £2,775.00
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:5809" data-name="Tipos">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:5810">
                    Types
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5811">
                    1
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:5812" data-name="Couriers">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:5813">
                    Couriers
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5814">
                    4
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5815">
                Records
              </p>
              <div className="bg-[var(--background\/card,white)] content-stretch flex flex-col items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:5816" data-name="Records">
                <div className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:5817" data-name="DeductionsV2/TableHeader">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:5817;50:4715" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:5817;50:4716">
                      ID
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:5817;50:4717" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:5817;50:4718">
                      COURIER
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:5817;50:4719" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:5817;50:4720">
                      VALUE
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:5817;50:4721" data-name="ColStatus">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:5817;50:4722">
                      STATUS
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:5817;50:4723" data-name="ColAction">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:5817;50:4724">{` `}</p>
                  </div>
                </div>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:5818" data-name="Row / PRP-PMONTE-100926-105">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:5818;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:5818;50:4727">
                      PRP-PMONTE-100926-105
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:5818;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:5818;50:4729">
                      Pedro Monte
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:5818;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:5818;50:4731">
                      £1,025.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:5818;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:5818;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5818;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:5818;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:5818;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5818;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:5819" data-name="Row / PRP-PJORGEVELOSO-280826-101">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:5819;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:5819;50:4727">
                      PRP-PJORGEVELOSO-280826-101
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:5819;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:5819;50:4729">
                      Paulo Jorge Veloso
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:5819;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:5819;50:4731">
                      £525.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:5819;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:5819;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5819;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:5819;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:5819;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5819;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:5820" data-name="Row / PRP-JDIGIACOMONETO-080726-003">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:5820;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:5820;50:4727">
                      PRP-JDIGIACOMONETO-080726-003
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:5820;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:5820;50:4729">
                      Julio Di Giacomo Neto
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:5820;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:5820;50:4731">
                      £700.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:5820;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:5820;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5820;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:5820;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:5820;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5820;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:5821" data-name="Row / PRP-SSTAN-060726-004">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:5821;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:5821;50:4727">
                      PRP-SSTAN-060726-004
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:5821;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:5821;50:4729">
                      Silviu Stan
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:5821;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:5821;50:4731">
                      £525.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:5821;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:5821;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5821;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:5821;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:5821;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:5821;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pt-[14px] px-[12px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5822" data-name="Total">
                  <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase" data-node-id="50:5823">
                    Total · 4 records
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[22px] text-[color:var(--teal\/800,#095358)]" data-node-id="50:5824">
                    £2,775.00
                  </p>
                </div>
              </div>
            </div>
            <div className="border-[var(--border\/default,#bfc8c9)] border-l border-solid content-stretch flex flex-col items-start overflow-clip relative self-stretch shrink-0 w-[260px]" data-node-id="50:5825" data-name="By courier">
              <div className="border-[#e3e3d8] border-b-3 border-solid content-stretch flex flex-col items-end overflow-clip pb-[8px] pt-[4px] px-[16px] relative shrink-0 w-full" data-node-id="50:5826" data-name="Total head">
                <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#003b3e] text-[24px] whitespace-nowrap" data-node-id="50:5827">
                  £2,775.00
                </p>
              </div>
              <div className="border-[var(--border\/default,#bfc8c9)] border-b border-solid content-stretch flex items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:5828" data-name="Label">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:5829">
                  Per courier · 4
                </p>
              </div>
              <div className="content-stretch flex flex-col gap-[8px] items-start overflow-clip pt-[8px] px-[8px] relative shrink-0 w-full" data-node-id="50:5830" data-name="Slots">
                <div className="[word-break:break-word] bg-[var(--background\/card,white)] border border-[#e3e3d8] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] overflow-clip p-[12px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5831" data-name="Courier / Pedro Monte">
                  <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:5832" data-name="Row">
                    <p className="font-['Space_Grotesk:Medium'] font-medium relative shrink-0 text-[13px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5833">
                      Pedro Monte
                    </p>
                    <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[12px] text-[color:var(--teal\/800,#095358)]" data-node-id="50:5834">
                      £1,025.00
                    </p>
                  </div>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:5835">
                    1 record
                  </p>
                </div>
                <div className="[word-break:break-word] bg-[var(--background\/card,white)] border border-[#e3e3d8] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] overflow-clip p-[12px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5836" data-name="Courier / Julio Di Giacomo Neto">
                  <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:5837" data-name="Row">
                    <p className="font-['Space_Grotesk:Medium'] font-medium relative shrink-0 text-[13px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5838">
                      Julio Di Giacomo Neto
                    </p>
                    <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[12px] text-[color:var(--teal\/800,#095358)]" data-node-id="50:5839">
                      £700.00
                    </p>
                  </div>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:5840">
                    1 record
                  </p>
                </div>
                <div className="[word-break:break-word] bg-[var(--background\/card,white)] border border-[#e3e3d8] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] overflow-clip p-[12px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5841" data-name="Courier / Paulo Jorge Veloso">
                  <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:5842" data-name="Row">
                    <p className="font-['Space_Grotesk:Medium'] font-medium relative shrink-0 text-[13px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5843">
                      Paulo Jorge Veloso
                    </p>
                    <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[12px] text-[color:var(--teal\/800,#095358)]" data-node-id="50:5844">
                      £525.00
                    </p>
                  </div>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:5845">
                    1 record
                  </p>
                </div>
                <div className="[word-break:break-word] bg-[var(--background\/card,white)] border border-[#e3e3d8] border-solid content-stretch flex flex-col gap-[4px] items-start leading-[normal] overflow-clip p-[12px] relative shrink-0 w-full whitespace-nowrap" data-node-id="50:5846" data-name="Courier / Silviu Stan">
                  <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="50:5847" data-name="Row">
                    <p className="font-['Space_Grotesk:Medium'] font-medium relative shrink-0 text-[13px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:5848">
                      Silviu Stan
                    </p>
                    <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[12px] text-[color:var(--teal\/800,#095358)]" data-node-id="50:5849">
                      £525.00
                    </p>
                  </div>
                  <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="50:5850">
                    1 record
                  </p>
                </div>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:5851" data-name="Empty slot"/>
                <div className="border border-[var(--border\/default,#bfc8c9)] border-dashed content-stretch flex flex-col h-[64px] items-start p-[12px] relative shrink-0 w-full" data-node-id="50:5852" data-name="Empty slot"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="50:5853" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
