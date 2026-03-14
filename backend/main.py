from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import anthropic
import base64
import json
import re
import os

app = FastAPI(title="MedAudit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))


def encode_file_to_base64(file_bytes: bytes) -> str:
    return base64.standard_b64encode(file_bytes).decode("utf-8")


def extract_json_from_text(text: str) -> dict:
    """Extract JSON from Claude's response, handling markdown code blocks."""
    # Try to find JSON in code blocks first
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        json_str = json_match.group(1)
    else:
        # Try to find raw JSON
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            json_str = json_match.group(0)
        else:
            raise ValueError(f"No JSON found in response: {text[:200]}")

    return json.loads(json_str)


def extract_medical_data(file_bytes: bytes, media_type: str, filename: str) -> dict:
    """Use Claude to extract structured medical data from the document."""

    if media_type == "application/pdf":
        file_data = encode_file_to_base64(file_bytes)
        content = [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": file_data,
                },
            },
            {
                "type": "text",
                "text": """You are a medical billing expert. Extract all medical billing information from this document.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "patient_name": "string or null",
  "provider": "string or null",
  "date_of_service": "string or null",
  "total_amount": number or null,
  "procedures": [
    {
      "name": "string",
      "code": "string or null",
      "charge": number or null,
      "quantity": number or 1,
      "category": "string"
    }
  ],
  "diagnoses": ["string"],
  "medications": ["string"],
  "insurance_adjustments": number or null,
  "amount_due": number or null
}

If a field is not found, use null. Extract ALL line items as separate procedures."""
            }
        ]
    elif media_type in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        file_data = encode_file_to_base64(file_bytes)
        content = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": file_data,
                },
            },
            {
                "type": "text",
                "text": """You are a medical billing expert. Extract all medical billing information from this document image.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "patient_name": "string or null",
  "provider": "string or null",
  "date_of_service": "string or null",
  "total_amount": number or null,
  "procedures": [
    {
      "name": "string",
      "code": "string or null",
      "charge": number or null,
      "quantity": number or 1,
      "category": "string"
    }
  ],
  "diagnoses": ["string"],
  "medications": ["string"],
  "insurance_adjustments": number or null,
  "amount_due": number or null
}

If a field is not found, use null. Extract ALL line items as separate procedures."""
            }
        ]
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {media_type}")

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": content}]
    )

    response_text = response.content[0].text.strip()
    return extract_json_from_text(response_text)


def generate_explanations(medical_data: dict) -> dict:
    """Generate plain-language explanations for extracted medical data."""
    procedures_text = json.dumps(medical_data.get("procedures", []), indent=2)
    diagnoses = medical_data.get("diagnoses", [])
    medications = medical_data.get("medications", [])

    prompt = f"""You are a friendly medical billing advisor helping a patient understand their bill.

Medical data:
Procedures: {procedures_text}
Diagnoses: {diagnoses}
Medications: {medications}

Return ONLY a valid JSON object (no markdown, no explanation) with this structure:
{{
  "overall_summary": "2-3 sentence plain English summary of what this bill is for",
  "procedure_explanations": {{
    "procedure_name_here": "plain English explanation of what this procedure is and why it might be done"
  }},
  "diagnosis_explanations": {{
    "diagnosis_name_here": "plain English explanation"
  }},
  "billing_tip": "one helpful tip for the patient about this bill or how to handle it"
}}

Use the actual procedure and diagnosis names as keys. Be warm, clear, and avoid medical jargon."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = response.content[0].text.strip()
    return extract_json_from_text(response_text)


def detect_anomalies(medical_data: dict) -> list:
    """Detect anomalies in the medical bill."""
    flags = []
    procedures = medical_data.get("procedures", [])

    # Check for duplicate procedure codes
    codes = [p.get("code") for p in procedures if p.get("code")]
    seen_codes = set()
    for p in procedures:
        code = p.get("code")
        if code and code in seen_codes:
            flags.append({
                "type": "duplicate",
                "severity": "warning",
                "message": f"Duplicate procedure code detected: {code} ({p.get('name', 'Unknown')})",
                "procedure": p.get("name")
            })
        if code:
            seen_codes.add(code)

    # Check for duplicate procedure names
    names = [p.get("name", "").lower() for p in procedures]
    seen_names = set()
    for p in procedures:
        name = p.get("name", "").lower()
        if name and name in seen_names:
            flags.append({
                "type": "duplicate",
                "severity": "warning",
                "message": f"Duplicate procedure name detected: {p.get('name')}",
                "procedure": p.get("name")
            })
        if name:
            seen_names.add(name)

    # High cost thresholds by category (rough estimates)
    high_cost_thresholds = {
        "radiology": 1500,
        "laboratory": 500,
        "surgery": 10000,
        "office visit": 500,
        "emergency": 3000,
        "default": 2000
    }

    for p in procedures:
        charge = p.get("charge")
        if charge and charge > 0:
            category = p.get("category", "default").lower()
            threshold = high_cost_thresholds.get(category, high_cost_thresholds["default"])
            if charge > threshold:
                flags.append({
                    "type": "high_cost",
                    "severity": "info",
                    "message": f"High charge detected: ${charge:,.2f} for {p.get('name', 'Unknown')} (above typical range for {category})",
                    "procedure": p.get("name")
                })

    # Check if total doesn't add up
    procedures_total = sum(
        (p.get("charge") or 0) * (p.get("quantity") or 1)
        for p in procedures
    )
    bill_total = medical_data.get("total_amount")
    if bill_total and procedures_total > 0:
        discrepancy = abs(procedures_total - bill_total)
        if discrepancy > 10:
            flags.append({
                "type": "math_error",
                "severity": "warning",
                "message": f"Total amount mismatch: line items sum to ${procedures_total:,.2f} but bill shows ${bill_total:,.2f} (difference: ${discrepancy:,.2f})",
                "procedure": None
            })

    return flags


@app.post("/analyze")
async def analyze_bill(file: UploadFile = File(...)):
    """Main endpoint: upload a medical bill and get full analysis."""
    allowed_types = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ]

    content_type = file.content_type
    if content_type not in allowed_types:
        # Try to infer from filename
        name = file.filename or ""
        if name.endswith(".pdf"):
            content_type = "application/pdf"
        elif name.endswith((".jpg", ".jpeg")):
            content_type = "image/jpeg"
        elif name.endswith(".png"):
            content_type = "image/png"
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Please upload a PDF or image file."
            )

    file_bytes = await file.read()

    if len(file_bytes) > 20 * 1024 * 1024:  # 20MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 20MB.")

    # Step 1: Extract medical data
    medical_data = extract_medical_data(file_bytes, content_type, file.filename or "")

    # Step 2: Generate explanations
    explanations = generate_explanations(medical_data)

    # Step 3: Detect anomalies
    flags = detect_anomalies(medical_data)

    return {
        "medical_data": medical_data,
        "explanations": explanations,
        "flags": flags,
        "filename": file.filename
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
