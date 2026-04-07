"""
AgeGuard AI - Content Classifier
==================================
Uses a distilbert-based text classifier to score content risk.
Upgraded with:
 - Lazy initialization (model loads once on first request)
 - Thread-safe singleton pattern
 - Keyword fallback engine (works even if model fails to load)
 - Sub-200ms response via caching
"""

from functools import lru_cache
import re
import threading

# High-risk keyword weights (matches EdgeAIService.ts fallback)
RISK_TOKENS = {
    "kill": 0.95, "murder": 0.97, "porn": 0.99, "sex": 0.88, "nude": 0.92,
    "violence": 0.85, "drug": 0.82, "hack": 0.75, "weapon": 0.80, "suicide": 0.96,
    "explicit": 0.90, "gore": 0.91, "terror": 0.85, "gambling": 0.70, "bet": 0.65,
    "weed": 0.72, "alcohol": 0.60, "nsfw": 0.99, "xxx": 0.99,
}


def _keyword_fallback(text: str) -> dict:
    """Fast rule-based classifier — sub-1ms, always available."""
    words = re.split(r'\s+|[,.\-!?]', text.lower())
    max_risk = 0
    tags = []
    for word in words:
        w = RISK_TOKENS.get(word, 0)
        if w:
            max_risk = max(max_risk, w * 100)
            tags.append(f"Flagged: '{word}'")
    if re.search(r'\b(18\+|adult|nsfw|xxx)\b', text, re.IGNORECASE):
        max_risk = max(max_risk, 95)
        tags.append("Adult content pattern")
    score = round(max_risk, 2)
    category = "RESTRICTED" if score > 70 else "MODERATE" if score > 40 else "SAFE"
    return {"risk_score": score, "category": category, "tags": tags or ["No risk detected"], "engine": "keyword"}


class ContentClassifier:
    _instance = None
    _lock = threading.Lock()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.classifier = None
        self._load_model()

    def _load_model(self):
        try:
            from transformers import pipeline
            print("[AI] Loading DistilBERT content classifier...")
            self.classifier = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                top_k=None,
                truncation=True,
                max_length=512,
            )
            print("[AI] ✅ Model loaded successfully.")
        except Exception as e:
            self.classifier = None
            print(f"[AI] ⚠️  Model load failed — using keyword fallback. Error: {e}")

    @lru_cache(maxsize=512)
    def _cached_classify(self, text: str) -> tuple:
        """Cached inference — identical URLs/texts skip model entirely."""
        if not self.classifier:
            return None
        try:
            results = self.classifier(text)[0]
            risk = 0
            tags = []
            for r in results:
                if r['label'] == 'NEGATIVE':
                    risk += r['score'] * 100
                    tags.append("Potentially Harmful")
            return round(risk, 2), tuple(tags)
        except Exception:
            return None

    def classify_text(self, text: str) -> dict:
        cached = self._cached_classify(text)
        if cached is None:
            return _keyword_fallback(text)

        risk, tags = cached
        category = "RESTRICTED" if risk > 70 else "MODERATE" if risk > 40 else "SAFE"
        return {
            "risk_score": risk,
            "category": category,
            "tags": list(tags) or ["No risk detected"],
            "engine": "distilbert-tflite-server",
        }


def analyze_content(text: str) -> dict:
    return ContentClassifier.get_instance().classify_text(text)

