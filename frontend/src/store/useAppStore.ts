import { create } from 'zustand';
import type { Vendor, RFP } from '../types';

interface AppState {
  vendors: Vendor[];
  rfps: RFP[];
  isLoading: boolean;
  error: string | null;
  
  setVendors: (vendors: Vendor[]) => void;
  setRFPs: (rfps: RFP[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  vendors: [],
  rfps: [],
  isLoading: false,
  error: null,
  
  setVendors: (vendors) => set({ vendors }),
  setRFPs: (rfps) => set({ rfps }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
