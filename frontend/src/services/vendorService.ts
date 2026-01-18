import api from './api';
import type { ApiResponse, Vendor, VendorCreate, VendorUpdate } from '../types';

export const vendorService = {
  // Get all vendors
  getAllVendors: async (): Promise<Vendor[]> => {
    const response = await api.get<ApiResponse<Vendor[]>>('/vendor_management/vendors');
    return response.data.data;
  },

  // Get vendor by ID
  getVendorById: async (id: number): Promise<Vendor> => {
    const response = await api.get<ApiResponse<Vendor>>(`/vendor_management/vendors/${id}`);
    return response.data.data;
  },

  // Create vendor
  createVendor: async (vendor: VendorCreate): Promise<Vendor> => {
    const response = await api.post<ApiResponse<Vendor>>('/vendor_management/vendors', vendor);
    return response.data.data;
  },

  // Update vendor
  updateVendor: async (id: number, vendor: VendorUpdate): Promise<Vendor> => {
    const response = await api.put<ApiResponse<Vendor>>(`/vendor_management/vendors/${id}`, vendor);
    return response.data.data;
  },

  // Delete vendor
  deleteVendor: async (id: number): Promise<void> => {
    await api.delete(`/vendor_management/vendors/${id}`);
  },
};
