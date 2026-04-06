from fastapi import FastAPI
from pydantic import BaseModel
from age_detector import estimate_age
from content_classifier import analyze_content

app = FastAPI(title="AgeShield AI - AI Microservices")

class ImagePayload(BaseModel):
    image_base64: str

class TextPayload(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"status": "AI Services Running"}

@app.post("/predict_age")
def predict_age(payload: ImagePayload):
    result = estimate_age(payload.image_base64)
    return result

@app.post("/classify_content")
def classify_content(payload: TextPayload):
    result = analyze_content(payload.text)
    return result
