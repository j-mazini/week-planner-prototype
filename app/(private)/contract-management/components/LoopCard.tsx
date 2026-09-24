import React from 'react';
import { Reveal } from '@/components/ui/reveal';
import RouteTable, { type Route } from './RouteTable';

interface LoopCardProps {
  depositName: string;
  depositId: number;
  loops: [string, Route[]][];
  isLoading: boolean;
  onOpenDepositModal: () => void;
  onNewClick: (loopId: string) => void;
}

const LoopCard: React.FC<LoopCardProps> = ({
  depositName,
  depositId,
  loops,
  isLoading,
  onOpenDepositModal,
  onNewClick,
}) => {
  return (
    <Reveal className="reveal" threshold={0.1}>
      <div className="bg-white rounded-xl shadow-[0_4px_6px_-1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(0_0_0/0.1)] border border-[#e9ecef] overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-gray-50 border-b border-[#e9ecef] px-6 py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-xl font-semibold text-[#2c3e50] mb-0">
                {depositName || `Deposit ${depositId}`}
              </h2>
            </div>
            <button
              onClick={onOpenDepositModal}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              type="button"
            >
              <i className="bi bi-bank"></i>
              Manage Deposits
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {loops.length === 0 ? (
            <div className="text-muted">No loops associated with this deposit.</div>
          ) : (
            loops.map(([loopId, routes]) => (
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
                  {(loopId === 'll3' || loopId === 'll4') && (
                    <Reveal className="reveal" threshold={0.1}>
                      <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg border border-[#e9ecef] shadow-sm">
                        <p className="text-sm mb-2">
                          <strong className="text-[#2c3e50]">Child Rates:</strong>{' '}
                          <span className="text-[#6c757d]">Band 1: (£3.67)</span>{' '}
                          <span className="text-[#6c757d]">Band 2: (£3.33)</span>{' '}
                          <span className="text-[#6c757d]">Band 3: (£3.10)</span>{' '}
                          <span className="text-[#6c757d]">Band 4: (£2.74)</span>
                        </p>
                        <p className="text-sm">
                          <strong className="text-[#2c3e50]">Flex Rates:</strong>{' '}
                          <span className="text-[#6c757d]">Band 1: 1-80 (£3.30)</span>{' '}
                          <span className="text-[#6c757d]">Band 2: 81-90 (£3.10)</span>{' '}
                          <span className="text-[#6c757d]">Band 3: 91-100 (£2.90)</span>{' '}
                          <span className="text-[#6c757d]">Band 4: 100+ (£2.60)</span>
                        </p>
                      </div>
                    </Reveal>
                  )}
                  <Reveal className="reveal" threshold={0.1}>
                    <RouteTable
                      routes={routes}
                      loopId={loopId}
                      isLoading={isLoading}
                    />
                  </Reveal>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Reveal>
  );
};

export default LoopCard;






