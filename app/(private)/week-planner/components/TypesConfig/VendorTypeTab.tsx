"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';
import {
  fetchVendorTypes,
  createVendorType,
  updateVendorType,
  deleteVendorType,
  type VendorType,
  type VendorTypeCreateDTO,
  type VendorTypeUpdateDTO,
} from '@/lib/types-config-api';

const VendorTypeTab: React.FC = () => {
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<VendorType | null>(null);
  const [formData, setFormData] = useState({ nameType: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { guard } = useSubmitGuard();

  useEffect(() => {
    loadVendorTypes();
  }, []);

  const loadVendorTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVendorTypes();
      setVendorTypes(data || []);
    } catch (err) {
      console.error('Error loading vendor types:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vendor types');
      setVendorTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingType(null);
    setFormData({ nameType: '' });
    setShowModal(true);
  };

  const handleEdit = (type: VendorType) => {
    setEditingType(type);
    setFormData({ nameType: type.nameType });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vendor type?')) {
      return;
    }

    try {
      await deleteVendorType(id);
      await loadVendorTypes();
    } catch (err) {
      console.error('Error deleting vendor type:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete vendor type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingType) {
        const updateData: VendorTypeUpdateDTO = {
          nameType: formData.nameType,
        };
        await updateVendorType(editingType.vendorTypeId, updateData);
      } else {
        const createData: VendorTypeCreateDTO = {
          nameType: formData.nameType,
        };
        await createVendorType(createData);
      }
      setShowModal(false);
      setEditingType(null);
      setFormData({ nameType: '' });
      await loadVendorTypes();
    } catch (err) {
      console.error('Error saving vendor type:', err);
      alert(err instanceof Error ? err.message : 'Failed to save vendor type');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && vendorTypes.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-slate-600">Loading vendor types...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Vendor Types</h3>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Vendor Type
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
              <th className="px-5 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type Name</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60 bg-white">
            {vendorTypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center text-slate-500 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span>No vendor types found</span>
                  </div>
                </td>
              </tr>
            ) : (
              vendorTypes.map((type) => (
                <tr 
                  key={type.vendorTypeId} 
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-200 ease-in-out border-b border-slate-50/80"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{type.vendorTypeId}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-slate-900 group-hover:text-slate-950 transition-colors">{type.nameType}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="p-2 rounded-lg text-blue-600 hover:text-white hover:bg-blue-600 transition-all duration-200 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(type.vendorTypeId)}
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
                {editingType ? 'Edit Vendor Type' : 'Create Vendor Type'}
              </h3>
            </div>
            <form onSubmit={guard(handleSubmit)} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type Name *
                </label>
                <input
                  type="text"
                  value={formData.nameType}
                  onChange={(e) => setFormData({ nameType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingType(null);
                    setFormData({ nameType: '' });
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <Button type="submit" pending={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingType ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorTypeTab;



