"use client";

import React from "react";

export const ValidationError = React.memo(function ValidationError({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-lg">
      <h4 className="font-bold mb-2">Validation Errors Found:</h4>
      <ul className="list-disc list-inside">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
});


