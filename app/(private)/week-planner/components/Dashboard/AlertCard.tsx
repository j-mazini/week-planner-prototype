"use client";

import React from 'react';
import { AlertCircle, Users, CheckCircle } from 'lucide-react';

type AlertCardProps = {
  type: 'warning' | 'info' | 'success';
  message: React.ReactNode;
};

const AlertCard: React.FC<AlertCardProps> = ({ type, message }) => {
  const icons = {
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Users className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
  };

  const typeClasses = {
    warning: 'bg-amber-100 border-amber-400 text-amber-900',
    info: 'bg-blue-100 border-blue-400 text-blue-900',
    success: 'bg-green-100 border-green-400 text-green-800',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[0.9rem] ${typeClasses[type]}`}>
      {icons[type]}
      <div>{message}</div>
    </div>
  );
};

export default AlertCard;

