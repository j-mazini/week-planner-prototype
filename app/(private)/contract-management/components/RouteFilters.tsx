import React, { memo, useCallback } from 'react';
import NewButton from '@/components/new-button';

interface Filter {
  search: string;
  loop: string;
  routeType: string;
  deposit: string;
}

interface RouteFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  onNewClick: (loopId: string) => void;
  availableLoops: string[];
  availableDeposits: { id: number; name: string }[];
}

const RouteFilters = memo(({ filter, onFilterChange, onNewClick, availableLoops, availableDeposits }: RouteFiltersProps) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  }, [filter, onFilterChange]);

  const handleLoopChange = useCallback((loop: string) => {
    onFilterChange({ ...filter, loop });
  }, [filter, onFilterChange]);

  const handleRouteTypeChange = useCallback((routeType: string) => {
    onFilterChange({ ...filter, routeType });
  }, [filter, onFilterChange]);

  const handleDepositChange = useCallback((deposit: string) => {
    onFilterChange({ ...filter, deposit });
  }, [filter, onFilterChange]);

  const handleNewClickButton = useCallback(() => {
    const loopToUse = filter.loop !== 'all' ? filter.loop : availableLoops[0] || 'll3';
    onNewClick(loopToUse);
  }, [filter.loop, availableLoops, onNewClick]);
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#e9ecef] mb-6 transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] [&_*]:relative [&_*]:z-[1]">
      <div className="flex flex-nowrap items-center gap-4 max-lg:flex-wrap">
        <div className="flex-1 min-w-[300px] max-w-[600px] max-lg:flex-[1_1_100%] max-lg:max-w-full max-lg:min-w-full">
          <div className="relative">
            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#8491a1] text-base pointer-events-none"></i>
            <input 
              type="search" 
              className="form-control w-full border border-[#e9ecef] rounded-lg pl-11 pr-4 py-2.5 text-[0.9rem] transition-[border-color,box-shadow] duration-200 bg-white text-[#2c3e50] focus:outline-none focus:border-[#0d6efd] focus:shadow-[0_0_0_3px_rgba(13,110,253,0.1)] placeholder:text-[#8491a1] hover:border-[#0d6efd]/50" 
              placeholder="Search by deposit, route, vendor, or postcode..."
              value={filter.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 max-lg:flex-[1_1_auto]">
          <strong className="text-nowrap text-[#2c3e50] text-sm font-semibold">Deposit:</strong>
          <select
            className="form-select min-w-[160px] border border-[#e9ecef] rounded-lg px-3 py-2 text-[0.9rem] transition-all duration-200 bg-white text-[#2c3e50] focus:outline-none focus:border-[#0d6efd] focus:shadow-[0_0_0_3px_rgba(13,110,253,0.1)] hover:border-[#0d6efd]/50"
            value={filter.deposit}
            onChange={(e) => handleDepositChange(e.target.value)}
          >
            <option value="all">All</option>
            {availableDeposits.map((dep) => (
              <option key={dep.id} value={String(dep.id)}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 max-lg:flex-[1_1_auto]">
          <strong className="text-nowrap text-[#2c3e50] text-sm font-semibold">Loop:</strong>
          <div className="inline-flex rounded-lg overflow-hidden border border-[#e9ecef] shadow-sm">
            {['all', ...availableLoops].map((loop) => (
              <button 
                key={loop}
                className={`px-3.5 py-2 text-[0.8rem] font-semibold transition-all duration-200 ${
                  filter.loop === loop 
                    ? 'bg-[#b2f746] text-[#003b3e] shadow-sm'
                    : 'bg-white text-[#2c3e50] border-r border-[#e9ecef] last:border-r-0 hover:bg-[#f7f8fa] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                }`}
                onClick={() => handleLoopChange(loop)}
              >
                {loop === 'all' ? 'All' : loop.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 max-lg:flex-[0_0_auto]">
          <strong className="text-nowrap text-[#2c3e50] text-sm font-semibold">Type:</strong>
          <div className="inline-flex rounded-lg overflow-hidden border border-[#e9ecef] shadow-sm">
            {['all', 'Child', 'Flex'].map((type) => (
              <button 
                key={type}
                className={`px-3.5 py-2 text-[0.8rem] font-semibold transition-all duration-200 ${
                  filter.routeType === type 
                    ? 'bg-[#b2f746] text-[#003b3e] shadow-sm'
                    : 'bg-white text-[#2c3e50] border-r border-[#e9ecef] last:border-r-0 hover:bg-[#f7f8fa] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                }`}
                onClick={() => handleRouteTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 max-lg:flex-[0_0_auto]">
          <NewButton
            onClick={handleNewClickButton}
            label="New Route"
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
});

RouteFilters.displayName = 'RouteFilters';

export default RouteFilters;
