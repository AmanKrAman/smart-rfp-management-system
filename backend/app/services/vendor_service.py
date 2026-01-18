from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models import VendorInfo
from app.schemas import VendorCreate, VendorUpdate


class VendorService:

    @staticmethod
    def create_vendor(database_session: Session, vendor_details: VendorCreate) -> VendorInfo:
        try:
            new_vendor = VendorInfo(
                vendor_name=vendor_details.vendor_name,
                vendor_email=vendor_details.vendor_email,
                vendor_rating=vendor_details.vendor_rating
            )
            database_session.add(new_vendor)
            database_session.commit()
            database_session.refresh(new_vendor)
            return new_vendor
        except IntegrityError:
            database_session.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Vendor with email {vendor_details.vendor_email} already exists"
            )

    @staticmethod
    def get_all_vendors(database_session: Session) -> List[VendorInfo]:
        return database_session.query(VendorInfo).order_by(VendorInfo.vendor_created_at.desc()).all()

    @staticmethod
    def get_vendor_by_id(database_session: Session, vendor_id: int) -> VendorInfo:
        vendor_info = database_session.query(VendorInfo).filter(VendorInfo.vendor_id == vendor_id).first()
        if not vendor_info:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return vendor_info

    @staticmethod
    def get_vendor_by_email(database_session: Session, email: str) -> VendorInfo:
        vendor_info = database_session.query(VendorInfo).filter(VendorInfo.vendor_email == email).first()
        if not vendor_info:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return vendor_info

    @staticmethod
    def update_vendor(database_session: Session, vendor_id: int, vendor_updates: VendorUpdate) -> VendorInfo:
        existing_vendor = VendorService.get_vendor_by_id(database_session, vendor_id)

        if vendor_updates.vendor_name is not None:
            existing_vendor.vendor_name = vendor_updates.vendor_name
        if vendor_updates.vendor_email is not None:
            existing_vendor.vendor_email = vendor_updates.vendor_email
        if vendor_updates.vendor_rating is not None:
            existing_vendor.vendor_rating = vendor_updates.vendor_rating

        try:
            database_session.commit()
            database_session.refresh(existing_vendor)
            return existing_vendor
        except IntegrityError:
            database_session.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Vendor with email {vendor_updates.vendor_email} already exists"
            )

    @staticmethod
    def delete_vendor(database_session: Session, vendor_id: int):
        try:
            vendor = database_session.query(VendorInfo).filter(VendorInfo.vendor_id == vendor_id).first()
            if not vendor:
                raise HTTPException(status_code=404, detail="Vendor not found")
            
            database_session.delete(vendor)
            database_session.commit()
            
        except IntegrityError:
            database_session.rollback()
            raise HTTPException(
                status_code=400, 
                detail="Can't delete this vendor as it has associated RFP responses."
            )
