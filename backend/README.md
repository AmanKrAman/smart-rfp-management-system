# Smart RFP Backend - Setup Instructions

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment configuration
│   ├── database.py             # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py           # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── vendor.py           # Pydantic schemas for vendors
│   │   └── rfp.py              # Pydantic schemas for RFPs
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── vendors.py          # Vendor endpoints
│   │   └── webhooks.py         # SendGrid webhook
│   ├── services/
│   │   ├── __init__.py
│   │   ├── vendor_service.py   # Vendor business logic
│   │   ├── ai_service.py       # OpenAI integration (TODO)
│   │   └── email_service.py    # SendGrid integration (TODO)
│   └── utils/
│       ├── __init__.py
│       └── responses.py        # Response helpers
├── requirements.txt
├── .env.example
└── .gitignore
```

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Database
Create a PostgreSQL database:
```bash
createdb smart_rfp
```

### 4. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:
- DATABASE_URL
- SENDGRID_API_KEY
- OPENAI_API_KEY

### 5. Run Database Migrations
The app will auto-create tables on startup. For production, use Alembic:
```bash
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 6. Run the Server
```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Or using Python directly
python -m app.main
```

### 7. Access API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Vendor APIs (Implemented)
- `POST /vendor_management/vendors` - Create a new vendor
- `GET /vendor_management/vendors` - Get all vendors
- `GET /vendor_management/vendors/{id}` - Get vendor by ID
- `PUT /vendor_management/vendors/{id}` - Update vendor
- `DELETE /vendor_management/vendors/{id}` - Delete vendor

### RFP APIs (TODO - Next Steps)
- `POST /rfp_management/rfps` - Create RFP from natural language
- `GET /rfp_management/rfps/{id}` - Get RFP details
- `POST /rfp_management/rfps/{id}/send` - Send RFP to vendors
- `POST /rfp_management/rfps/{id}/evaluate` - AI evaluation
- `GET /rfp_management/rfps/{id}/responses` - Get vendor responses

### Webhooks (TODO)
- `POST /vendor_management/webhooks/sendgrid/inbound` - Handle vendor email responses

## Testing Vendor APIs

### Create a Vendor
```bash
curl -X POST http://localhost:8000/vendor_management/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_name": "Acme Corp",
    "vendor_email": "contact@acme.com",
    "vendor_rating": 4.5
  }'
```

### Get All Vendors
```bash
curl http://localhost:8000/vendor_management/vendors
```

## Next Steps

1. **RFP Service Implementation**
   - Create `app/services/rfp_service.py`
   - Create `app/routers/rfps.py`
   - Implement RFP CRUD operations

2. **AI Service Implementation** (app/services/ai_service.py)
   - Implement `parse_rfp_from_natural_language()` using OpenAI JSON mode
   - Implement `parse_vendor_response()` for email parsing
   - Implement `evaluate_vendors()` for AI comparison

3. **Email Service Implementation** (app/services/email_service.py)
   - Implement `send_rfp_to_vendor()` using SendGrid API
   - Implement `parse_inbound_email()` for webhook handling

4. **Webhook Handler** (app/routers/webhooks.py)
   - Complete SendGrid inbound parse webhook
   - Link to vendor_service and ai_service

## Database Models

### vendor_info
- vendor_id (PK)
- vendor_name
- vendor_email (unique)
- vendor_rating
- created_at

### rfp_info
- rfp_id (PK)
- rfp_title
- rfp_raw_text
- rfp_structured_json (JSON)
- status (DRAFT | SENT | EVALUATED)
- created_at

### vendor_rfp_response
- id (PK)
- rfp_id (FK)
- vendor_id (FK)
- email_raw_text
- email_parsed_json (JSON)
- total_price
- delivery_days
- warranty_years
- payment_terms
- ai_score
- ai_recommended (boolean)
- created_at
- UNIQUE(rfp_id, vendor_id)
