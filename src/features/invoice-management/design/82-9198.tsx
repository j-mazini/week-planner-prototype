import { Category, Action, DemoCheck, DemoInput, SearchRow } from '../demo';
const imgFireflyRenderizarETirarOFundoBrancoDeixandoOFundoTransparente8982421 = '/invoice-management/assets/figma-6d3bca1226f092d5.png';
const imgCloseButton = '/invoice-management/assets/figma-1d35d8482efa50be.svg';
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
type UiBadgeProps = {
    className?: string;
    label?: string;
    type?: "Success";
};
function UiBadge({ className, label = "BADGE", type = "Success" }: UiBadgeProps) {
    return (<div className={className || "bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative"} data-node-id="17:2887">
      <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#1a1c16] text-[10px] uppercase whitespace-nowrap" data-node-id="17:2893">
        {label}
      </p>
    </div>);
}
export default function Screen() {
    return (<div className="bg-[#fafaef] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col items-start relative shadow-[0px_12px_32px_0px_rgba(26,28,23,0.2)] size-full" data-node-id="82:9198" data-name="Modal">
      <div className="bg-[#f3f3ec] border-[#e3e3d8] border-b border-solid content-stretch flex items-center justify-between overflow-clip px-[24px] py-[22px] relative shrink-0 w-full" data-node-id="82:9199" data-name="Header">
        <p className="[word-break:break-word] font-['Space_Grotesk:Bold'] font-bold leading-[normal] relative shrink-0 text-[18px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:9200">
          INVOICE_DETAILS
        </p>
        <Action className="relative shrink-0 size-[24px]" data-node-id="82:9201" data-name="Close button" label="Close">
          <img alt="" className="figma-asset" src={imgCloseButton}/>
        </Action>
      </div>
      <div className="content-stretch flex flex-col gap-[16px] items-start overflow-clip pb-[8px] pt-[20px] px-[24px] relative shrink-0 w-full" data-node-id="82:9203" data-name="Body">
        <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex items-center justify-between overflow-clip px-[20px] py-[16px] relative shrink-0 w-full" data-node-id="82:9204" data-name="Invoice head">
          <div className="content-stretch flex gap-[14px] items-center overflow-clip relative shrink-0" data-node-id="82:9205" data-name="Company">
            <div className="h-[38px] relative shrink-0 w-[32px]" data-node-id="111:18456" data-name="Firefly_renderizar e tirar o fundo branco, deixando o fundo transparente 898242 1">
              <img alt="" className="figma-asset" height="38" src={imgFireflyRenderizarETirarOFundoBrancoDeixandoOFundoTransparente8982421} width="32"/>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] overflow-clip relative shrink-0 whitespace-nowrap" data-node-id="82:9208" data-name="Company text">
              <p className="font-['Space_Grotesk:Bold'] font-bold relative shrink-0 text-[18px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9209">
                BA EXPRESS LIMITED
              </p>
              <p className="font-['IBM_Plex_Mono:Regular'] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9210">
                20 THE LAURELS · INFO@BAEXPRESS.CO.UK · VAT GB238595859
              </p>
            </div>
          </div>
          <div className="content-stretch flex flex-col gap-[6px] items-end overflow-clip relative shrink-0" data-node-id="82:9211" data-name="Invoice number">
            <div className="bg-[#003b3e] content-stretch flex items-start overflow-clip px-[12px] py-[6px] relative shrink-0" data-node-id="82:9212" data-name="Tag">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[#fafaef] text-[12px] whitespace-nowrap" data-node-id="82:9213">
                SELF BILLING INVOICE #20260801-AD
              </p>
            </div>
            <UiBadge className="bg-[#b2f746] content-stretch flex items-center px-[8px] py-[3px] relative shrink-0" label="INVOICED"/>
          </div>
        </div>
        <div className="content-stretch flex gap-[16px] items-start overflow-clip relative shrink-0 w-full" data-node-id="82:9215" data-name="Details">
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative self-stretch" data-node-id="82:9216" data-name="VENDOR DETAILS">
            <div className="bg-[#f3f3ec] border-[var(--border\/default,#bfc8c9)] border-b border-solid content-stretch flex items-start overflow-clip px-[16px] py-[10px] relative shrink-0 w-full" data-node-id="82:9217" data-name="Head">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:9218">
                VENDOR DETAILS
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic overflow-clip px-[16px] py-[14px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9219" data-name="Rows">
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9220" data-name="NAME">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9221">
                  NAME
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9222">
                  Adriano Dutra
                </p>
              </div>
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9223" data-name="VENDOR ID">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9224">
                  VENDOR ID
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9225">
                  AD003
                </p>
              </div>
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9226" data-name="EMAIL">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9227">
                  EMAIL
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9228">
                  arod896@hotmail.com
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative self-stretch" data-node-id="82:9229" data-name="INVOICE DETAILS">
            <div className="bg-[#f3f3ec] border-[var(--border\/default,#bfc8c9)] border-b border-solid content-stretch flex items-start overflow-clip px-[16px] py-[10px] relative shrink-0 w-full" data-node-id="82:9230" data-name="Head">
              <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] whitespace-nowrap" data-node-id="82:9231">
                INVOICE DETAILS
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic overflow-clip px-[16px] py-[14px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9232" data-name="Rows">
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9233" data-name="INVOICE DATE">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9234">
                  INVOICE DATE
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9235">
                  25/09/2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9236" data-name="DUE DATE">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9237">
                  DUE DATE
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9238">
                  25/09/2026
                </p>
              </div>
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9239" data-name="PAYMENT TERMS">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9240">
                  PAYMENT TERMS
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9241">
                  NET 15
                </p>
              </div>
              <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9242" data-name="TOTAL STOPS">
                <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9243">
                  TOTAL STOPS
                </p>
                <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9244">
                  932
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="[word-break:break-word] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-col items-start leading-[normal] not-italic overflow-clip relative shrink-0 w-full" data-node-id="82:9245" data-name="Line items">
          <div className="bg-[#f3f3ec] content-stretch flex font-['IBM_Plex_Mono:SemiBold'] gap-[8px] items-center overflow-clip px-[16px] py-[10px] relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)] w-full" data-node-id="82:9246" data-name="Head">
            <p className="relative shrink-0 w-[140px]" data-node-id="82:9247">
              DATE
            </p>
            <p className="flex-[1_0_0] min-w-px relative" data-node-id="82:9248">
              ROUTE
            </p>
            <p className="relative shrink-0 w-[120px]" data-node-id="82:9249">
              VAT
            </p>
            <p className="relative shrink-0 text-right w-[120px]" data-node-id="82:9250">
              AMOUNT
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9251" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9252">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9253">
              DHOC, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9254">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9255">
              £130.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9256" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9257">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9258">
              LL4B
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9259">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9260">
              £160.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9261" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9262">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9263">
              DHOC, LL4B
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9264">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9265">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9266" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9267">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9268">
              LL4B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9269">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9270">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9271" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9272">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9273">
              LL3B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9274">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9275">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9276" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9277">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9278">
              LL3B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9279">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9280">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9281" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9282">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9283">
              LL3C
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9284">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9285">
              £160.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9286" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9287">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9288">
              DHOC, LL3C
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9289">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9290">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9291" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9292">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9293">
              DHOC, LL3C
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9294">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9295">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9296" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9297">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9298">
              DHOC, LL3C
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9299">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9300">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9301" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9302">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9303">
              DHOC, LL3C
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9304">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9305">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9306" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9307">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9308">
              DHOC, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9309">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9310">
              £130.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9311" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9312">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9313">
              LL4B
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9314">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9315">
              £160.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9316" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9317">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9318">
              LL4B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9319">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9320">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9321" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9322">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9323">
              LL4B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9324">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9325">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9326" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9327">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9328">
              LL4X, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9329">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9330">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9331" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9332">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9333">
              LL3A, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9334">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9335">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9336" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9337">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9338">
              LL4X
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9339">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9340">
              £160.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9341" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9342">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9343">
              LL3D, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9344">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9345">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9346" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9347">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9348">
              LL3B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9349">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9350">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9351" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9352">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9353">
              LL3B, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9354">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9355">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9356" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9357">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9358">
              LL4X, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9359">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9360">
              £175.00
            </p>
          </div>
          <div className="bg-[var(--background\/card,white)] border-[#e3e3d8] border-solid border-t content-stretch flex gap-[8px] items-center overflow-clip px-[16px] py-[7px] relative shrink-0 text-[12px] w-full" data-node-id="82:9361" data-name="Row">
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-[140px]" data-node-id="82:9362">
              25/09/2026
            </p>
            <p className="flex-[1_0_0] font-['IBM_Plex_Mono:Regular'] min-w-px relative text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9363">
              DHOC, DHOC
            </p>
            <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[color:var(--text\/secondary,#3f4849)] w-[120px]" data-node-id="82:9364">
              NO VAT
            </p>
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] text-right w-[120px]" data-node-id="82:9365">
              £130.00
            </p>
          </div>
        </div>
        <div className="[word-break:break-word] content-stretch flex gap-[16px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9366" data-name="Totals">
          <div className="bg-[#fcebe8] border border-[#ba1a1a] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip px-[16px] py-[14px] relative self-stretch" data-node-id="82:9367" data-name="Deductions">
            <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[#ba1a1a] text-[11px]" data-node-id="82:9368">
              DEDUCTIONS
            </p>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9369" data-name="REPAIRS & DAMAGES · RPD-ADUTRA-090726-003">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9370">{`REPAIRS & DAMAGES · RPD-ADUTRA-090726-003`}</p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[#ba1a1a] text-[12px]" data-node-id="82:9371">
                −£150.00
              </p>
            </div>
            <div className="border-[#f2c4bc] border-solid border-t content-stretch flex font-['IBM_Plex_Mono:SemiBold'] items-start justify-between overflow-clip pt-[8px] relative shrink-0 text-[#ba1a1a] w-full" data-node-id="82:9372" data-name="TOTAL DEDUCTIONS">
              <p className="relative shrink-0 text-[11px]" data-node-id="82:9373">
                TOTAL DEDUCTIONS
              </p>
              <p className="relative shrink-0 text-[12px]" data-node-id="82:9374">
                −£150.00
              </p>
            </div>
          </div>
          <div className="bg-[var(--background\/card,white)] border border-[var(--border\/default,#bfc8c9)] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-w-px overflow-clip px-[16px] py-[14px] relative" data-node-id="82:9375" data-name="Summary">
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9376" data-name="INVOICE SUBTOTAL">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9377">
                INVOICE SUBTOTAL
              </p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9378">
                £3,830.00
              </p>
            </div>
            <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full" data-node-id="82:9379" data-name="VAT">
              <p className="font-['IBM_Plex_Mono:Regular'] relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)]" data-node-id="82:9380">
                VAT
              </p>
              <p className="font-['IBM_Plex_Mono:SemiBold'] relative shrink-0 text-[12px] text-[color:var(--text\/primary,#1a1c16)]" data-node-id="82:9381">
                £0.00
              </p>
            </div>
            <div className="border-[var(--text\/primary,#1a1c16)] border-solid border-t-2 content-stretch flex font-['IBM_Plex_Mono:SemiBold'] items-start justify-between overflow-clip pt-[8px] relative shrink-0 text-[color:var(--text\/primary,#1a1c16)] w-full" data-node-id="82:9382" data-name="INVOICE TOTAL">
              <p className="relative shrink-0 text-[11px]" data-node-id="82:9383">
                INVOICE TOTAL
              </p>
              <p className="relative shrink-0 text-[12px]" data-node-id="82:9384">
                £3,830.00
              </p>
            </div>
          </div>
        </div>
        <div className="[word-break:break-word] bg-[#003b3e] content-stretch flex items-center justify-between leading-[normal] overflow-clip px-[20px] py-[18px] relative shrink-0 w-full whitespace-nowrap" data-node-id="82:9385" data-name="Balance due">
          <p className="font-['IBM_Plex_Mono:SemiBold'] not-italic relative shrink-0 text-[#fafaef] text-[12px]" data-node-id="82:9386">
            BALANCE DUE · PAYABLE 25/09/2026
          </p>
          <p className="font-['Space_Grotesk:Bold'] font-bold relative shrink-0 text-[#b2f746] text-[26px]" data-node-id="82:9387">
            £3,680.00
          </p>
        </div>
      </div>
      <div className="content-stretch flex items-center justify-between overflow-clip px-[24px] py-[20px] relative shrink-0 w-full" data-node-id="82:9388" data-name="Footer">
        <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[normal] not-italic relative shrink-0 text-[11px] text-[color:var(--text\/secondary,#3f4849)] whitespace-nowrap" data-node-id="82:9389">
          REC-2025005 · 23 WORKING DAYS
        </p>
        <div className="content-stretch flex gap-[12px] items-start overflow-clip relative shrink-0" data-node-id="82:9390" data-name="Buttons">
          <Action className="border border-[var(--text\/primary,#1a1c16)] border-solid content-stretch flex h-[36px] items-center justify-center px-[16px] relative shrink-0" data-node-id="82:9391" data-name="UI/Button">
            <p className="[word-break:break-word] font-['IBM_Plex_Mono:SemiBold'] leading-[16px] not-italic relative shrink-0 text-[#446900] text-[12px] uppercase whitespace-nowrap" data-node-id="I82:9391;89:60779">
              CLOSE
            </p>
          </Action>
          <UiButton className="bg-[#f5f5f4] border border-[#bfc8c9] border-solid content-stretch cursor-pointer flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="↓ DOWNLOAD" type="Secondary"/>
          <UiButton className="bg-[#b2f746] border border-[#446900] border-solid content-stretch cursor-pointer flex h-[36px] items-center justify-center px-[16px] relative shrink-0" label="SCHEDULE PAYMENT"/>
        </div>
      </div>
    </div>);
}
