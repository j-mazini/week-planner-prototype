import {useState} from "react";
import {useApp} from "../state";
const imgFrame21 = "/route-balance-mobile/assets/0afa7e2e-f3b8-44e1-9b86-3fada8a5f2f8.svg";
const imgVector = "/route-balance-mobile/assets/c73fb0d6-63aa-4e9c-8e68-a752e63df519.svg";
const imgShieldAlert = "/route-balance-mobile/assets/ac5a32b3-61be-4074-afc0-f104e5fa54bf.svg";
const imgAlertTriangle = "/route-balance-mobile/assets/e8b4e889-30ec-4ba0-b78d-fa5563f98ffd.svg";
const imgCheck = "/route-balance-mobile/assets/b0116b5d-7f1d-4f37-9578-85d0209fada1.svg";

function Button({ className }: { className?: string }) {
 const {navigate} = useApp();
  return (
    <button type="button" onClick={() => navigate("all-stops")} className={className || "design-1"} data-node-id="394:7682" data-name="Button">
      <div className="design-2" data-node-id="322:14697">
        <p className="design-3">SEE ALL STOPS</p>
      </div>
    </button>
  );
}

/**
 * The daily-overview row carries `vehicle` as an object — reading it straight into JSX
 * rendered "[object Object]". Prefer its plate, then the flat fields beside it.
 */
function vehiclePlate(operation?: Record<string, unknown>): string {
  const vehicle = operation?.vehicle;
  const fromObject = vehicle && typeof vehicle === "object" && !Array.isArray(vehicle)
    ? (vehicle as Record<string, unknown>).vehicleRegistrationPlate
    : vehicle;
  for (const candidate of [fromObject, operation?.vehicleRegistration, operation?.vrn]) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (typeof candidate === "number") return String(candidate);
  }
  return "—";
}

export default function Overview() {
  const {navigate, finish, driverName, routes, routeIndex, routeLoading} = useApp();
  const route = routes[routeIndex];
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="design-4" data-node-id="322:14616" data-name="LogixSphere [Route Balance - mobile]">
      <div className="design-14" data-node-id="322:14625" data-name="main-scroll">
        <div className="design-15" data-node-id="322:14626" data-name="routes-section">
          <div className="design-16" data-node-id="322:14627" data-name="section-header">
            <p className="design-17" data-node-id="322:14628">
              Active Route Overview
            </p>
            <div className="design-18" data-node-id="322:14629" data-name="Container">
              <div className="design-19" data-node-id="322:14630" data-name="Container">
                <div className="design-20" data-node-id="322:14631">
                  <p className="design-21">{route?.assignment.date || (routeLoading ? "Loading route…" : "No scheduled route")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="design-22 route-overview-card" data-node-id="322:14632" data-name="Route Card">
            <div className="design-23 route-overview-summary" data-node-id="322:14633" data-name="Header Area">
              <div className="design-24">
                <div className="design-25" data-node-id="322:14634" data-name="Margin">
                  <div className="design-26" data-node-id="322:14635" data-name="Container">
                    <div className="design-27" data-node-id="322:14636" data-name="Container">
                      <div className="design-28" data-node-id="322:14637">
                        <div className="design-29" data-node-id="322:14638" data-name="Container">
                          <div className="design-30" data-node-id="322:14639">
                            <p className="design-31">{route ? `${route.assignment.route || "ASSIGNED ROUTE"} • MANIFEST` : routeLoading ? "LOADING ROUTE" : "NO ACTIVE ROUTE"}</p>
                          </div>
                        </div>
                        <div className="design-32" data-node-id="322:14640" data-name="Heading 1">
                          <div className="design-33" data-node-id="322:14641">
                            <p className="design-3">{driverName}</p>
                          </div>
                        </div>
                        <div className="design-34" data-node-id="322:14642">
                          <div className="design-35" data-node-id="322:14643" data-name="Heading 3">
                            <div className="design-36" data-node-id="322:14644">
                              <p className="design-3">{vehiclePlate(route?.operation)}</p>
                            </div>
                          </div>
                          <div className="design-19" data-node-id="322:14645" data-name="Margin">
                            <div className="design-37" data-node-id="322:14646" data-name="Container">
                              <div className="design-38" data-node-id="322:14647" data-name="Background+Border">
                                <div className="design-39" data-node-id="322:14648">
                                  <p className="design-31">{String(route?.assignment.raw.shift ?? "—")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="design-40" data-node-id="322:14649" data-name="Background+Border">
                  <div className="design-23" data-node-id="322:14650" data-name="Container">
                    <div className="design-41">
                      <div className="design-19" data-node-id="322:14651" data-name="Container">
                        <div className="design-39" data-node-id="322:14652">
                          <p className="design-31">{route ? `${route.paidStops} / ${route.totalStops} STOPS` : "— STOPS"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="design-42" data-node-id="322:14653" data-name="Background">
                    <div className="design-43">
                      <div className="design-44" data-node-id="322:14654" data-name="Background" style={{width: route?.totalStops ? `${Math.min(100, route.paidStops / route.totalStops * 100)}%` : "0%"}} />
                    </div>
                  </div>
                </div>
                <div className="design-45" data-node-id="322:14655" data-name="Horizontal Divider" />
              </div>
            </div>
            <div className="design-23 route-overview-details" data-node-id="322:14656" data-name="Notes:margin">
              <div className="design-46">
                <button type="button" onClick={() => setCollapsed(!collapsed)} aria-label="Expand or collapse route" aria-expanded={!collapsed} aria-controls="route-postcodes" className="design-47" data-node-id="322:14657">
                  <img alt="" className="asset" src={imgFrame21} style={{display:collapsed ? "none" : undefined}} />{collapsed && <span aria-hidden="true">+</span>}
                </button>
                <div id="route-postcodes" className="design-48" style={{display: collapsed ? "none" : undefined}} data-node-id="322:14659">
                  <button type="button" onClick={() => navigate('special-deliveries')} className="design-49" data-node-id="322:14660" data-name="Special Deliveries">
                    <div className="design-50" data-node-id="I322:14660;209:10838" data-name="Main Content: Data Table">
                      <div className="design-51" data-node-id="I322:14660;209:10839" data-name="Button">
                        <div className="design-52">
                          <div className="design-53" data-node-id="I322:14660;209:10840">
                            <div className="design-54">
                              <div className="design-55" data-node-id="I322:14660;209:10841">
                                <p className="design-3">SPECIAL DELIVERIES</p>
                              </div>
                              <div className="design-56" data-node-id="I322:14660;209:10842" data-name="Vector">
                                <img alt="" className="asset" src={imgVector} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  <div className="design-49" data-node-id="322:14661" data-name="Notes:margin">
                    <div className="design-57" data-node-id="322:14662" data-name="Main Content: Data Table">
                      <div className="design-58" data-node-id="322:14663" data-name="Background+HorizontalBorder">
                        <div className="design-59">
                          <div className="design-60" data-node-id="322:14664" data-name="Container">
                            <div className="design-61">
                              <div className="design-62" data-node-id="322:14665">
                                <p className="design-31">SUBPOSTCODE</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-63" data-node-id="322:14666" data-name="Container">
                            <div className="design-64">
                              <div className="design-65" data-node-id="322:14667">
                                <p className="design-31">DEL</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-66" data-node-id="322:14668" data-name="Container">
                            <div className="design-64">
                              <div className="design-65" data-node-id="322:14669">
                                <p className="design-31">PU</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-67" data-node-id="322:14670" data-name="Container">
                            <div className="design-64">
                              <div className="design-65" data-node-id="322:14671">
                                <p className="design-31">TOTAL</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="design-68" data-node-id="322:14672" data-name="HorizontalBorder">
                        <div className="design-69">
                          <div className="design-70" data-node-id="322:14673" data-name="Container">
                            <div className="design-71">
                              <div className="design-72" data-node-id="322:14674" data-name="Container">
                                <div className="design-73" data-node-id="322:14675">
                                  <p className="design-3">ME1</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="design-74" data-node-id="322:14676" data-name="Container">
                            <div className="design-75">
                              <div className="design-76" data-node-id="322:14677">
                                <p className="design-3">2</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-77" data-node-id="322:14678" data-name="Container">
                            <div className="design-75">
                              <div className="design-78" data-node-id="322:14679">
                                <p className="design-3">1</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-77" data-node-id="322:14680" data-name="Container">
                            <div className="design-75">
                              <div className="design-78" data-node-id="322:14681">
                                <p className="design-3">3</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="design-68" data-node-id="322:14682" data-name="HorizontalBorder">
                        <div className="design-69">
                          <div className="design-70" data-node-id="322:14683" data-name="Container">
                            <div className="design-71">
                              <div className="design-72" data-node-id="322:14684" data-name="Container">
                                <div className="design-73" data-node-id="322:14685">
                                  <p className="design-3">ME2</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="design-74" data-node-id="322:14686" data-name="Container">
                            <div className="design-75">
                              <div className="design-76" data-node-id="322:14687">
                                <p className="design-3">1</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-77" data-node-id="322:14688" data-name="Container">
                            <div className="design-75">
                              <div className="design-78" data-node-id="322:14689">
                                <p className="design-3">4</p>
                              </div>
                            </div>
                          </div>
                          <div className="design-77" data-node-id="322:14690" data-name="Container">
                            <div className="design-79">
                              <div className="design-78" data-node-id="322:14691">
                                <p className="design-3">5</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="design-48" data-node-id="322:14692">
                  <div className="design-80" data-node-id="322:14693">
                    <button type="button" onClick={() => navigate('shipment-details')} className="design-81" data-node-id="322:14694" data-name="Button">
                      <div className="design-82" data-node-id="322:14695">
                        <p className="design-3">SEE DETAILS</p>
                      </div>
                    </button>
                    <Button className="design-83" />
                  </div>
                  <div className="design-84" data-node-id="322:14698" data-name="Summary Metrics">
                    <div className="design-85" data-node-id="322:14699" data-name="Card">
                      <div className="design-53" data-node-id="I322:14699;194:4367" data-name="Container">
                        <div className="design-64">
                          <div className="design-86" data-node-id="I322:14699;194:4368">
                            <p className="design-31">DELIVERIES</p>
                          </div>
                        </div>
                      </div>
                      <div className="design-87" data-node-id="I322:14699;194:4369" data-name="Container">
                        <div className="design-88">
                          <div className="design-89" data-node-id="I322:14699;194:4370">
                            <p className="design-90">10</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="design-85" data-node-id="322:14700" data-name="Card">
                      <div className="design-53" data-node-id="I322:14700;194:4367" data-name="Container">
                        <div className="design-64">
                          <div className="design-91" data-node-id="I322:14700;194:4368">
                            <p className="design-31">PICKUPS</p>
                          </div>
                        </div>
                      </div>
                      <div className="design-87" data-node-id="I322:14700;194:4369" data-name="Container">
                        <div className="design-88">
                          <div className="design-89" data-node-id="I322:14700;194:4370">
                            <p className="design-90">5</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="design-85" data-node-id="322:14701" data-name="Card">
                      <div className="design-53" data-node-id="I322:14701;194:4367" data-name="Container">
                        <div className="design-64">
                          <div className="design-91" data-node-id="I322:14701;194:4368">
                            <p className="design-31">PRE 12</p>
                          </div>
                        </div>
                      </div>
                      <div className="design-87" data-node-id="I322:14701;194:4369" data-name="Container">
                        <div className="design-88">
                          <div className="design-89" data-node-id="I322:14701;194:4370">
                            <p className="design-90">2</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="design-92" data-node-id="322:14702" data-name="Card">
                    <div className="design-53" data-node-id="I322:14702;194:4372" data-name="Container">
                      <div className="design-64">
                        <div className="design-91" data-node-id="I322:14702;194:4373">
                          <p className="design-31">TOTAL</p>
                        </div>
                      </div>
                    </div>
                    <div className="design-93" data-node-id="I322:14702;194:4374" data-name="Container">
                      <div className="design-88">
                        <div className="design-94" data-node-id="I322:14702;194:4375">
                          <p className="design-90">15</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="design-95" data-node-id="322:14703">
              <div className="design-96">
                <div className="design-97" data-name="Actions" />
              </div>
            </div>
            <div className="design-98" data-node-id="396:8062" data-name="action-buttons">
              <div className="design-99">
                <button type="button" onClick={() => navigate('accident-report')} className="design-100" data-node-id="396:8063" data-name="Accident Report">
                  <div className="design-101" data-node-id="396:8064" data-name="icon-wrap">
                    <div className="design-102" data-node-id="396:8065" data-name="shield-alert">
                      <img alt="" className="asset" src={imgShieldAlert} />
                    </div>
                  </div>
                  <p className="design-103" data-node-id="396:8067">
                    Accident Report
                  </p>
                </button>
                <button type="button" onClick={() => navigate('report-issue')} className="design-104" data-node-id="396:8068" data-name="Report Issue">
                  <div className="design-105" data-node-id="396:8069" data-name="icon-wrap">
                    <div className="design-102" data-node-id="396:8070" data-name="alert-triangle">
                      <img alt="" className="asset" src={imgAlertTriangle} />
                    </div>
                  </div>
                  <p className="design-103" data-node-id="396:8072">
                    Report Issue
                  </p>
                </button>
                <button type="button" onClick={() => navigate('finish-route')} className="design-106" data-node-id="396:8073" data-name="Finish">
                  <div className="design-101" data-node-id="396:8074" data-name="icon-wrap">
                    <div className="design-102" data-node-id="396:8075" data-name="check">
                      <img alt="" className="asset" src={imgCheck} />
                    </div>
                  </div>
                  <div className="design-107" data-node-id="396:8077">
                    <p className="design-108">Finish</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="design-109" data-node-id="322:14708" data-name="Footer">
        <div className="design-53" data-node-id="I322:14708;194:3636" data-name="Container">
          <div className="design-110">
            <div className="design-111" data-node-id="I322:14708;194:3637">
              <p className="design-112">© 2026 LOGIXSPHERE OPERATIONAL SYSTEMS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
