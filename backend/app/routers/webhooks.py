"""Webhook API routes"""
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.models.models import VendorInfo, RfpInfo, VendorRfpResponse
from app.services.email_service import email_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/vendor_management/webhooks", tags=["webhook_management"])


class WebhookController:
    @staticmethod
    @router.post("/sendgrid/inbound")
    async def process_incoming_vendor_email(
        incoming_request: Request,
        db: Session = Depends(get_database_session)
    ):
        try:
            try:
                email_data = await incoming_request.json()
            except:
                form_data = await incoming_request.form()
                email_data = {
                    "from": form_data.get("from"),
                    "to": form_data.get("to"),
                    "subject": form_data.get("subject"),
                    "text": form_data.get("text"),
                    "html": form_data.get("html")
                }
            
            parsed_email = email_service.parse_inbound_email(email_data)
            
            vendor = db.query(VendorInfo).filter(
                VendorInfo.vendor_email == parsed_email["from_email"]
            ).first()
            
            if not vendor:
                return {"status": "error", "message": "Vendor email not recognized"}
            
            subject = parsed_email["subject"]
            if "Re: RFP: " in subject:
                rfp_title = subject.replace("Re: RFP: ", "").strip()
            elif "RFP: " in subject:
                rfp_title = subject.replace("RFP: ", "").strip()
            else:
                rfp_title = subject.strip()
            
            rfp = db.query(RfpInfo).filter(RfpInfo.rfp_title == rfp_title).first()
            
            if not rfp:
                return {"status": "error", "message": "RFP not found"}
            
            email_body = parsed_email["body"]
            
            parsed_response = ai_service.parse_vendor_response(email_body)
            
            existing_response = db.query(VendorRfpResponse).filter(
                VendorRfpResponse.fk_rfp_id == rfp.rfp_id,
                VendorRfpResponse.fk_vendor_id == vendor.vendor_id
            ).first()
            
            if existing_response:
                existing_response.email_raw_text = email_body
                existing_response.email_parsed_json = parsed_response
                existing_response.total_price = parsed_response.get("total_price")
                existing_response.delivery_days = parsed_response.get("delivery_days")
                existing_response.warranty_years = parsed_response.get("warranty_years")
                existing_response.payment_terms = parsed_response.get("payment_terms")
                existing_response.response_created_at = datetime.utcnow()
                vendor_response = existing_response
                action = "updated"
            else:
                vendor_response = VendorRfpResponse(
                    fk_rfp_id=rfp.rfp_id,
                    fk_vendor_id=vendor.vendor_id,
                    email_raw_text=email_body,
                    email_parsed_json=parsed_response,
                    total_price=parsed_response.get("total_price"),
                    delivery_days=parsed_response.get("delivery_days"),
                    warranty_years=parsed_response.get("warranty_years"),
                    payment_terms=parsed_response.get("payment_terms")
                )
                db.add(vendor_response)
                action = "saved"
            
            db.commit()
            db.refresh(vendor_response)
            
            return {
                "status": "success",
                "message": "Vendor response processed and saved",
                "data": {
                    "response_id": vendor_response.id,
                    "rfp_id": rfp.rfp_id,
                    "vendor_id": vendor.vendor_id
                }
            }

        except Exception as error:
            print(f"Webhook error: {str(error)}")
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": str(error)}
