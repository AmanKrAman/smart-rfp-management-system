import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Mail, Users } from 'lucide-react';
import { toast } from 'sonner';
import { vendorService } from '../services/vendorService';
import type { Vendor, VendorCreate } from '../types';
import Loading from '../components/Loading';
import VendorModal from '../components/VendorModal';

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAllVendors();
      setVendors(data);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: VendorCreate) => {
    try {
      await vendorService.createVendor(data);
      toast.success('Vendor created successfully');
      loadVendors();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create vendor');
    }
  };

  const handleUpdate = async (id: number, data: VendorCreate) => {
    try {
      await vendorService.updateVendor(id, data);
      toast.success('Vendor updated successfully');
      loadVendors();
      setIsModalOpen(false);
      setEditingVendor(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update vendor');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      await vendorService.deleteVendor(id);
      toast.success('Vendor deleted successfully');
      loadVendors();
    } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Failed to delete vendor';
        toast.error(errorMessage);
    }
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  if (loading) {
    return <Loading text="Loading vendors..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-2">Manage your vendor database</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Vendor
        </button>
      </div>

      {vendors.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first vendor</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Add Your First Vendor
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={16} />
                      {vendor.vendor_email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-gray-900">
                        {vendor.vendor_rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(vendor.vendor_created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="text-primary-600 hover:text-primary-700 mr-3"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.vendor_id, vendor.vendor_name)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <VendorModal
          vendor={editingVendor}
          onClose={closeModal}
          onSubmit={editingVendor ? (data) => handleUpdate(editingVendor.vendor_id, data) : handleCreate}
        />
      )}
    </div>
  );
}
