from typing import List, Dict, Any
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, CustomArg

from app.config import settings
from app.models.models import RfpInfo, VendorInfo


class EmailService:
    def __init__(self):
        self.client = SendGridAPIClient(api_key=settings.sendgrid_api_key)
        self.from_email = settings.sendgrid_from_email
    
    def send_rfp_emails(self, rfp: RfpInfo, vendors: List[VendorInfo]):
        from_email = Email(self.from_email)
        subject = f"RFP: {rfp.rfp_title}"
        
        structured_data = rfp.rfp_structured_json or {}
        requirements = structured_data.get('requirements', [])
        budget = structured_data.get('budget_range', {})
        timeline = structured_data.get('timeline', 'Not specified')
        delivery_location = structured_data.get('delivery_location', 'Not specified')
        
        email_body = f"""
Dear Vendor,

Please review the following Request for Proposal (RFP) and submit your proposal.

═══════════════════════════════════════════════════════
RFP DETAILS
═══════════════════════════════════════════════════════

Title: {rfp.rfp_title}

Description:
{rfp.rfp_raw_text}

--- Structured Requirements ---

Requirements:
{''.join([f'• {req}\n' for req in requirements])}

Budget Range: ${budget.get('min', 'N/A')} - ${budget.get('max', 'N/A')}
Timeline: {timeline}
Delivery Location: {delivery_location}

═══════════════════════════════════════════════════════
HOW TO RESPOND
═══════════════════════════════════════════════════════

Please reply to this email with your proposal including:
• Total price
• Delivery timeline (in days)
• Warranty information (in years)
• Payment terms
• Any additional notes

Best regards,
RFP Management Team
        """
        
        content = Content("text/plain", email_body)
        
        for vendor in vendors:
            try:
                to_email = To(vendor.vendor_email)
                mail = Mail(from_email, to_email, subject, content)
                
                # Add custom args for tracking
                mail.add_custom_arg(CustomArg('rfp_id', str(rfp.rfp_id)))
                mail.add_custom_arg(CustomArg('vendor_id', str(vendor.vendor_id)))
                
                response = self.client.send(mail)
                print(f"✓ Email sent to {vendor.vendor_email}: Status {response.status_code}")
                
            except Exception as e:
                print(f"✗ Failed to send email to {vendor.vendor_email}: {str(e)}")
    
    def parse_inbound_email(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "from_email": email_data.get("from"),
            "to_email": email_data.get("to"),
            "subject": email_data.get("subject"),
            "body": email_data.get("text") or email_data.get("html"),
            "attachments": email_data.get("attachments", [])
        }


email_service = EmailService()