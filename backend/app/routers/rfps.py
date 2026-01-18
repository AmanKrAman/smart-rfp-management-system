from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.schemas.rfp import RfpCreate, RfpUpdate, RfpResponse, RfpSendRequest, RfpEvaluateResponse, VendorRfpResponseSchema
from app.services.rfp_service import RfpService
from app.utils.responses import success_response, error_response

router = APIRouter(prefix="/rfp_management/rfps", tags=["rfp_management"])

class RfpController:
    @staticmethod
    @router.post("", status_code=201)
    def create_new_rfp(
        rfp_details: RfpCreate,
        database_session: Session = Depends(get_database_session)
    ):
        new_rfp = RfpService.create_rfp(database_session, rfp_details)
        rfp_data = RfpResponse.from_orm(new_rfp).model_dump(mode='json')
        return success_response(
            data=rfp_data,
            message="RFP created successfully",
            status_code=201
        )

    @staticmethod
    @router.get("")
    def get_all_system_rfps(
        database_session: Session = Depends(get_database_session)
    ):
        all_rfps = RfpService.get_all_rfps(database_session)
        rfps_data = [RfpResponse.from_orm(rfp).model_dump(mode='json') for rfp in all_rfps]
        return success_response(
            data=rfps_data,
            message="RFPs retrieved successfully"
        )

    @staticmethod
    @router.get("/{rfp_id}")
    def get_specific_rfp(
        rfp_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        rfp_info = RfpService.get_rfp_by_id(database_session, rfp_id)
        rfp_data = RfpResponse.from_orm(rfp_info).model_dump(mode='json')
        return success_response(
            data=rfp_data,
            message="RFP retrieved successfully"
        )

    @staticmethod
    @router.delete("/{rfp_id}", status_code=204)
    def remove_rfp_from_system(
        rfp_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        RfpService.delete_rfp(database_session, rfp_id)
        return None

    @staticmethod
    @router.post("/{rfp_id}/send")
    def send_rfp_to_vendors(
        rfp_id: int,
        send_request: RfpSendRequest,
        database_session: Session = Depends(get_database_session)
    ):
        RfpService.send_rfp_to_vendors(database_session, rfp_id, send_request.vendor_ids)
        return success_response(
            data=None,
            message="RFP sent to vendors successfully"
        )

    @staticmethod
    @router.post("/{rfp_id}/evaluate")
    def evaluate_rfp_responses(
        rfp_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        evaluation = RfpService.evaluate_rfp_responses(database_session, rfp_id)
        return success_response(
            data=evaluation,
            message="RFP evaluation completed"
        )

    @staticmethod
    @router.get("/{rfp_id}/responses")
    def get_rfp_responses(
        rfp_id: int,
        database_session: Session = Depends(get_database_session)
    ):
        responses = RfpService.get_rfp_responses(database_session, rfp_id)
        return success_response(
            data=responses,
            message="RFP responses retrieved successfully"
        )