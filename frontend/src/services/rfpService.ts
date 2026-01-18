import api from './api';
import type { ApiResponse, RFP, RFPCreate, RFPSendRequest, VendorResponse, Evaluation } from '../types';

export const rfpService = {
  // Get all RFPs
  getAllRFPs: async (): Promise<RFP[]> => {
    const response = await api.get<ApiResponse<RFP[]>>('/rfp_management/rfps');
    return response.data.data;
  },

  // Get RFP by ID
  getRFPById: async (id: number): Promise<RFP> => {
    const response = await api.get<ApiResponse<RFP>>(`/rfp_management/rfps/${id}`);
    return response.data.data;
  },

  // Create RFP
  createRFP: async (rfp: RFPCreate): Promise<RFP> => {
    const response = await api.post<ApiResponse<RFP>>('/rfp_management/rfps', rfp);
    return response.data.data;
  },

  // Delete RFP
  deleteRFP: async (id: number): Promise<void> => {
    await api.delete(`/rfp_management/rfps/${id}`);
  },

  // Send RFP to vendors
  sendRFP: async (id: number, vendorIds: number[]): Promise<void> => {
    const payload: RFPSendRequest = { vendor_ids: vendorIds };
    await api.post(`/rfp_management/rfps/${id}/send`, payload);
  },

  // Get RFP responses
  getRFPResponses: async (id: number): Promise<VendorResponse[]> => {
    const response = await api.get<ApiResponse<VendorResponse[]>>(`/rfp_management/rfps/${id}/responses`);
    return response.data.data;
  },

  // Evaluate RFP
  evaluateRFP: async (id: number): Promise<Evaluation> => {
    const response = await api.post<ApiResponse<Evaluation>>(`/rfp_management/rfps/${id}/evaluate`);
    return response.data.data;
  },
};
