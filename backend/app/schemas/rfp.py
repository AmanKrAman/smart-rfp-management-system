from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

class RfpCreate(BaseModel):
    rfp_title: str
    rfp_raw_text: str

class RfpUpdate(BaseModel):
    rfp_title: Optional[str] = None
    rfp_raw_text: Optional[str] = None
    rfp_status: Optional[str] = None

class RfpResponse(BaseModel):
    rfp_id: int
    rfp_title: str
    rfp_raw_text: str
    rfp_structured_json: Optional[dict] = None
    rfp_status: str
    rfp_created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class RfpSendRequest(BaseModel):
    vendor_ids: List[int]

class RfpEvaluateResponse(BaseModel):
    recommendations: dict
    best_vendor_id: Optional[int] = None
    reasoning: str

class VendorRfpResponseSchema(BaseModel):
    id: int
    fk_rfp_id: int
    fk_vendor_id: int
    email_raw_text: str
    email_parsed_json: Optional[dict] = None
    total_price: Optional[float] = None
    delivery_days: Optional[int] = None
    warranty_years: Optional[float] = None
    payment_terms: Optional[str] = None
    ai_score: Optional[float] = None
    ai_recommended: bool
    response_created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }