import React from 'react';

interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({ 
  message = 'Nenhum registo encontrado para os filtros selecionados.' 
}) => {
  return (
    <tr>
      <td colSpan={15} className="text-center py-16 bg-white">
        <div className="flex flex-col items-center gap-3">
          <svg 
            className="w-14 h-14 text-slate-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span className="text-sm text-slate-600 font-medium">{message}</span>
          <span className="text-xs text-slate-500">Ajuste os filtros ou o período para ver registos.</span>
        </div>
      </td>
    </tr>
  );
});

EmptyState.displayName = 'EmptyState';

