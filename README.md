# 🏥 MedAudit — AI Medical Bill Analyzer

Upload a medical bill (PDF or image) → Claude extracts procedures, explains them in plain English, and flags suspicious charges.

---

## Project Structure

```
medaudit/
├── backend/          # FastAPI + Claude API
│   ├── main.py
│   └── requirements.txt
└── frontend/         # Next.js + Tailwind
    ├── app/
    ├── components/
    └── package.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (replace with your actual key)
ANTHROPIC_API_KEY=sk-ant-... uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend shell env | Your Anthropic API key |

Get your API key at: https://console.anthropic.com

---

## What it does

1. **Upload** — PDF or image medical bill
2. **Extract** — Claude identifies procedures, CPT codes, charges, diagnoses, medications
3. **Explain** — Plain-language explanations for every line item
4. **Flag** — Detects duplicate charges, unusually high costs, math errors

---

## Supported File Types

- PDF (`.pdf`)
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

---

## Demo Tips (Hackathon)

Prepare 3 sample bills:
1. **Normal bill** — clean, no issues
2. **Duplicate charge** — same CPT code appears twice
3. **High cost** — one charge well above typical range

The AI will clearly surface issues #2 and #3.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Python, FastAPI |
| AI | Anthropic Claude (claude-sonnet-4) |
| Document parsing | Claude's native PDF/image understanding |

---

## API Endpoints

### `POST /analyze`
Upload a file and get full analysis.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "medical_data": {
    "patient_name": "...",
    "provider": "...",
    "procedures": [...],
    "diagnoses": [...],
    "total_amount": 1250.00
  },
  "explanations": {
    "overall_summary": "...",
    "procedure_explanations": {...},
    "billing_tip": "..."
  },
  "flags": [
    {
      "type": "high_cost",
      "severity": "warning",
      "message": "..."
    }
  ]
}
```

### `GET /health`
Health check.
