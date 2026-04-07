from deepface import DeepFace
import base64
import os
import cv2
import numpy as np

def estimate_age(image_base64: str):
    try:
        # Decode base64
        img_data = base64.b64decode(image_base64)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Analyze
        results = DeepFace.analyze(img, actions=['age'], enforce_detection=False)
        age = results[0]['age']
        # Use DeepFace's face confidence if available
        confidence = results[0].get('face_confidence', 0.90)

        # Determine Category
        group = "CHILD"
        if 11 <= age <= 14:
            group = "EARLY_TEEN"
        elif 15 <= age <= 17:
            group = "TEEN"
        elif age >= 18:
            group = "ADULT"

        return {"age": age, "group": group, "confidence": round(float(confidence), 2)}
    except Exception as e:
        return {"error": str(e)}
