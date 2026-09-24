import React from 'react';
import { Reveal } from '@/components/ui/reveal';
import RouteTable, { type Route } from './RouteTable';

interface UnassignedLoopsCardProps {
  loops: [string, Route[]][];
  isLoading: boolean;
  onOpenDepositModal: () => void;
  onNewClick: (loopId: string) => void;
}

const UnassignedLoopsCard: React.FC<UnassignedLoopsCardProps> = ({
  loops,
  isLoading,
  onOpenDepositModal,
  onNewClick,
}) => {
  if (loops.length === 0) return null;

  return (
    <Reveal className="reveal" threshold={0.1}>
      <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1)] border border-[#e9ecef] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-white via-yellow-50/30 to-gray-50 border-b border-[#e9ecef] px-6 py-4 d-flex justify-content-between align-items-center">
          <div>
            <h2 className="text-xl font-semibold text-[#2c3e50] mb-1">Loops without deposit</h2>
            <p className="text-muted mb-0 small">Associate the loop with the deposit name/ID for automatic grouping.</p>
          </div>
          <button
            onClick={onOpenDepositModal}
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            type="button"
          >
            <i className="bi bi-bank"></i>
            Add Deposit
          </button>
        </div>
        <div className="p-6 space-y-4">
          {loops.map(([loopId, routes]) => (
            <div key={loopId} className="border border-[#e9ecef] rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-white via-blue-50/30 to-gray-50 border-b border-[#e9ecef] px-4 py-3 d-flex justify-content-between align-items-center">
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-0">Loop: {loopId.toUpperCase()}</h3>
                <button
                  onClick={() => onNewClick(loopId)}
                  className="btn btn-primary d-flex align-items-center gap-2"
                >
                  <i className="bi bi-plus-lg"></i>
                  Add Route
                </button>
              </div>
              <div className="p-4">
                <Reveal className="reveal" threshold={0.1}>
                  <RouteTable
                    routes={routes}
                    loopId={loopId}
                    isLoading={isLoading}
                  />
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
};

export default UnassignedLoopsCard;






