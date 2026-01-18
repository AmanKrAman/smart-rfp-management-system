from typing import Dict, Any, List
from groq import Groq

from app.config import settings
from app.models.models import RfpInfo, VendorRfpResponse


class AIService:
    
    def __init__(self):
        self.groq_client = Groq(api_key=settings.groq_api_key)
    
    def parse_rfp_text(self, raw_text: str) -> Dict[str, Any]:
        
        prompt = f"""
        Parse the following RFP text into structured JSON with these exact fields:
        - title: string (project title)
        - requirements: array of strings (key requirements)
        - budget_range: object with min and max (numbers, null if not specified)
        - timeline: string (project timeline description)
        - delivery_location: string (where work should be done)
        - evaluation_criteria: array of strings (how vendors will be evaluated)
        
        Output only valid JSON, no other text.
        
        RFP Text:
        {raw_text}
        """
        
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0  
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    
    def parse_vendor_response(self, email_text: str) -> Dict[str, Any]:
        
        prompt = f"""
        Parse the following vendor email response into structured JSON with these exact fields:
        - total_price: number (quoted price, null if not found)
        - delivery_days: number (delivery timeline in days, null if not found)
        - warranty_years: number (warranty period in years, null if not found)
        - payment_terms: string (payment terms description)
        - additional_notes: string (any other relevant information)
        
        Output only valid JSON, no other text.
        
        Email Text:
        {email_text}
        """
        
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    
    def evaluate_vendor_responses(self, rfp: RfpInfo, responses: List[VendorRfpResponse]) -> Dict[str, Any]:
    
        rfp_data = {
            "title": rfp.rfp_title,
            "requirements": rfp.rfp_structured_json.get("requirements", []),
            "budget_range": rfp.rfp_structured_json.get("budget_range"),
            "timeline": rfp.rfp_structured_json.get("timeline"),
            "evaluation_criteria": rfp.rfp_structured_json.get("evaluation_criteria", [])
        }
        
        vendors_data = []
        for resp in responses:
            vendors_data.append({
                "vendor_id": resp.fk_vendor_id,
                "total_price": resp.total_price,
                "delivery_days": resp.delivery_days,
                "warranty_years": resp.warranty_years,
                "payment_terms": resp.payment_terms,
                "email_parsed": resp.email_parsed_json
            })
        
        prompt = f"""
        Evaluate the following vendor responses for the RFP and recommend the best vendor.
        
        RFP Details:
        {rfp_data}
        
        Vendor Responses:
        {vendors_data}
        
        For each vendor, calculate an AI score (0-100) based on:
        - Price competitiveness (within budget)
        - Delivery timeline (meets requirements)
        - Warranty coverage
        - Payment terms favorability
        - Overall fit to requirements
        
        Output JSON with:
        - recommendations: object with vendor_id as key, score as value
        - best_vendor_id: number (vendor with highest score)
        - reasoning: string (explanation of recommendation)
        
        Output only valid JSON, no other text.
        """
        
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        for resp in responses:
            if str(resp.fk_vendor_id) in result["recommendations"]:
                resp.ai_score = result["recommendations"][str(resp.fk_vendor_id)]
                resp.ai_recommended = (resp.fk_vendor_id == result["best_vendor_id"])
        
        return result


ai_service = AIService()