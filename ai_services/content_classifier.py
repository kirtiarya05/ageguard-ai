from transformers import pipeline

class ContentClassifier:
    def __init__(self):
        # We use a small distilbert model for text classification (sentiment/toxicity proxy for this demo)
        # In a real scenario, this would use a toxicity-specific model like 'unitary/toxic-bert'
        try:
            self.classifier = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english", top_k=None)
        except Exception as e:
            self.classifier = None
            print(f"Model load error: {e}")

    def classify_text(self, text: str):
        if not self.classifier:
            return {"score": 50, "category": "MODERATE", "tags": ["No model"]}

        results = self.classifier(text)[0]
        # Example mapping from sentiment to risk score
        # NEGATIVE sentiment -> higher risk score for demo
        risk = 0
        tags = []
        for r in results:
            if r['label'] == 'NEGATIVE':
                risk += r['score'] * 100
                tags.append("Potentially Harmful/Negative")

        category = "SAFE"
        if risk > 70:
            category = "RESTRICTED"
        elif risk > 40:
            category = "MODERATE"

        return {
            "risk_score": round(risk, 2),
            "category": category,
            "tags": tags
        }

classifier_instance = ContentClassifier()

def analyze_content(text: str):
    return classifier_instance.classify_text(text)
