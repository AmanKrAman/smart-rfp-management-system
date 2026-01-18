from datetime import datetime
from pydantic import BaseModel, EmailStr

class VendorCreate(BaseModel):
    vendor_name: str
    vendor_email: EmailStr
    vendor_rating: float = None

class VendorUpdate(BaseModel):
    vendor_name: str = None
    vendor_email: EmailStr = None
    vendor_rating: float = None

class VendorResponse(BaseModel):
    vendor_id: int
    vendor_name: str
    vendor_email: EmailStr
    vendor_rating: float = None
    vendor_created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }