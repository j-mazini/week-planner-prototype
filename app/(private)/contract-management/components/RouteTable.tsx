import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface Route {
  id: string;
  type: 'Child' | 'Flex';
  vendor: string;
  postcodes: string[];
  targetDel: number;
  targetPu: number;
  puCutoff: string;
  dificultLevel: number;
  notes: string;
  flexIn: string;
  flexOut: string;
  meetAddress: string;
  meetPostcode: string;
  meetTime: string;
  sortStart: string;
  sortFinish: string;
  timeOnRoute: string;
  arriveTime: string;
  break: number;
  sporhTarget: number;
  avgMon: number;
  avgTue: number;
  avgWed: number;
  avgThu: number;
  avgFri: number;
}

interface RouteTableProps {
  routes: Route[];
  loopId: string;
  isLoading: boolean;
}

const RouteTableComponent = ({
  routes,
  loopId: _loopId,
  isLoading,
}: RouteTableProps) => {
  const tableRows = useMemo(() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="text-center pt-4 text-[#6c757d]">
            <div className="flex items-center justify-center gap-2">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Loading routes...
            </div>
          </td>
        </tr>
      );
    }
    
    if (routes.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center pt-4 text-[#6c757d]">
            No routes found.
          </td>
        </tr>
      );
    }
    
    return routes.map((route, index) => {
      const typeBadgeClass = route.type.toLowerCase() === 'child' 
        ? 'bg-red-50 text-red-700 border-red-200' 
        : 'bg-purple-50 text-purple-700 border-purple-200';

      return (
        <tr 
          key={route.id}
          className={`transition-colors duration-150 ease-out ${
            index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fa]'
          } hover:!bg-[#e9ecef]`}
        >
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
            <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border", typeBadgeClass)}>
              {route.type}
            </span>
          </td>
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis">
            {route.vendor}
          </td>
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis">
            <div className="flex flex-wrap gap-1">
              {route.postcodes.map((postcode) => (
                <span key={postcode} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {postcode}
                </span>
              ))}
            </div>
          </td>
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
            {route.targetDel}
          </td>
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap">
            {route.targetPu}
          </td>
          <td className="py-3 px-4 text-[0.85rem] align-middle overflow-hidden text-ellipsis text-center whitespace-nowrap font-medium">
            {(route.targetDel ?? 0) + (route.targetPu ?? 0)}
          </td>
        </tr>
      );
    });
  }, [routes, isLoading]);

  return (
    <div
      className={[
        "relative flex flex-col overflow-hidden rounded-2xl",
        "border border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
        "text-foreground shadow-md shadow-black/5 w-full",
      ].join(" ")}
    >
      {/* Glass highlights (match ModernPageHeader) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-60" />
      <div className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.10),transparent_50%)]" />
      </div>

      <div className="relative z-10 w-full overflow-x-hidden overflow-y-visible">
        <table className="mb-0 align-middle w-full">
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle text-center bg-background/40 backdrop-blur-sm">
                Type
              </th>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle bg-background/40 backdrop-blur-sm">
                Vendor
              </th>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle bg-background/40 backdrop-blur-sm">
                Postcodes
              </th>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle text-center bg-background/40 backdrop-blur-sm">
                Target Del
              </th>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle text-center bg-background/40 backdrop-blur-sm">
                Target PU
              </th>
              <th className="text-[#8491a1] font-semibold uppercase text-[0.75rem] border-b border-border/40 whitespace-nowrap overflow-hidden text-ellipsis relative py-3 px-4 text-[0.85rem] align-middle text-center bg-background/40 backdrop-blur-sm">
                Target Total
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      </div>
    </div>
  );
};

RouteTableComponent.displayName = 'RouteTable';

const areEqual = (prevProps: RouteTableProps, nextProps: RouteTableProps) => {
  if (prevProps.routes.length !== nextProps.routes.length) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.loopId !== nextProps.loopId) return false;
  
  const prevIds = prevProps.routes.map(r => r.id).sort().join(',');
  const nextIds = nextProps.routes.map(r => r.id).sort().join(',');
  if (prevIds !== nextIds) return false;
  
  return true;
};

const RouteTable = memo(RouteTableComponent, areEqual);

export default RouteTable;

