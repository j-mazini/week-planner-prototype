import {createContext, useContext} from 'react';
import type { WeekPlannerRecord } from '../week-planner/contexts/PlannerContext';
export type Screen = 'overview'|'special-deliveries'|'all-stops'|'shipment-details'|'accident-report'|'report-issue'|'finish-route';
export type Report = {kind:'accident'|'issue'; category?:string; description:string; photos:File[]};
export type DriverRouteData = {assignment:WeekPlannerRecord; operation?:Record<string, unknown>; stops:Record<string, unknown>[]; postcodes:string[]; totalStops:number; paidStops:number; unpaidStops:number; deliveries:number; pickups:number; pre12:number};
export const AppContext = createContext<{navigate:(screen:Screen)=>void; finish:()=>void; submit:(report:Report)=>Promise<void>; driverName:string; routes:DriverRouteData[]; routeIndex:number; routeLoading:boolean; routeError:string; selectRoute:(index:number)=>void}>({navigate:()=>{}, finish:()=>{}, submit:async()=>{}, driverName:"Driver", routes:[], routeIndex:0, routeLoading:true, routeError:"", selectRoute:()=>{}});
export const useApp=()=>useContext(AppContext);
