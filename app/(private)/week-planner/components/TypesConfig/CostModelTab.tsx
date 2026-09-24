"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import {
  fetchCostModels,
  createCostModel,
  updateCostModel,
  deleteCostModel,
  type CostModel,
  type CostModelCreateDTO,
  type CostModelUpdateDTO,
} from '@/lib/types-config-api';

const CostModelTab: React.FC = () => {
  const [costModels, setCostModels] = useState<CostModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<CostModel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isAdhocCategory: false,
    customerId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    loadCostModels();
  }, []);

  const loadCostModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCostModels();
      setCostModels(data || []);
    } catch (err) {
      console.error('Error loading cost models:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cost models');
      setCostModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingModel(null);
    setFormData({
      name: '',
      description: '',
      isAdhocCategory: false,
      customerId: '',
    });
    setShowModal(true);
  };

  const handleEdit = (model: CostModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name || '',
      description: model.description || '',
      isAdhocCategory: model.isAdhocCategory || false,
      customerId: model.customerId?.toString() || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cost model?')) {
      return;
    }

    try {
      await deleteCostModel(id);
      await loadCostModels();
    } catch (err) {
      console.error('Error deleting cost model:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete cost model');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingModel) {
        const updateData: CostModelUpdateDTO = {
          description: formData.description || undefined,
        };
        await updateCostModel(editingModel.costModelId, updateData);
      } else {
        const createData: CostModelCreateDTO = {
          name: formData.name,
          description: formData.description || undefined,
          isAdhocCategory: formData.isAdhocCategory,
          customerId: formData.customerId ? Number(formData.customerId) : undefined,
        };
        await createCostModel(createData);
      }
      setShowModal(false);
      setEditingModel(null);
      setFormData({
        name: '',
        description: '',
        isAdhocCategory: false,
        customerId: '',
      });
      await loadCostModels();
    } catch (err) {
      console.error('Error saving cost model:', err);
      alert(err instanceof Error ? err.message : 'Failed to save cost model');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && costModels.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-600">Loading cost models...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Cost Models</h3>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Cost Model
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200/60 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden backdrop-blur-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 via-slate-50 to-slate-100/80 border-b border-slate-200/60">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">ID</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Adhoc Category</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Customer ID</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 bg-white">
            {costModels.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-500 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span>No cost models found</span>
                  </div>
                </td>
              </tr>
            ) : (
              costModels.map((model) => (
                <tr
                  key={model.costModelId}
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 ease-in-out border-b border-slate-50/80"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{model.costModelId}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 group-hover:text-slate-950 transition-colors">{model.name}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{model.description || <span className="text-slate-400">-</span>}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${model.isAdhocCategory
                      ? 'bg-green-100 text-green-800'
                      : 'bg-slate-100 text-slate-700'
                      }`}>
                      {model.isAdhocCategory ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{model.customerId || <span className="text-slate-400">-</span>}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(model)}
                        className="p-2 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(model.costModelId)}
                        className="p-2 rounded-lg text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingModel ? 'Edit Cost Model' : 'Create Cost Model'}
              </h3>
            </div>
            <form onSubmit={guard(handleSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAdhocCategory}
                    onChange={(e) => setFormData({ ...formData, isAdhocCategory: e.target.checked })}
                    className="rounded border-slate-300"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm font-medium text-slate-700">Is Adhoc Category</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Customer ID
                </label>
                <input
                  type="number"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingModel(null);
                    setFormData({
                      name: '',
                      description: '',
                      isAdhocCategory: false,
                      customerId: '',
                    });
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <Button type="submit" pending={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingModel ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostModelTab;


