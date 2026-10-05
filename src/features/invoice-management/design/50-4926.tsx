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
const imgVector1 = '/invoice-management/assets/figma-160b12a1cdfb018a.svg';
const imgSvg = '/invoice-management/assets/figma-901943ac72c40ff1.svg';
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
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="50:4926" data-name="Invoice Manangement - Deductions e Recharges">
      <NavigationSidebar className="mr-[-12px] relative self-stretch shrink-0 w-[71px] z-[2]" property1="Closed"/>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="50:4928" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="50:4929" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I50:4929;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I50:4929;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I50:4929;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I50:4929;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:4929;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:4929;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:4929;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I50:4929;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I50:4929;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:4929;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I50:4929;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I50:4929;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I50:4929;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I50:4929;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I50:4929;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I50:4929;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I50:4929;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I50:4929;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I50:4929;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I50:4929;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I50:4929;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I50:4929;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[20px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="50:4930" data-name="Content">
          <div className="border-[#707979] border-b border-solid content-stretch flex items-center justify-between overflow-clip pb-[20px] relative shrink-0 w-full" data-node-id="68:5440" data-name="Page Title">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start relative shrink-0 whitespace-nowrap" data-node-id="68:5441">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)] uppercase" data-node-id="68:5442">{`Deductions & Recharges`}</p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="68:5443">
                Operational recharges per courier · September 2026
              </p>
            </div>
            <div className="content-stretch flex gap-[15px] items-end justify-end relative shrink-0" data-node-id="68:5444">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="68:5445" data-name="UI/Select">
                <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I68:5445;89:60950">
                  SERVICE PARTNER
                </p>
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 w-full whitespace-nowrap" data-node-id="I68:5445;89:60951" data-name="Field">
                  <p className="not-italic relative shrink-0 text-[#1a1c16] text-[12px]" data-node-id="I68:5445;89:60952">
                    All service partners
                  </p>
                  <p className="font-normal relative shrink-0 text-[#8a8a84] text-[14px]" data-node-id="I68:5445;89:60953" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    ▼
                  </p>
                </div>
              </div>
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex gap-[8px] h-[36px] items-center px-[12px] relative shrink-0 w-[255px]" placeholder="SEARCH COURIER OR ID..."/>
              <div className="content-stretch flex flex-col items-start justify-center relative shrink-0 w-[136px]" data-node-id="68:5447">
                <div className="content-stretch flex h-[55px] items-center relative shrink-0 w-full" data-node-id="68:5448" data-name="TitleArea">
                  <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-node-id="68:5449">
                    <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="68:5450">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:Medium'] leading-[16px] not-italic relative shrink-0 text-[#424936] text-[13px] uppercase whitespace-nowrap" data-node-id="68:5451">
                        September 2026
                      </p>
                    </div>
                    <div className="h-[14.375px] relative shrink-0 w-[14px]" data-node-id="68:5452" data-name="SVG">
                      <img alt="" className="figma-asset" src={imgSvg}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full" data-node-id="50:4942" data-name="Desk">
            <div className="border-[var(--border\/default,#bfc8c9)] border-r border-solid content-stretch flex flex-col items-start overflow-clip relative self-stretch shrink-0 w-[300px]" data-node-id="50:4943" data-name="Types list">
              <div className="content-stretch flex items-center justify-between overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:4944" data-name="List header">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4945">
                  Deduction types
                </p>
                <div className="bg-[#003b3e] content-stretch flex items-start overflow-clip px-[8px] py-[3px] relative shrink-0" data-node-id="50:4946" data-name="Tag">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-white whitespace-nowrap" data-node-id="50:4947">
                    6 TIPOS
                  </p>
                </div>
              </div>
              <div className="bg-[#efefea] content-stretch flex items-start overflow-clip px-[16px] py-[12px] relative shrink-0 w-full" data-node-id="50:4948" data-name="Group">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4949">
                  SEP 2026 · BA Express
                </p>
              </div>
              <Category className="border-[#e3e3d8] border-b border-solid content-stretch cursor-pointer flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" data-node-id="50:4950" data-name="Type / Total" label="Total">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4950;50:4652" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] text-left uppercase whitespace-nowrap" data-node-id="I50:4950;50:4653">
                    Total
                  </p>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-left w-full whitespace-nowrap" data-node-id="I50:4950;50:4659" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="I50:4950;50:4660">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="I50:4950;50:4661">
                    £3,812.00
                  </p>
                </div>
              </Category>
              <Category className="border-[#e3e3d8] border-b border-solid content-stretch cursor-pointer flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" data-node-id="50:4951" data-name="Type / Repairs & damages" label="Repairs & damages">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4951;50:4652" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] text-left uppercase whitespace-nowrap" data-node-id="I50:4951;50:4653">{`Repairs & damages`}</p>
                  <div className="content-stretch cursor-pointer flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="I50:4951;50:4654" data-name="Meta">
                    <Action className="bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="I50:4951;50:4657" data-name="Add" label="Add: Repairs & damages">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] text-left whitespace-nowrap" data-node-id="I50:4951;50:4658">
                        +
                      </p>
                    </Action>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-left w-full whitespace-nowrap" data-node-id="I50:4951;50:4659" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="I50:4951;50:4660">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="I50:4951;50:4661">
                    £937.00
                  </p>
                </div>
              </Category>
              <Category className="bg-[var(--lime\/500,#b2f746)] border-[var(--text\/primary,#1a1c16)] border-l-4 border-solid content-stretch flex flex-col gap-[8px] items-start pl-[12px] pr-[16px] py-[16px] relative shrink-0 w-full" data-node-id="50:4952" data-name="Type / Pre-payments" label="Pre-payments">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4952;50:4663" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="I50:4952;50:4664">
                    Pre-payments
                  </p>
                  <a className="content-stretch cursor-pointer flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="I50:4952;50:4665" data-name="Meta">
                    <Action className="bg-[var(--text\/primary,#1a1c16)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="I50:4952;50:4668" data-name="Add" label="Add: Pre-payments">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--lime\/500,#b2f746)] text-left whitespace-nowrap" data-node-id="I50:4952;50:4669">
                        +
                      </p>
                    </Action>
                  </a>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-full whitespace-nowrap" data-node-id="I50:4952;50:4670" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px]" data-node-id="I50:4952;50:4671">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[22px]" data-node-id="I50:4952;50:4672">
                    £2,775.00
                  </p>
                </div>
              </Category>
              <Category className="border-[#e3e3d8] border-b border-solid content-stretch cursor-pointer flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" data-node-id="50:4953" data-name="Type / Liquidation damages" label="Liquidation damages">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4953;50:4652" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] text-left uppercase whitespace-nowrap" data-node-id="I50:4953;50:4653">
                    Liquidation damages
                  </p>
                  <div className="content-stretch cursor-pointer flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="I50:4953;50:4654" data-name="Meta">
                    <Action className="bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="I50:4953;50:4657" data-name="Add" label="Add: Liquidation damages">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] text-left whitespace-nowrap" data-node-id="I50:4953;50:4658">
                        +
                      </p>
                    </Action>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-left w-full whitespace-nowrap" data-node-id="I50:4953;50:4659" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="I50:4953;50:4660">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="I50:4953;50:4661">
                    £0.00
                  </p>
                </div>
              </Category>
              <Category className="border-[#e3e3d8] border-b border-solid content-stretch cursor-pointer flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" data-node-id="50:4954" data-name="Type / Traffic penalties" label="Traffic penalties">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4954;50:4652" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] text-left uppercase whitespace-nowrap" data-node-id="I50:4954;50:4653">
                    Traffic penalties
                  </p>
                  <div className="content-stretch cursor-pointer flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="I50:4954;50:4654" data-name="Meta">
                    <Action className="bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="I50:4954;50:4657" data-name="Add" label="Add: Traffic penalties">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] text-left whitespace-nowrap" data-node-id="I50:4954;50:4658">
                        +
                      </p>
                    </Action>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-left w-full whitespace-nowrap" data-node-id="I50:4954;50:4659" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="I50:4954;50:4660">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="I50:4954;50:4661">
                    £100.00
                  </p>
                </div>
              </Category>
              <Category className="border-[#e3e3d8] border-b border-solid content-stretch cursor-pointer flex flex-col gap-[8px] items-start p-[16px] relative shrink-0 w-full" data-node-id="50:4955" data-name="Type / Other" label="Other">
                <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full" data-node-id="I50:4955;50:4652" data-name="Top">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--green\/700,#446900)] text-left uppercase whitespace-nowrap" data-node-id="I50:4955;50:4653">
                    Other
                  </p>
                  <div className="content-stretch cursor-pointer flex gap-[6px] items-center overflow-clip relative shrink-0" data-node-id="I50:4955;50:4654" data-name="Meta">
                    <Action className="bg-[var(--background\/card,white)] border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex items-center justify-center overflow-clip relative shrink-0 size-[24px]" data-node-id="I50:4955;50:4657" data-name="Add" label="Add: Other">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] text-left whitespace-nowrap" data-node-id="I50:4955;50:4658">
                        +
                      </p>
                    </Action>
                  </div>
                </div>
                <div className="[word-break:break-word] content-stretch flex items-end justify-between overflow-clip relative shrink-0 text-left w-full whitespace-nowrap" data-node-id="I50:4955;50:4659" data-name="Bottom">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[18px] not-italic relative shrink-0 text-[12px] text-[color:var(--green\/700,#446900)]" data-node-id="I50:4955;50:4660">
                    ​
                  </p>
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#334f00] text-[22px]" data-node-id="I50:4955;50:4661">
                    £0.00
                  </p>
                </div>
              </Category>
            </div>
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-start min-w-px overflow-clip pl-[24px] pt-[20px] relative" data-node-id="50:4956" data-name="Centre">
              <div className="bg-[var(--background\/card,white)] border border-[#707979] border-solid content-stretch flex items-start relative shrink-0 w-full" data-node-id="50:4957" data-name="Type card">
                <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[10px] items-start min-w-px overflow-clip px-[28px] py-[24px] relative" data-node-id="50:4958" data-name="Info">
                  <p className="font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[30px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:4959">
                    PRE-PAYMENTS
                  </p>
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] min-w-full not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)] w-[min-content]" data-node-id="50:4960">
                    Advances to the courier, deducted in installments with a fee.
                  </p>
                  <div className="content-stretch flex flex-col gap-[4px] items-start leading-[normal] not-italic overflow-clip pt-[8px] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="50:4961" data-name="Details">
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:4962" data-name="Registros">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:4963">
                        RECORDS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:4964">
                        4
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:4965" data-name="Período">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:4966">
                        PERIOD:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:4967">
                        SEP 2026
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[8px] items-start overflow-clip relative shrink-0" data-node-id="50:4968" data-name="Status">
                      <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0" data-node-id="50:4969">
                        STATUS:
                      </p>
                      <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0" data-node-id="50:4970">
                        4 PENDING
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#f3f3ec] border-[#8a8a84] border-dashed border-l content-stretch flex flex-col items-center justify-center overflow-clip relative self-stretch shrink-0 w-[200px]" data-node-id="50:4973" data-name="New entry action">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[#003b3e] text-[24px] whitespace-nowrap" data-node-id="50:11392">
                    £2,775.00
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4977">
                Type summary
              </p>
              <div className="[word-break:break-word] bg-[var(--background\/card,white)] content-stretch flex gap-[12px] items-start not-italic overflow-clip p-[16px] relative shrink-0 text-[14px] w-full whitespace-nowrap" data-node-id="50:4978" data-name="Summary">
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:4979" data-name="Registros">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:4980">
                    Records
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:4981">
                    4
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:4982" data-name="Valor">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:4983">
                    Value
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:4984">
                    £2,775.00
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:4985" data-name="Tipos">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:4986">
                    Types
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:4987">
                    1
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] flex-col gap-[6px] items-start min-w-px overflow-clip relative" data-node-id="50:4988" data-name="Couriers">
                  <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] uppercase" data-node-id="50:4989">
                    Couriers
                  </p>
                  <p className="font-['IBM_Plex_Mono:Bold'] leading-[normal] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)]" data-node-id="50:4990">
                    4
                  </p>
                </div>
              </div>
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4991">
                Records
              </p>
              <div className="bg-[var(--background\/card,white)] content-stretch flex flex-col items-start overflow-clip p-[16px] relative shrink-0 w-full" data-node-id="50:4992" data-name="Records">
                <div className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:4993" data-name="DeductionsV2/TableHeader">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:4993;50:4715" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:4993;50:4716">
                      ID
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:4993;50:4717" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:4993;50:4718">
                      COURIER
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:4993;50:4719" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:4993;50:4720">
                      VALUE
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:4993;50:4721" data-name="ColStatus">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:4993;50:4722">
                      STATUS
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:4993;50:4723" data-name="ColAction">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I50:4993;50:4724">{` `}</p>
                  </div>
                </div>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:4994" data-name="Row / PRP-PMONTE-100926-105">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:4994;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:4994;50:4727">
                      PRP-PMONTE-100926-105
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:4994;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:4994;50:4729">
                      Pedro Monte
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:4994;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:4994;50:4731">
                      £1,025.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:4994;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:4994;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4994;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:4994;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:4994;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4994;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:4995" data-name="Row / PRP-PJORGEVELOSO-280826-101">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:4995;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:4995;50:4727">
                      PRP-PJORGEVELOSO-280826-101
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:4995;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:4995;50:4729">
                      Paulo Jorge Veloso
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:4995;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:4995;50:4731">
                      £525.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:4995;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:4995;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4995;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:4995;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:4995;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4995;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:4996" data-name="Row / PRP-JDIGIACOMONETO-080726-003">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:4996;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:4996;50:4727">
                      PRP-JDIGIACOMONETO-080726-003
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:4996;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:4996;50:4729">
                      Julio Di Giacomo Neto
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:4996;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:4996;50:4731">
                      £700.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:4996;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:4996;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4996;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:4996;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:4996;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4996;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[12px] py-[16px] relative shrink-0 w-full" data-node-id="50:4997" data-name="Row / PRP-SSTAN-060726-004">
                  <div className="content-stretch flex items-start relative shrink-0 w-[222px]" data-node-id="I50:4997;50:4726" data-name="ColID">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I50:4997;50:4727">
                      PRP-SSTAN-060726-004
                    </p>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I50:4997;50:4728" data-name="ColCourier">
                    <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I50:4997;50:4729">
                      Silviu Stan
                    </p>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[90px]" data-node-id="I50:4997;50:4730" data-name="ColValue">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I50:4997;50:4731">
                      £525.00
                    </p>
                  </div>
                  <div className="content-stretch flex items-start relative shrink-0 w-[90px]" data-node-id="I50:4997;50:4732" data-name="ColStatus">
                    <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I50:4997;50:4733" data-name="UI/Badge">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4997;50:4733;89:60868">
                        PENDING
                      </p>
                    </div>
                  </div>
                  <div className="content-stretch flex items-start justify-end relative shrink-0 w-[60px]" data-node-id="I50:4997;50:4734" data-name="ColAction">
                    <Action className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I50:4997;50:4735" data-name="UI/Button">
                      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I50:4997;50:4735;89:60777">
                        VER
                      </p>
                    </Action>
                  </div>
                </SearchRow>
                <div className="border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex items-center justify-between overflow-clip pt-[14px] px-[12px] relative shrink-0 w-full" data-node-id="50:4998" data-name="Total">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] uppercase whitespace-nowrap" data-node-id="50:4999">
                    Total · 4 records
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="50:5029" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
