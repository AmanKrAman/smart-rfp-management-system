# Smart RFP Management System - Frontend

Professional React frontend for managing RFPs with AI-powered parsing and evaluation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🛠️ Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Zustand for state management
- React Hook Form for forms
- Sonner for notifications

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── services/       # API integration
├── store/          # State management
└── types/          # TypeScript definitions
```

## 🎯 Features

- ✅ Dashboard with statistics
- ✅ Vendor management (CRUD)
- ✅ AI-powered RFP creation
- ✅ Send RFPs to vendors via email
- ✅ Real-time response polling (30s)
- ✅ AI evaluation and recommendations
- ✅ Responsive design
- ✅ Type-safe with TypeScript

## 🔗 Backend

Connects to FastAPI backend at `http://localhost:4200`

Ensure backend is running before starting frontend.

## 📝 Usage

1. Add vendors
2. Create RFP (AI parses requirements)
3. Send to selected vendors
4. Monitor responses (auto-refresh)
5. Get AI evaluation

## 🎨 UI/UX Highlights

- Professional design
- Mobile-responsive
- Loading states
- Error handling
- Toast notifications
- Form validation
