from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List, Optional

from app.models.models import RfpInfo, VendorInfo, VendorRfpResponse
from app.schemas.rfp import RfpCreate, RfpUpdate, RfpResponse, RfpEvaluateResponse
from app.services.ai_service import ai_service
from app.services.email_service import email_service

class RfpService:
    @staticmethod
    def create_rfp(db: Session, rfp_data: RfpCreate) -> RfpInfo:
        structured_json = ai_service.parse_rfp_text(rfp_data.rfp_raw_text)
        
        new_rfp = RfpInfo(
            rfp_title=rfp_data.rfp_title,
            rfp_raw_text=rfp_data.rfp_raw_text,
            rfp_structured_json=structured_json,
            rfp_status="DRAFT"
        )
        db.add(new_rfp)
        db.commit()
        db.refresh(new_rfp)
        return new_rfp

    @staticmethod
    def get_all_rfps(db: Session) -> List[RfpInfo]:
        return db.query(RfpInfo).order_by(RfpInfo.rfp_created_at.desc()).all()

    @staticmethod
    def get_rfp_by_id(db: Session, rfp_id: int) -> RfpInfo:
        rfp = db.query(RfpInfo).filter(RfpInfo.rfp_id == rfp_id).first()
        if not rfp:
            raise HTTPException(status_code=404, detail="RFP not found")
        return rfp

    @staticmethod
    def update_rfp(db: Session, rfp_id: int, updates: RfpUpdate) -> RfpInfo:
        rfp = RfpService.get_rfp_by_id(db, rfp_id)
        for key, value in updates.model_dump(exclude_unset=True).items():
            setattr(rfp, key, value)
        db.commit()
        db.refresh(rfp)
        return rfp

    @staticmethod
    def delete_rfp(db: Session, rfp_id: int):
        rfp = RfpService.get_rfp_by_id(db, rfp_id)
        db.delete(rfp)
        db.commit()

    @staticmethod
    def send_rfp_to_vendors(db: Session, rfp_id: int, vendor_ids: List[int]):
        rfp = RfpService.get_rfp_by_id(db, rfp_id)
        vendors = db.query(VendorInfo).filter(VendorInfo.vendor_id.in_(vendor_ids)).all()
        
        if len(vendors) != len(vendor_ids):
            raise HTTPException(status_code=400, detail="Some vendor IDs not found")
        
        email_service.send_rfp_emails(rfp, vendors)
        
        rfp.rfp_status = "SENT"
        db.commit()

    @staticmethod
    def evaluate_rfp_responses(db: Session, rfp_id: int) -> RfpEvaluateResponse:
        rfp = RfpService.get_rfp_by_id(db, rfp_id)
        responses = db.query(VendorRfpResponse).filter(VendorRfpResponse.fk_rfp_id == rfp_id).all()
        
        if not responses:
            raise HTTPException(status_code=400, detail="No vendor responses found")
        
        evaluation = ai_service.evaluate_vendor_responses(rfp, responses)
        
        rfp.rfp_status = "EVALUATED"
        db.commit()
        
        return evaluation

    @staticmethod
    def get_rfp_responses(database_session: Session, rfp_id: int):
        responses = database_session.query(VendorRfpResponse).options(
            joinedload(VendorRfpResponse.vendor)
        ).filter(VendorRfpResponse.fk_rfp_id == rfp_id).all()
        
        responses_data = []
        for response in responses:
            response_dict = {
                "id": response.id,
                "fk_rfp_id": response.fk_rfp_id,
                "fk_vendor_id": response.fk_vendor_id,
                "vendor_name": response.vendor.vendor_name if response.vendor else "Unknown Vendor",
                "email_raw_text": response.email_raw_text,
                "email_parsed_json": response.email_parsed_json,
                "total_price": response.total_price,
                "delivery_days": response.delivery_days,
                "warranty_years": response.warranty_years,
                "payment_terms": response.payment_terms,
                "ai_score": response.ai_score,
                "ai_recommended": response.ai_recommended,
                "response_created_at": response.response_created_at.isoformat() if response.response_created_at else None  # Convert datetime to string
            }
            responses_data.append(response_dict)
        
        return responses_data
