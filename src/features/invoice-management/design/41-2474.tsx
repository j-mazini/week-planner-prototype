import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgSearchIcon = '/invoice-management/assets/figma-0c250c777346a295.svg';
const imgProperty1Home = '/invoice-management/assets/figma-cb6c740391fd60a8.svg';
const imgMenuIcon = '/invoice-management/assets/figma-9eb7a77b599512e6.svg';
const imgMenuIcon1 = '/invoice-management/assets/figma-ade90a8fe29794f1.svg';
const imgMenuIcon2 = '/invoice-management/assets/figma-45eff26857b33345.svg';
const imgMenuIcon3 = '/invoice-management/assets/figma-9a51012419bbc15a.svg';
const imgContainer = '/invoice-management/assets/figma-410ac55350634560.svg';
const imgContainer1 = '/invoice-management/assets/figma-66cd741a9099f1d6.svg';
const imgFrame2 = '/invoice-management/assets/figma-f9fe116e433d7148.svg';
const imgContainer2 = '/invoice-management/assets/figma-1b4b58328b161073.svg';
const imgVector1 = '/invoice-management/assets/figma-630e5c73ba99a7e1.svg';
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
export default function Screen() {
    return (<div className="bg-[#fafaef] content-stretch flex isolate items-start relative size-full" data-node-id="41:2474" data-name="Invoice Manangement - Invoice Processing Workflow">
      <div className="mr-[-12px] relative self-stretch shrink-0 w-[175px] z-[2]" data-node-id="109:14606" data-name="Navigation/Sidebar">
        <div className="absolute contents inset-0" data-node-id="I109:14606;89:57023">
          <div className="absolute bg-[#e9e9de] border-[#bfc8c9] border-r border-solid content-stretch flex flex-col inset-0 items-start justify-between pr-px py-[24px]" data-node-id="I109:14606;89:57024" data-name="Sidebar">
            <div className="relative shrink-0 w-full" data-node-id="I109:14606;89:57025" data-name="Margin">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[32px] relative size-full">
                <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0 w-full" data-node-id="I109:14606;89:57026" data-name="Container">
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-node-id="I109:14606;89:57027" data-name="Heading 1">
                    <div className="[word-break:break-word] flex flex-col font-['Space_Grotesk:Bold'] font-bold justify-center leading-[0] relative shrink-0 text-[#1a1c16] text-[32px] tracking-[-1.6px] w-full" data-node-id="I109:14606;89:57028">
                      <p className="leading-[38.4px] mb-0">LOGIX /</p>
                      <p className="leading-[38.4px]">SPHERE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-[1_0_0] min-h-px relative w-full" data-node-id="I109:14606;89:57029" data-name="Nav">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
                <div className="absolute content-stretch flex flex-col gap-[5px] items-start left-0 top-0 w-[174px]" data-node-id="I109:14606;89:57030">
                  <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7088" data-name="Menu Item">
                    <MenuIcon className="h-[11px] relative shrink-0 w-[14px]"/>
                    <div className="relative shrink-0" data-node-id="I109:14606;135:7088;129:6969" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I109:14606;135:7088;129:6970">
                          <p className="leading-[12px]">Home</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7099" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I109:14606;135:7099;129:6996" data-name="menu-icon">
                      <img alt="" className="figma-asset" src={imgMenuIcon}/>
                    </div>
                    <div className="relative shrink-0" data-node-id="I109:14606;135:7099;129:6969" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I109:14606;135:7099;129:6970">
                          <p className="leading-[12px]">Week Planner</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7136" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I109:14606;135:7136;129:6996" data-name="menu-icon">
                      <div className="absolute inset-[-7.5%_-8.33%]">
                        <img alt="" className="figma-asset" src={imgMenuIcon1}/>
                      </div>
                    </div>
                    <div className="relative shrink-0" data-node-id="I109:14606;135:7136;129:6969" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I109:14606;135:7136;129:6970">
                          <p className="leading-[12px]">Route Balance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7146" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I109:14606;135:7146;129:6996" data-name="menu-icon">
                      <div className="absolute inset-[0_0_-36.36%_0]">
                        <img alt="" className="figma-asset" src={imgMenuIcon2}/>
                      </div>
                    </div>
                    <div className="relative shrink-0" data-node-id="I109:14606;135:7146;129:6969" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I109:14606;135:7146;129:6970">
                          <p className="leading-[12px]">Daily Game Plan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-[rgba(0,59,62,0)] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7156" data-name="Menu Item">
                    <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I109:14606;135:7156;129:6996" data-name="menu-icon">
                      <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                    </div>
                    <div className="relative shrink-0" data-node-id="I109:14606;135:7156;129:6969" data-name="Container">
                      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] uppercase whitespace-nowrap" data-node-id="I109:14606;135:7156;129:6970">
                          <p className="leading-[12px]">Clearing Desk</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col items-start relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7166" data-name="Menu Item">
                    <div className="bg-[#b2f746] border-[#003b3e] border-l-4 border-solid content-stretch flex gap-[12px] h-[39px] items-center pl-[20px] pr-[16px] py-[12px] relative shrink-0 w-full" data-node-id="I109:14606;135:7166;129:7018" data-name="Link">
                      <div className="h-[11px] relative shrink-0 w-[14px]" data-node-id="I109:14606;135:7166;129:7043" data-name="menu-icon">
                        <img alt="" className="figma-asset" src={imgMenuIcon3}/>
                      </div>
                      <div className="relative shrink-0" data-node-id="I109:14606;135:7166;129:7026" data-name="Container">
                        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
                          <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Bold'] justify-center leading-[0] not-italic relative shrink-0 text-[#416400] text-[12px] whitespace-nowrap" data-node-id="I109:14606;135:7166;129:7027">
                            <p className="leading-[12px]">Invoice</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex flex-col gap-[4px] items-start py-[8px] relative shrink-0 w-full" data-node-id="I109:14606;135:7166;129:7028">
                      <div className="content-stretch flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7166;135:7295" data-name="Submenu-item">
                        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I109:14606;135:7166;135:7295;129:6948" data-name="Container">
                          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] whitespace-nowrap" data-node-id="I109:14606;135:7166;135:7295;129:6949">
                            Invoice Processing
                          </p>
                        </div>
                      </div>
                      <Action className="content-stretch cursor-pointer flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7166;135:7305" data-name="Submenu-item">
                        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I109:14606;135:7166;135:7305;129:6942" data-name="Container">
                          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I109:14606;135:7166;135:7305;129:6943">{`Deductions & Recharges`}</p>
                        </div>
                      </Action>
                      <Action className="content-stretch cursor-pointer flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7166;135:7314" data-name="Submenu-item">
                        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I109:14606;135:7166;135:7314;129:6942" data-name="Container">
                          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I109:14606;135:7166;135:7314;129:6943">
                            Schedule for Payment
                          </p>
                        </div>
                      </Action>
                      <Action className="content-stretch cursor-pointer flex h-[18px] items-center overflow-clip pl-[20px] pr-[16px] py-[4px] relative shrink-0 w-[174px]" data-node-id="I109:14606;135:7166;135:7323" data-name="Submenu-item">
                        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0" data-node-id="I109:14606;135:7166;135:7323;129:6942" data-name="Container">
                          <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[10px] not-italic relative shrink-0 text-[#59594d] text-[10px] text-left whitespace-nowrap" data-node-id="I109:14606;135:7166;135:7323;129:6943">
                            Invoices History
                          </p>
                        </div>
                      </Action>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative shrink-0 w-full" data-node-id="I109:14606;89:57055" data-name="Container">
              <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start px-[16px] relative size-full">
                <div className="border-[#bfc8c9] border-solid border-t content-stretch flex flex-col gap-[8px] items-start pt-[17px] relative shrink-0 w-full" data-node-id="I109:14606;89:57056" data-name="HorizontalBorder">
                  <div className="relative shrink-0 w-full" data-node-id="I109:14606;89:57057" data-name="Link">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                      <div className="relative shrink-0 size-[11.667px]" data-node-id="I109:14606;89:57058" data-name="Container">
                        <img alt="" className="figma-asset" src={imgContainer}/>
                      </div>
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[10px] whitespace-nowrap" data-node-id="I109:14606;89:57060">
                        <p className="leading-[15px]">SUPPORT</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative shrink-0 w-full" data-node-id="I109:14606;89:57061" data-name="Link">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
                      <div className="h-[11.083px] relative shrink-0 w-[10.5px]" data-node-id="I109:14606;89:57062" data-name="Container">
                        <img alt="" className="figma-asset" src={imgContainer1}/>
                      </div>
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[10px] whitespace-nowrap" data-node-id="I109:14606;89:57064">
                        <p className="leading-[15px]">SYSTEM STATUS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Action className="absolute block cursor-pointer right-[-10.5px] size-[24px] top-[107px]" data-node-id="I109:14606;89:57065">
          <img alt="" className="figma-asset" src={imgFrame2}/>
        </Action>
      </div>
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative z-[1]" data-node-id="41:2476" data-name="Main">
        <div className="bg-[#fafaef] border-[#bfc8c9] border-b border-solid content-stretch flex h-[64px] items-center justify-between pb-px px-[24px] relative shrink-0 w-full" data-node-id="41:2477" data-name="Navigation/Navbar-RouteBalance">
          <div className="flex-[1_0_0] h-[32px] min-w-px relative" data-node-id="I41:2477;89:57150" data-name="Container">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute h-[15px] left-[579px] top-[8.5px] w-[142px]" data-node-id="I41:2477;89:57151" data-name="Margin"/>
              <div className="absolute content-stretch flex flex-col items-start pl-[24px] right-[10px] top-0" data-node-id="I41:2477;89:57152" data-name="Margin">
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="I41:2477;89:57153" data-name="Container">
                  <div className="content-stretch flex items-center relative shrink-0" data-node-id="I41:2477;89:57154" data-name="Container">
                    <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I41:2477;89:57155" data-name="Container">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I41:2477;89:57156">
                        <p className="leading-[16.5px]">25/09/2026 11:20</p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col h-[24px] items-start px-[8px] relative shrink-0 w-[17px]" data-node-id="I41:2477;89:57157" data-name="Margin">
                    <div className="bg-[#bfc8c9] h-[24px] relative shrink-0 w-px" data-node-id="I41:2477;89:57158" data-name="Vertical Divider"/>
                  </div>
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I41:2477;89:57159">
                    <div className="content-stretch flex items-center relative shrink-0" data-node-id="I41:2477;89:57160" data-name="Container">
                      <div className="content-stretch flex h-[32px] items-center justify-center relative rounded-[12px] shrink-0 w-[20px]" data-node-id="I41:2477;89:57161" data-name="Background+Border">
                        <div className="relative shrink-0 size-[20px]" data-node-id="I41:2477;89:57162" data-name="Container">
                          <img alt="" className="figma-asset" src={imgContainer2}/>
                        </div>
                      </div>
                    </div>
                    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-node-id="I41:2477;89:57164" data-name="Container">
                      <div className="content-stretch flex flex-col items-start relative shrink-0" data-node-id="I41:2477;89:57165" data-name="Container">
                        <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#3f4849] text-[11px] tracking-[0.275px] whitespace-nowrap" data-node-id="I41:2477;89:57166">
                          <p className="leading-[16.5px]">João</p>
                        </div>
                      </div>
                      <div className="h-[3px] relative shrink-0 w-[6px]" data-node-id="I41:2477;89:57167">
                        <div className="absolute inset-[-12.39%_-5.57%_-23.61%_-6.23%]">
                          <img alt="" className="figma-asset" src={imgVector1}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start right-[254px] top-[calc(50%+0.01px)]" data-node-id="I41:2477;89:57168" data-name="Container">
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex items-start justify-center overflow-clip pb-[7.19px] pt-[6px] px-[13px] relative shrink-0 w-[256px]" data-node-id="I41:2477;89:57169" data-name="Input">
                  <div className="flex-[1_0_0] min-w-px relative" data-node-id="I41:2477;89:57170" data-name="Container">
                    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
                      <div className="[word-break:break-word] flex flex-col font-['IBM_Plex_Mono:Regular'] justify-center leading-[0] not-italic relative shrink-0 text-[#6b7280] text-[11px] w-full" data-node-id="I41:2477;89:57171">
                        <p className="leading-[normal]">SEARCH SYSTEM...</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute h-[15px] opacity-50 right-[12px] top-[6px] w-[22px]" data-node-id="I41:2477;89:57172" data-name="Container"/>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start overflow-clip pb-[32px] pt-[28px] px-[36px] relative shrink-0 w-full" data-node-id="41:2478" data-name="Content">
          <div className="border-[#707979] border-b border-solid content-stretch flex items-center justify-between overflow-clip pb-[20px] relative shrink-0 w-full" data-node-id="90:12820" data-name="Page Title">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start relative shrink-0 uppercase whitespace-nowrap" data-node-id="90:12821">
              <p className="font-['Space_Grotesk:Bold'] font-bold leading-[40px] relative shrink-0 text-[32px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="90:12822">
                Invoice Processing Workflow
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] leading-[22px] not-italic relative shrink-0 text-[14px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="90:12823">
                Streamlined approvals from submission to settlement
              </p>
            </div>
          </div>
          <div className="bg-[#003b3e] border-[#0f4d4c] border-b border-solid content-stretch drop-shadow-[0px_8px_12px_rgba(0,0,0,0.15)] flex flex-col items-center px-[28px] py-[24px] relative shrink-0 w-full" data-node-id="43:4569" data-name="ProvenanceChain">
            <div className="content-stretch flex items-center relative shrink-0" data-node-id="43:4570" data-name="Container">
              <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-node-id="43:4571">
                <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-node-id="43:4572" data-name="Container">
                  <div className="bg-[#b2f746] border border-black border-solid relative rounded-[6px] shrink-0 size-[12px]" data-node-id="43:4573" data-name="Background"/>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[16px] not-italic relative shrink-0 text-[#fafaef] text-[12px] uppercase whitespace-nowrap" data-node-id="43:4574">
                    Current Period
                  </p>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[14px] not-italic relative shrink-0 text-[#c9d6d3] text-[10px] uppercase whitespace-nowrap" data-node-id="43:4619">
                    8 records
                  </p>
                  <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#b2f746] text-[24px] whitespace-nowrap" data-node-id="43:4617">
                    £13,740.66
                  </p>
                </div>
                <div className="bg-[#0f4d4c] h-px relative shrink-0 w-[96px]" data-node-id="43:4575" data-name="Horizontal Divider"/>
                <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-node-id="43:4576" data-name="Container">
                  <div className="border-2 border-[#c9d6d3] border-solid relative rounded-[6px] shrink-0 size-[12px]" data-node-id="43:4630" data-name="Background"/>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#fafaef] text-[12px] uppercase whitespace-nowrap" data-node-id="43:4578">
                    Pending Verification
                  </p>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[14px] not-italic relative shrink-0 text-[#c9d6d3] text-[10px] uppercase whitespace-nowrap" data-node-id="43:4621">
                    12 records
                  </p>
                  <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#fafaef] text-[24px] whitespace-nowrap" data-node-id="43:4622">
                    £20,766.33
                  </p>
                </div>
                <div className="border-[#0f4d4c] border-dashed border-t h-px relative shrink-0 w-[96px]" data-node-id="43:4579" data-name="Horizontal Divider"/>
                <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-node-id="43:4580" data-name="Container">
                  <div className="border-2 border-[#c9d6d3] border-solid relative rounded-[6px] shrink-0 size-[12px]" data-node-id="43:4581" data-name="Background"/>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#fafaef] text-[12px] uppercase whitespace-nowrap" data-node-id="43:4582">
                    Ready for Invoicing
                  </p>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[14px] not-italic relative shrink-0 text-[#c9d6d3] text-[10px] uppercase whitespace-nowrap" data-node-id="43:4624">
                    6 records
                  </p>
                  <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#fafaef] text-[24px] whitespace-nowrap" data-node-id="43:4625">
                    £11,694.08
                  </p>
                </div>
                <div className="border-[#0f4d4c] border-dashed border-t h-px relative shrink-0 w-[96px]" data-node-id="43:4583" data-name="Horizontal Divider"/>
                <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-node-id="43:4584" data-name="Container">
                  <div className="border-2 border-[#c9d6d3] border-solid relative rounded-[6px] shrink-0 size-[12px]" data-node-id="43:4585" data-name="Background"/>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#fafaef] text-[12px] uppercase whitespace-nowrap" data-node-id="43:4586">
                    Invoiced
                  </p>
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[14px] not-italic relative shrink-0 text-[#c9d6d3] text-[10px] uppercase whitespace-nowrap" data-node-id="43:4627">
                    4 records
                  </p>
                  <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[32px] relative shrink-0 text-[#fafaef] text-[24px] whitespace-nowrap" data-node-id="43:4628">
                    £7,209.30
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col gap-[16px] items-start overflow-clip p-[24px] relative shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] shrink-0 w-full" data-node-id="41:2508" data-name="Records table">
            <div className="content-stretch flex gap-[12px] items-end overflow-clip relative shrink-0 w-full" data-node-id="41:2509" data-name="Table toolbar">
              <UiSearchBar className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex gap-[8px] h-[36px] items-center px-[12px] relative shrink-0 w-[305px]" placeholder="SEARCH SUBCONTRACTOR OR RECORD ID..."/>
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[6px] items-start leading-[normal] relative shrink-0 w-[260px]" data-node-id="41:2511" data-name="UI/Select">
                <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase w-full" data-node-id="I41:2511;89:60940">
                  BATCH ACTIONS
                </p>
                <div className="bg-[#eeeee4] border border-[#bfc8c9] border-solid content-stretch flex font-['IBM_Plex_Mono:Regular'] h-[36px] items-center justify-between overflow-clip pl-[12px] pr-[10px] relative shrink-0 text-[#8a8a84] w-full whitespace-nowrap" data-node-id="I41:2511;89:60941" data-name="Field">
                  <p className="not-italic relative shrink-0 text-[11px] uppercase" data-node-id="I41:2511;89:60942">
                    Select Action...
                  </p>
                  <p className="font-normal relative shrink-0 text-[14px]" data-node-id="I41:2511;89:60943" style={{ fontVariationSettings: '"CTGR" 0, "wdth" 100' }}>
                    ▼
                  </p>
                </div>
              </div>
              <Action className="bg-[#b2f746] border border-[#446900] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="41:2512" data-name="UI/Button">
                <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[16px] not-italic relative shrink-0 text-[#1a1c16] text-[12px] uppercase whitespace-nowrap" data-node-id="I41:2512;89:60761">
                  Apply to selected
                </p>
              </Action>
            </div>
            <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-node-id="41:2513" data-name="Table">
              <div className="border-b-2 border-black border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2514" data-name="InvoiceWorkflow/TableHeader">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2514;7:382" data-name="ColCheck">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:383">
                    SEL
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2514;7:388" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:389">
                    RECORD ID
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2514;7:392" data-name="ColSub">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:393">
                    SUBCONTRACTOR
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2514;7:396" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:397">
                    PERIOD
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2514;7:400" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:401">
                    VALUE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2514;7:404" data-name="ColStatus">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:405">
                    STAGE
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2514;7:409" data-name="ColAction">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Bold'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[11px] whitespace-nowrap" data-node-id="I41:2514;7:410">
                    ACTION
                  </p>
                </div>
              </div>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2515" data-name="Row / REC-2025001">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2515;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2515;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2515;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2515;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2515;7:387">
                    REC-2025001
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2515;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2515;7:391">
                    Benjamin Harris
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2515;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2515;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2515;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2515;7:399">
                    £2,489.20
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2515;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2515;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2515;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2515;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2515;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2515;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2516" data-name="Row / REC-2025002">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2516;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2516;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2516;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2516;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2516;7:387">
                    REC-2025002
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2516;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2516;7:391">
                    James Anderson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2516;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2516;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2516;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2516;7:399">
                    £929.10
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2516;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2516;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2516;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2516;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2516;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2516;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2517" data-name="Row / REC-2025003">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2517;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2517;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2517;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2517;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2517;7:387">
                    REC-2025003
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2517;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2517;7:391">
                    Charlotte Walker
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2517;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2517;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2517;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2517;7:399">
                    £643.41
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2517;7:402" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2517;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2517;7:403;89:60870">
                      READY FOR INVOICING
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2517;7:407" data-name="ColAction">
                  <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2517;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2517;7:408;89:60769">
                      GENERATE INVOICE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2518" data-name="Row / REC-2025004">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2518;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2518;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2518;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2518;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2518;7:387">
                    REC-2025004
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2518;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2518;7:391">
                    Alexander Lee
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2518;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2518;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2518;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2518;7:399">
                    £2,546.77
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2518;7:402" data-name="ColStatus">
                  <div className="bg-[#afedf3] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2518;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#27676c] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2518;7:403;89:60870">
                      READY FOR INVOICING
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2518;7:407" data-name="ColAction">
                  <Action className="bg-[#b2f746] content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2518;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2518;7:408;89:60769">
                      GENERATE INVOICE
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2519" data-name="Row / REC-2025005">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2519;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2519;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2519;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2519;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2519;7:387">
                    REC-2025005
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2519;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2519;7:391">
                    Emma Wilson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2519;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2519;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2519;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2519;7:399">
                    £1,670.29
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2519;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2519;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2519;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2519;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2519;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2519;7:408;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2520" data-name="Row / REC-2025006">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2520;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2520;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2520;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2520;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2520;7:387">
                    REC-2025006
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2520;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2520;7:391">
                    Maria Garcia
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2520;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2520;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2520;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2520;7:399">
                    £1,798.10
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2520;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2520;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2520;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2520;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2520;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2520;7:408;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2521" data-name="Row / REC-2025007">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2521;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2521;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2521;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2521;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2521;7:387">
                    REC-2025007
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2521;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2521;7:391">
                    Maria Garcia
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2521;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2521;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2521;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2521;7:399">
                    £1,324.02
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2521;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2521;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2521;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2521;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2521;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2521;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2522" data-name="Row / REC-2025008">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2522;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2522;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2522;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2522;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2522;7:387">
                    REC-2025008
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2522;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2522;7:391">
                    Olivia Taylor
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2522;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2522;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2522;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2522;7:399">
                    £2,102.02
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2522;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2522;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2522;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2522;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2522;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2522;7:408;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2523" data-name="Row / REC-2025009">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2523;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2523;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2523;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2523;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2523;7:387">
                    REC-2025009
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2523;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2523;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2523;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2523;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2523;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2523;7:399">
                    £2,697.66
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2523;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2523;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2523;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2523;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2523;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2523;7:408;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2524" data-name="Row / REC-2025010">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2524;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2524;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2524;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2524;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2524;7:387">
                    REC-2025010
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2524;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2524;7:391">
                    Sarah Brown
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2524;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2524;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2524;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2524;7:399">
                    £3,011.18
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2524;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2524;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2524;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2524;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2524;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2524;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2525" data-name="Row / REC-2025027">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2525;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2525;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2525;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2525;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2525;7:387">
                    REC-2025027
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2525;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2525;7:391">
                    Mia Rodriguez
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2525;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2525;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2525;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2525;7:399">
                    £1,529.47
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2525;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2525;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2525;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2525;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2525;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2525;7:408;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2526" data-name="Row / REC-2025028">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2526;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2526;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2526;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2526;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2526;7:387">
                    REC-2025028
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2526;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2526;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2526;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2526;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2526;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2526;7:399">
                    £1,442.86
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2526;7:402" data-name="ColStatus">
                  <div className="bg-[#efefea] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2526;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#17171a] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2526;7:403;89:60872">
                      CURRENT PERIOD
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2526;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2526;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2526;7:408;89:60777">
                      VIEW
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2527" data-name="Row / REC-2025029">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2527;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2527;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2527;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2527;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2527;7:387">
                    REC-2025029
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2527;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2527;7:391">
                    Robert Johnson
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2527;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2527;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2527;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2527;7:399">
                    £2,240.20
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2527;7:402" data-name="ColStatus">
                  <div className="bg-[#fde68a] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2527;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#8a5c0b] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2527;7:403;89:60868">
                      PENDING VERIFICATION
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2527;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2527;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2527;7:408;89:60777">
                      VERIFY
                    </p>
                  </Action>
                </div>
              </SearchRow>
              <SearchRow className="border-[#e9e9de] border-b border-solid content-stretch flex gap-[12px] items-center px-[24px] py-[16px] relative shrink-0 w-full" data-node-id="41:2528" data-name="Row / REC-2025030">
                <div className="content-stretch flex items-start relative shrink-0 w-[24px]" data-node-id="I41:2528;7:380" data-name="ColCheck">
                  <DemoCheck className="content-stretch flex gap-[8px] items-center relative shrink-0" data-node-id="I41:2528;7:381" data-name="UI/Checkbox" initial={false}>
                    <div className="bg-white border-[#bfc8c9] border-[1.5px] border-solid relative shrink-0 size-[18px]" data-node-id="I41:2528;7:381;89:60832" data-name="Box"/>
                  </DemoCheck>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2528;7:386" data-name="ColID">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[12px] whitespace-nowrap" data-node-id="I41:2528;7:387">
                    REC-2025030
                  </p>
                </div>
                <div className="content-stretch flex flex-[1_0_0] items-start min-w-px relative" data-node-id="I41:2528;7:390" data-name="ColSub">
                  <p className="[word-break:break-word] font-['Space_Grotesk:Medium'] font-medium leading-[normal] overflow-hidden relative shrink-0 text-[#1a1c16] text-[13px] text-ellipsis whitespace-nowrap" data-node-id="I41:2528;7:391">
                    Amelia Lewis
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[110px]" data-node-id="I41:2528;7:394" data-name="ColPeriod">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:Regular'] leading-[normal] not-italic relative shrink-0 text-[#707979] text-[12px] whitespace-nowrap" data-node-id="I41:2528;7:395">
                    Sep 2026
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[120px]" data-node-id="I41:2528;7:398" data-name="ColAmount">
                  <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#003b3e] text-[12px] whitespace-nowrap" data-node-id="I41:2528;7:399">
                    £573.77
                  </p>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[200px]" data-node-id="I41:2528;7:402" data-name="ColStatus">
                  <div className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" data-node-id="I41:2528;7:403" data-name="UI/Badge">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="I41:2528;7:403;89:60864">
                      INVOICED
                    </p>
                  </div>
                </div>
                <div className="content-stretch flex items-start relative shrink-0 w-[150px]" data-node-id="I41:2528;7:407" data-name="ColAction">
                  <Action className="bg-[#27676c] border border-[#bfc8c9] border-solid content-stretch flex h-[28px] items-center justify-center px-[12px] relative shrink-0" data-node-id="I41:2528;7:408" data-name="UI/Button">
                    <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[14px] not-italic relative shrink-0 text-[10px] text-white uppercase whitespace-nowrap" data-node-id="I41:2528;7:408;89:60777">
                      DOWNLOAD PDF
                    </p>
                  </Action>
                </div>
              </SearchRow>
            </div>
            <div className="content-stretch flex items-center justify-between overflow-clip pb-[4px] px-[24px] relative shrink-0 w-full" data-node-id="41:2529" data-name="Total footer">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] uppercase whitespace-nowrap" data-node-id="41:2530">
                Showing 14 of 30 records
              </p>
            </div>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-start overflow-clip pb-[24px] px-[36px] relative shrink-0 w-full" data-node-id="41:2534" data-name="Footer wrap">
          <LayoutFooter className="border-[#bfc8c9] border-solid border-t content-stretch flex items-center justify-end pt-[17px] relative shrink-0 w-full"/>
        </div>
      </div>
    </div>);
}
