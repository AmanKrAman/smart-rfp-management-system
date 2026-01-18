from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, JSON, Float, 
    Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import BaseModel

class VendorInfo(BaseModel):
    __tablename__ = "vendor_info"
    
    vendor_id = Column(Integer, primary_key=True, index=True)
    vendor_name = Column(String(255), nullable=False)
    vendor_email = Column(String(255), unique=True, nullable=False, index=True)
    vendor_rating = Column(Float, nullable=True)
    vendor_created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    responses = relationship("VendorRfpResponse", back_populates="vendor")


class RfpInfo(BaseModel):
    __tablename__ = "rfp_info"
    
    rfp_id = Column(Integer, primary_key=True, index=True)
    rfp_title = Column(String(500), nullable=False)
    rfp_raw_text = Column(Text, nullable=False)
    rfp_structured_json = Column(JSON, nullable=True)
    rfp_status = Column(String(50), default="DRAFT", nullable=False)
    rfp_created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    responses = relationship("VendorRfpResponse", back_populates="rfp")


class VendorRfpResponse(BaseModel):
    __tablename__ = "vendor_rfp_response"
    
    id = Column(Integer, primary_key=True, index=True)
    fk_rfp_id = Column(Integer, ForeignKey("rfp_info.rfp_id"), nullable=False)
    fk_vendor_id = Column(Integer, ForeignKey("vendor_info.vendor_id"), nullable=False)
    email_raw_text = Column(Text, nullable=False)
    email_parsed_json = Column(JSON, nullable=True)
    total_price = Column(Float, nullable=True)
    delivery_days = Column(Integer, nullable=True)
    warranty_years = Column(Float, nullable=True)
    payment_terms = Column(String(255), nullable=True)
    ai_score = Column(Float, nullable=True)
    ai_recommended = Column(Boolean, default=False, nullable=False)
    response_created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    rfp = relationship("RfpInfo", back_populates="responses")
    vendor = relationship("VendorInfo", back_populates="responses")
    
    __table_args__ = (
        UniqueConstraint('fk_rfp_id', 'fk_vendor_id', name='unique_rfp_vendor'),
    )