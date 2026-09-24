import React from 'react';

interface AndonStatusProps {
  isSpms: boolean;
  className?: string;
}

export const AndonStatus: React.FC<AndonStatusProps> = ({ isSpms, className = "" }) => {
  const statusConfig = isSpms 
    ? {
        color: "bg-green-500",
        text: "Verified",
        textColor: "text-white"
      }
    : {
        color: "bg-yellow-500", 
        text: "Wait Verification",
        textColor: "text-white"
      };

  return (
    <div className={`${statusConfig.color} ${statusConfig.textColor} px-3 py-1 rounded-full text-xs font-medium ${className}`}>
      {statusConfig.text}
    </div>
  );
};

