// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Vendor Types
export interface Vendor {
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_rating: number | null;
  vendor_created_at: string;
}

export interface VendorCreate {
  vendor_name: string;
  vendor_email: string;
  vendor_rating?: number;
}

export interface VendorUpdate {
  vendor_name?: string;
  vendor_email?: string;
  vendor_rating?: number;
}

// RFP Types
export interface RFP {
  rfp_id: number;
  rfp_title: string;
  rfp_raw_text: string;
  rfp_structured_json: RFPStructuredData | null;
  rfp_status: 'DRAFT' | 'SENT' | 'EVALUATED';
  rfp_created_at: string;
}

export interface RFPStructuredData {
  title?: string;
  requirements: string[];
  budget_range: {
    min: number;
    max: number;
  };
  timeline: string;
  delivery_location: string | null;
  evaluation_criteria: string | null;
}

export interface RFPCreate {
  rfp_title: string;
  rfp_raw_text: string;
}

export interface RFPSendRequest {
  vendor_ids: number[];
}

// Vendor Response Types
export interface VendorResponse {
  id: number;
  fk_rfp_id: number;
  fk_vendor_id: number;
  vendor_name: string;
  email_raw_text: string;
  email_parsed_json: {
    total_price: number;
    delivery_days: number;
    warranty_years: number;
    payment_terms: string;
    additional_notes: string;
  } | null;
  total_price: number | null;
  delivery_days: number | null;
  warranty_years: number | null;
  payment_terms: string | null;
  ai_score: number | null;
  ai_recommended: boolean;
  response_created_at: string;
}

// Evaluation Types
export interface Evaluation {
  recommendations: Record<string, number>;
  best_vendor_id: number | null;
  reasoning: string;
}
