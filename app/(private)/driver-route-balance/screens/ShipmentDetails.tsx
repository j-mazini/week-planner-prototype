import {useState} from "react";
import {useApp} from "../state";
const imgArrowLeft = "/route-balance-mobile/assets/50fa1c47-a900-4f89-b8b0-92313de6a137.svg";

export default function ShipmentDetails() {
  const {navigate, finish, driverName, routes, routeIndex} = useApp();
  const route = routes[routeIndex];
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="design-4" data-node-id="322:14978" data-name="LogixSphere [Route Balance - mobile]">
      <div className="design-113" data-node-id="322:14987" data-name="main-scroll">
        <button type="button" onClick={() => navigate('overview')} aria-label="Back to route overview" className="design-114" data-node-id="322:14988" data-name="back-header">
          <div className="design-115" data-node-id="322:14989" data-name="back-arrow-container">
            <div className="design-116" data-node-id="322:14990" data-name="arrow-left">
              <img alt="" className="asset" src={imgArrowLeft} />
            </div>
          </div>
          <div className="design-19" data-node-id="322:14992" data-name="header-title">
            <p className="design-146" data-node-id="322:14993">
              Shipment Details
            </p>
          </div>
        </button>
        <div className="design-147" data-node-id="322:14994" data-name="content">
          <div className="design-148" data-node-id="322:14995" data-name="overview-technical-grid">
            <div className="design-149" data-node-id="322:14996" data-name="grid-row-1">
              <div className="design-150" data-node-id="322:14997" data-name="grid-cell">
                <p className="design-151" data-node-id="322:14998">
                  ROUTE ID
                </p>
                <p className="design-152" data-node-id="322:14999">
                  {route?.assignment.route || "—"}
                </p>
              </div>
              <div className="design-153" data-node-id="322:15000" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15001">
                  DRIVER
                </p>
                <p className="design-152" data-node-id="322:15002">
                  {driverName}
                </p>
              </div>
            </div>
            <div className="design-149" data-node-id="322:15003" data-name="grid-row-2">
              <div className="design-150" data-node-id="322:15004" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15005">
                  VEHICLE
                </p>
                <p className="design-152" data-node-id="322:15006">
                  {String(route?.operation?.vehicleRegistration ?? "—")}
                </p>
              </div>
              <div className="design-153" data-node-id="322:15007" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15008">
                  TOTAL SToPS
                </p>
                <p className="design-152" data-node-id="322:15009">
                  {route ? `${route.totalStops} Stops` : "—"}
                </p>
              </div>
            </div>
            <div className="design-154" data-node-id="322:15010" data-name="grid-row-2">
              <div className="design-155" data-node-id="322:15011" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15012">
                  TOTAL PIECES
                </p>
                <p className="design-152" data-node-id="322:15013">
                  224
                </p>
              </div>
              <div className="design-153" data-node-id="322:15014" data-name="grid-cell">
                <p className="design-156" data-node-id="322:15015">
                  SOMA PHYS (KG)
                </p>
                <p className="design-157" data-node-id="322:15016">
                  9972.61
                </p>
              </div>
            </div>
            <div className="design-37" data-node-id="322:15017" data-name="grid-row-3">
              <div className="design-158" data-node-id="322:15018" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15019">
                  DELIVERIES / PICKUPS
                </p>
                <p className="design-152" data-node-id="322:15020">
                  {route ? `${route.deliveries} / ${route.pickups}` : "—"}
                </p>
              </div>
              <div className="design-159" data-node-id="322:15021" data-name="grid-cell">
                <p className="design-160" data-node-id="322:15022">
                  COMPLETION
                </p>
                <div className="design-161" data-node-id="322:15023" data-name="completion-badge">
                  <div className="design-162" data-node-id="322:15024" data-name="badge">
                    <p className="design-163" data-node-id="322:15025">
                      56%
                    </p>
                  </div>
                  <div className="design-164" data-node-id="322:15026" data-name="progress-bar-track">
                    <div className="design-165" data-node-id="322:15027" data-name="progress-bar-fill" />
                  </div>
                </div>
              </div>
            </div>
            <div className="design-166" data-node-id="322:15028" data-name="grid-row-2">
              <div className="design-167" data-node-id="322:15029" data-name="grid-cell">
                <p className="design-151" data-node-id="322:15030">
                  TOTAL SHIPMENTS
                </p>
                <p className="design-152" data-node-id="322:15031">
                  29
                </p>
              </div>
            </div>
          </div>
          <div className="design-168" data-node-id="322:15032" data-name="table-section-title">
            <p className="design-169" data-node-id="322:15033">
              Shipment Breakdown by Type
            </p>
            <p className="design-170" data-node-id="322:15034">
              6 GROUPS
            </p>
          </div>
          <div className="design-171" data-node-id="322:15035" data-name="breakdown-table">
            <div className="design-172" data-node-id="322:15036" data-name="table-header">
              <p className="design-70" data-node-id="322:15037">
                TYPE
              </p>
              <p className="design-173" data-node-id="322:15038">
                PIECES
              </p>
              <p className="design-173" data-node-id="322:15039">
                SHPMTS
              </p>
              <p className="design-174" data-node-id="322:15040">
                GROSS
              </p>
              <p className="design-175" data-node-id="322:15041">
                % TOT
              </p>
            </div>
            <div className="design-176" data-node-id="322:15042" data-name="table-row">
              <p className="design-177" data-node-id="322:15043">
                COY
              </p>
              <p className="design-178" data-node-id="322:15044">
                59
              </p>
              <p className="design-178" data-node-id="322:15045">
                5
              </p>
              <p className="design-179" data-node-id="322:15046">
                1,413.01
              </p>
              <p className="design-180" data-node-id="322:15047">
                14%
              </p>
            </div>
            <div className="design-181" data-node-id="322:15048" data-name="table-row">
              <p className="design-177" data-node-id="322:15049">
                COY-S1
              </p>
              <p className="design-178" data-node-id="322:15050">
                50
              </p>
              <p className="design-178" data-node-id="322:15051">
                6
              </p>
              <p className="design-179" data-node-id="322:15052">
                1,937.41
              </p>
              <p className="design-180" data-node-id="322:15053">
                19%
              </p>
            </div>
            <div className="design-176" data-node-id="322:15054" data-name="table-row">
              <p className="design-177" data-node-id="322:15055">
                COY-S2
              </p>
              <p className="design-178" data-node-id="322:15056">
                20
              </p>
              <p className="design-178" data-node-id="322:15057">
                6
              </p>
              <p className="design-179" data-node-id="322:15058">
                2,028.36
              </p>
              <p className="design-180" data-node-id="322:15059">
                20%
              </p>
            </div>
            <div className="design-181" data-node-id="322:15060" data-name="table-row">
              <p className="design-177" data-node-id="322:15061">
                PLY
              </p>
              <p className="design-178" data-node-id="322:15062">
                31
              </p>
              <p className="design-178" data-node-id="322:15063">
                3
              </p>
              <p className="design-179" data-node-id="322:15064">
                512.23
              </p>
              <p className="design-180" data-node-id="322:15065">
                5%
              </p>
            </div>
            <div className="design-176" data-node-id="322:15066" data-name="table-row">
              <p className="design-177" data-node-id="322:15067">
                NCV
              </p>
              <p className="design-178" data-node-id="322:15068">
                20
              </p>
              <p className="design-178" data-node-id="322:15069">
                3
              </p>
              <p className="design-179" data-node-id="322:15070">
                695.20
              </p>
              <p className="design-180" data-node-id="322:15071">
                6%
              </p>
            </div>
            <div className="design-181" data-node-id="322:15072" data-name="table-row">
              <p className="design-177" data-node-id="322:15073">
                PALL
              </p>
              <p className="design-178" data-node-id="322:15074">
                56
              </p>
              <p className="design-178" data-node-id="322:15075">
                7
              </p>
              <p className="design-179" data-node-id="322:15076">
                2,668.82
              </p>
              <p className="design-180" data-node-id="322:15077">
                27%
              </p>
            </div>
            <div className="design-182" data-node-id="322:15078" data-name="table-totals">
              <p className="design-183" data-node-id="322:15079">
                TOTAL
              </p>
              <p className="design-184" data-node-id="322:15080">
                224
              </p>
              <p className="design-184" data-node-id="322:15081">
                29
              </p>
              <p className="design-185" data-node-id="322:15082">
                9,972.41
              </p>
              <p className="design-186" data-node-id="322:15083">
                100%
              </p>
            </div>
          </div>
          <div className="design-187" data-node-id="322:15084" data-name="special-indicators">
            <p className="design-188" data-node-id="322:15085">
              SPECIAL INDICATORS:
            </p>
            <div className="design-9" data-node-id="322:15086" data-name="indicator-pills">
              <div className="design-189" data-node-id="322:15087" data-name="pill">
                <p className="design-190" data-node-id="322:15088">
                  Pre-12: 7
                </p>
              </div>
              <div className="design-189" data-node-id="322:15089" data-name="pill">
                <p className="design-190" data-node-id="322:15090">
                  ASR: 25
                </p>
              </div>
              <div className="design-189" data-node-id="322:15091" data-name="pill">
                <p className="design-190" data-node-id="322:15092">
                  DSR: 22
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="design-109" data-node-id="322:15093" data-name="Footer">
        <div className="design-53" data-node-id="I322:15093;194:3636" data-name="Container">
          <div className="design-110">
            <div className="design-111" data-node-id="I322:15093;194:3637">
              <p className="design-112">© 2026 LOGIXSPHERE OPERATIONAL SYSTEMS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
