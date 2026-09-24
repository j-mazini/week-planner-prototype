import { memo } from 'react';

interface TableHeaderProps {
  headers: Array<{
    label: string;
    title?: string;
  }>;
}

export const TableHeader = memo(function TableHeader({ headers }: TableHeaderProps) {
  return (
    <thead>
      <tr>
        {headers.map((header, index) => (
          <th
            key={index}
            className="text-slate-500 font-semibold uppercase text-xs border-b border-gray-200 whitespace-nowrap overflow-hidden text-ellipsis py-2.5 px-2 text-center bg-gray-50/80"
            title={header.title}
          >
            {header.label}
          </th>
        ))}
      </tr>
    </thead>
  );
});

