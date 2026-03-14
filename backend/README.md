# MedAudit Backend

FastAPI backend for medical bill analysis.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
ANTHROPIC_API_KEY=your_key_here uvicorn main:app --reload --port 8000
```

## Endpoints

- `POST /analyze` — Upload a PDF or image, get full analysis
- `GET /health` — Health check
