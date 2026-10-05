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
    size?: "md";
    state?: "Default";
    type?: "Secondary";
};
function UiButton({ className, label = "Button", size = "md", state = "Default", type = "Secondary" }: UiButtonProps) {
    return (<Action className={className || "bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative"} data-node-id="90:13006" label={label}>
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="90:13022">
        {label}
      </p>
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
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="82:8787" data-name="Invoice Manangement - Invoices History">
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="82:8789" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="82:9138" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I82:9138;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I82:9138;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I82:9138;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I82:9138;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:9138;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:9138;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:9138;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I82:9138;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I82:9138;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:9138;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I82:9138;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I82:9138;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I82:9138;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I82:9138;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I82:9138;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I82:9138;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I82:9138;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I82:9138;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I82:9138;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I82:9138;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I82:9138;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I82:9138;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="82:8791" data-name="Content">
          <div className="[word-break:break-word] border-[#707979] border-b border-solid content-stretch flex flex-col gap-[6px] items-start overflow-clip pb-[20px] relative shrink-0 uppercase w-full whitespace-nowrap" data-node-id="82:8792" data-name="Page Title">
            <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:8793">
              Invoices History
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:8794">
              PAID INVOICES · 25 SEP 2026 – 25 SEP 2026
            </p>
          </div>
          <div className="[word-break:break-word] content-stretch flex gap-[16px] items-start not-italic overflow-clip relative shrink-0 w-full" data-node-id="82:8795" data-name="KPIs">
            <div className="bg-[#f4f4e9] border-[#003b3e] border-l-4 border-solid content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-[64px] items-start min-w-px px-[16px] py-[12px] relative" data-node-id="82:8796" data-name="Cards/StatCard">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[12px] relative shrink-0 text-[#707979] text-[10px] uppercase w-full" data-node-id="I82:8796;89:57305">
                TOTAL PAID IN PERIOD
              </p>
              <p className="font-['IBM_Plex_Mono:Bold'] leading-[24px] relative shrink-0 text-[#003b3e] text-[18px] w-full" data-node-id="I82:8796;89:57306">
                £26,056.81
              </p>
            </div>
            <div className="bg-[#f4f4e9] border-[#003b3e] border-l-4 border-solid content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-[64px] items-start min-w-px px-[16px] py-[12px] relative" data-node-id="82:8797" data-name="Cards/StatCard">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[12px] relative shrink-0 text-[#707979] text-[10px] uppercase w-full" data-node-id="I82:8797;89:57305">
                INVOICES
              </p>
              <p className="font-['IBM_Plex_Mono:Bold'] leading-[24px] relative shrink-0 text-[#003b3e] text-[18px] w-full" data-node-id="I82:8797;89:57306">
                16
              </p>
            </div>
            <div className="bg-[#f4f4e9] border-[#003b3e] border-l-4 border-solid content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-[64px] items-start min-w-px px-[16px] py-[12px] relative" data-node-id="82:8798" data-name="Cards/StatCard">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[12px] relative shrink-0 text-[#707979] text-[10px] uppercase w-full" data-node-id="I82:8798;89:57305">
                Subcontractors
              </p>
              <p className="font-['IBM_Plex_Mono:Bold'] leading-[24px] relative shrink-0 text-[#003b3e] text-[18px] w-full" data-node-id="I82:8798;89:57306">
                11
              </p>
            </div>
            <div className="bg-[#f4f4e9] border-[#003b3e] border-l-4 border-solid content-stretch flex flex-[1_0_0] flex-col gap-[4px] h-[64px] items-start min-w-px px-[16px] py-[12px] relative" data-node-id="82:8799" data-name="Cards/StatCard">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[12px] relative shrink-0 text-[#707979] text-[10px] uppercase w-full" data-node-id="I82:8799;89:57305">
                AVERAGE INVOICE
              </p>
              <p className="font-['IBM_Plex_Mono:Bold'] leading-[24px] relative shrink-0 text-[#003b3e] text-[18px] w-full" data-node-id="I82:8799;89:57306">
                £1,628.55
              </p>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="82:8800" data-name="Invoices table">
            <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="82:8801" data-name="Filters">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="82:8802" data-name="UI/Select">
                <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:8802;89:60950">
                  PERIOD
                </p>
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I82:8802;89:60951" data-name="Field">
                  <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I82:8802;89:60952">
                    25 SEP 2026 — 25 SEP 2026
                  </p>
                  <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I82:8802;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    ▼
                  </p>
                </div>
              </div>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="82:8803" data-name="UI/Select">
                <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I82:8803;89:60950">
                  SUBCONTRACTOR
                </p>
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I82:8803;89:60951" data-name="Field">
                  <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I82:8803;89:60952">
                    All subcontractors
                  </p>
                  <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I82:8803;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    ▼
                  </p>
                </div>
              </div>
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex flex-[1_0_0] gap-[8px] h-[36px] items-center min-w-px px-[12px] relative" placeholder="SEARCH INVOICE NUMBER..."/>
              <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="EXPORT CSV"/>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="82:8806" data-name="Table">
              <div className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="91:13686" data-name="InvoicesHistory/TableHeader">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="91:13687" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="91:13688">
                    INVOICE
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="91:13689" data-name="ColSub">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="91:13690">
                    SUBCONTRACTOR
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="91:13691" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] uppercase whitespace-nowrap" data-node-id="91:13692">
                    PAYMENT DATE ↓
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="91:13693" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] uppercase whitespace-nowrap" data-node-id="91:13694">
                    AMOUNT
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="91:13695" data-name="ColStatus">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="91:13696">
                    STATUS
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[98px]" data-node-id="91:13697" data-name="ColAction">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] uppercase whitespace-nowrap" data-node-id="91:13698">
                    ACTIONS
                  </p>
                </div>
              </div>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8808" data-name="Row / INV-2024005">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8808;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8808;9:845">
                    INV-2024005
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8808;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8808;9:849">
                    Isabella Jackson
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8808;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8808;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8808;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8808;9:857">
                    £2,336.62
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8808;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8808;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8808;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8808;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8808;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8808;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8809" data-name="Row / INV-2024018">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8809;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8809;9:845">
                    INV-2024018
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8809;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8809;9:849">
                    Alexander Lee
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8809;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8809;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8809;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8809;9:857">
                    £2,515.63
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8809;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8809;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8809;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8809;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8809;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8809;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8810" data-name="Row / INV-2024003">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8810;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8810;9:845">
                    INV-2024003
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8810;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8810;9:849">
                    Emma Wilson
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8810;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8810;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8810;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8810;9:857">
                    £465.10
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8810;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8810;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8810;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8810;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8810;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8810;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8811" data-name="Row / INV-2024015">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8811;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8811;9:845">
                    INV-2024015
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8811;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8811;9:849">
                    Isabella Jackson
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8811;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8811;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8811;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8811;9:857">
                    £409.93
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8811;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8811;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8811;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8811;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8811;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8811;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8812" data-name="Row / INV-2024012">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8812;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8812;9:845">
                    INV-2024012
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8812;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8812;9:849">
                    Matthew Moore
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8812;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8812;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8812;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8812;9:857">
                    £3,175.28
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8812;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8812;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8812;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8812;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8812;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8812;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8813" data-name="Row / INV-2024027">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8813;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8813;9:845">
                    INV-2024027
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8813;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8813;9:849">
                    Michael Davis
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8813;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8813;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8813;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8813;9:857">
                    £532.26
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8813;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8813;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8813;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8813;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8813;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8813;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8814" data-name="Row / INV-2024029">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8814;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8814;9:845">
                    INV-2024029
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8814;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8814;9:849">
                    Sarah Brown
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8814;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8814;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8814;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8814;9:857">
                    £1,618.86
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8814;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8814;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8814;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8814;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8814;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8814;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8815" data-name="Row / INV-2024007">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8815;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8815;9:845">
                    INV-2024007
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8815;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8815;9:849">
                    Emma Wilson
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8815;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8815;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8815;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8815;9:857">
                    £1,497.02
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8815;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8815;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8815;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8815;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8815;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8815;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8816" data-name="Row / INV-2024001">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8816;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8816;9:845">
                    INV-2024001
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8816;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8816;9:849">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8816;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8816;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8816;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8816;9:857">
                    £726.22
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8816;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8816;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8816;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8816;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8816;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8816;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8817" data-name="Row / INV-2024020">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8817;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8817;9:845">
                    INV-2024020
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8817;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8817;9:849">
                    Charlotte Walker
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8817;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8817;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8817;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8817;9:857">
                    £2,552.34
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8817;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8817;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8817;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8817;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8817;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8817;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8818" data-name="Row / INV-2024009">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8818;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8818;9:845">
                    INV-2024009
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8818;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8818;9:849">
                    Daniel Clark
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8818;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8818;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8818;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8818;9:857">
                    £1,276.90
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8818;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8818;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8818;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8818;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8818;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8818;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8819" data-name="Row / INV-2024002">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8819;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8819;9:845">
                    INV-2024002
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8819;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8819;9:849">
                    Olivia Taylor
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8819;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8819;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8819;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8819;9:857">
                    £1,457.87
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8819;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8819;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8819;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8819;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8819;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8819;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8820" data-name="Row / INV-2024013">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8820;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8820;9:845">
                    INV-2024013
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8820;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8820;9:849">
                    Emma Wilson
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8820;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8820;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8820;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8820;9:857">
                    £827.81
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8820;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8820;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8820;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8820;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8820;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8820;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8821" data-name="Row / INV-2024026">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8821;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8821;9:845">
                    INV-2024026
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8821;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8821;9:849">
                    John Smith
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8821;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8821;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8821;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8821;9:857">
                    £2,504.07
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8821;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8821;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8821;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8821;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8821;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8821;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="82:8822" data-name="Row / INV-2024028">
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8822;9:844" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I82:8822;9:845">
                    INV-2024028
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8822;9:848" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I82:8822;9:849">
                    Olivia Taylor
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I82:8822;9:852" data-name="ColDate">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I82:8822;9:853">
                    25 SEP 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[130px]" data-node-id="I82:8822;9:856" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I82:8822;9:857">
                    £1,410.67
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I82:8822;9:860" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I82:8822;9:861" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I82:8822;9:861;89:60864">
                      PAID
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0" data-node-id="I82:8822;9:865" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I82:8822;9:866" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I82:8822;9:866;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
            </div>
            <div className="[word-break:break-word] border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pb-[4px] pt-[16px] px-[24px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:8823" data-name="Total footer">
              <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:8824">
                SHOWING 15 OF 16 INVOICES
              </p>
              <div className="content-stretch flex gap-[12px] items-baseline overflow-clip relative shrink-0" data-node-id="82:8825" data-name="Total">
                <p className="font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="82:8826">
                  PERIOD TOTAL
                </p>
                <p className="font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[24px] text-[color:var(--teal\/800,#095358)]" data-node-id="82:8827">
                  £26,056.81
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="82:8828" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
