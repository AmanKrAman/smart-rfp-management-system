from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.schemas import VendorCreate, VendorUpdate, VendorResponse
from app.services import VendorService
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/vendor_management/vendors", tags=["vendor_management"])

class VendorController:
    @staticmethod
    @router.post("", status_code=201)
    def create_new_vendor(
        vendor_details: VendorCreate,
        database_session: Session = Depends(get_database_session)
    ):
        new_vendor = VendorService.create_vendor(database_session, vendor_details)
        vendor_data = VendorResponse.from_orm(new_vendor).model_dump(mode='json')
        return success_response(
            data=vendor_data,
            message="Vendor created successfully",
            status_code=201
        )

    @staticmethod
    @router.get("")
    def get_all_system_vendors(
        database_session: Session = Depends(get_database_session)
    ):
        all_vendors = VendorService.get_all_vendors(database_session)
        vendors_data = [VendorResponse.from_orm(vendor).model_dump(mode='json') for vendor in all_vendors]
        return success_response(
            data=vendors_data,
            message="Vendors retrieved successfully"
        )

    @staticmethod
    @router.get("/{vendor_id}")
    def get_specific_vendor(
        vendor_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        vendor_info = VendorService.get_vendor_by_id(database_session, vendor_id)
        vendor_data = VendorResponse.from_orm(vendor_info).model_dump(mode='json')
        return success_response(
            data=vendor_data,
            message="Vendor retrieved successfully"
        )

    @staticmethod
    @router.put("/{vendor_id}")
    def update_existing_vendor(
        vendor_id: int,
        vendor_updates: VendorUpdate,
        database_session: Session = Depends(get_database_session)
    ):
        updated_vendor = VendorService.update_vendor(
            database_session, vendor_id, vendor_updates
        )
        vendor_data = VendorResponse.from_orm(updated_vendor).model_dump(mode='json')
        return success_response(
            data=vendor_data,
            message="Vendor updated successfully"
        )

    @staticmethod
    @router.delete("/{vendor_id}", status_code=204)
    def remove_vendor_from_system(
        vendor_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        VendorService.delete_vendor(database_session, vendor_id)
        return success_response(
            data=None,
            message="Vendor deleted successfully"
        )  