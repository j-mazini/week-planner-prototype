"use client";

import React, { useState, useEffect } from 'react';
import type { FlexRoute } from '../../types/planner';
import type { FlexRouteTemplate } from '../../utils/flexRouteUtils';

export interface FlexRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: FlexRouteTemplate) => void;
  templates: FlexRouteTemplate[] | FlexRoute[];
  loopKey: string;
  availableTemplates?: FlexRouteTemplate[];
}

const FlexRouteModal: React.FC<FlexRouteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  templates,
  loopKey,
  availableTemplates,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | number>('');
  const [error, setError] = useState<string>('');

  // Normalize templates
  const normalizedTemplates: FlexRouteTemplate[] = React.useMemo(() => {
    return templates.map(template => {
      if ('loopType' in template) {
        // It's a FlexRoute, convert to template
        return {
          id: template.id,
          name: template.name,
          loop: template.loopType.toLowerCase(),
          depot: template.depot,
        };
      }
      return template as FlexRouteTemplate;
    });
  }, [templates]);

  // Use available templates if provided, otherwise filter by loop
  const displayTemplates = React.useMemo(() => {
    if (availableTemplates) {
      return availableTemplates;
    }
    return normalizedTemplates.filter(t => t.loop === loopKey);
  }, [availableTemplates, normalizedTemplates, loopKey]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateId(displayTemplates.length > 0 ? displayTemplates[0].id : '');
      setError('');
    } else {
      setSelectedTemplateId('');
      setError('');
    }
  }, [isOpen, displayTemplates]);

  const handleConfirm = () => {
    if (!selectedTemplateId) {
      setError('Select a flex route to add.');
      return;
    }

    const template = displayTemplates.find(t => t.id === selectedTemplateId);
    if (!template) {
      setError('Flex route template not found.');
      return;
    }

    onConfirm(template);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Flex Route</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Select a flex route template to add into the chosen loop.
          </p>

          <div className="mb-4">
            <label htmlFor="flex-route-select" className="block text-sm font-medium text-gray-700 mb-2">
              Flex Route
            </label>
            <select
              id="flex-route-select"
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value);
                setError('');
              }}
              disabled={displayTemplates.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {displayTemplates.length === 0 ? (
                <option value="">No flex routes available</option>
              ) : (
                displayTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {displayTemplates.length === 0 && !error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-600">
                All flex routes for this loop are already active.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={displayTemplates.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Flex Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlexRouteModal;

