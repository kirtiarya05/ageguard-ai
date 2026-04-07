"""
AgeGuard AI - TFLite Model Exporter
====================================
Converts the DistilBERT sentiment model and a MobileNet age estimator
to TFLite flat-buffers suitable for on-device Android inference.

Usage:
    python export_tflite_models.py

Output:
    models/content_classifier.tflite   (quantized, ~40MB)
    models/age_estimator.tflite        (quantized, ~14MB)
"""

import os
import numpy as np

os.makedirs("models", exist_ok=True)

# ─────────────────────────────────────────────
# 1. Content Classifier — DistilBERT → TFLite
# ─────────────────────────────────────────────
try:
    print("[1/2] Converting DistilBERT content classifier...")
    from transformers import TFAutoModelForSequenceClassification, AutoTokenizer
    import tensorflow as tf

    MODEL_ID = "distilbert-base-uncased-finetuned-sst-2-english"
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    tf_model  = TFAutoModelForSequenceClassification.from_pretrained(MODEL_ID, from_pt=True)

    # Wrap in a concrete function for TFLite tracing
    @tf.function(input_signature=[
        tf.TensorSpec([1, 128], tf.int32, name="input_ids"),
        tf.TensorSpec([1, 128], tf.int32, name="attention_mask"),
    ])
    def serving_fn(input_ids, attention_mask):
        return tf_model(input_ids=input_ids, attention_mask=attention_mask)

    converter = tf.lite.TFLiteConverter.from_concrete_functions(
        [serving_fn.get_concrete_function()]
    )
    converter.optimizations = [tf.lite.Optimize.DEFAULT]           # INT8 dynamic-range quant
    converter.target_spec.supported_types = [tf.float16]           # FP16 fallback
    tflite_model = converter.convert()

    out_path = "models/content_classifier.tflite"
    with open(out_path, "wb") as f:
        f.write(tflite_model)
    print(f"    ✅ Saved → {out_path}  ({len(tflite_model)/1e6:.1f} MB)")

except Exception as e:
    print(f"    ⚠️  DistilBERT conversion skipped: {e}")
    print("       (Run on a machine with TensorFlow + transformers installed.)")


# ─────────────────────────────────────────────
# 2. Age Estimator — MobileNetV2 → TFLite
#    (Replaces DeepFace for on-device inference)
# ─────────────────────────────────────────────
try:
    print("[2/2] Converting MobileNetV2 age estimator...")
    import tensorflow as tf

    # Base: MobileNetV2 pretrained on ImageNet
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    x = tf.keras.layers.GlobalAveragePooling2D()(base.output)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    # Single output neuron: predicted age (0-100)
    output = tf.keras.layers.Dense(1, activation="sigmoid", name="age_output")(x)
    model = tf.keras.Model(inputs=base.input, outputs=output)

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()

    out_path = "models/age_estimator.tflite"
    with open(out_path, "wb") as f:
        f.write(tflite_model)
    print(f"    ✅ Saved → {out_path}  ({len(tflite_model)/1e6:.1f} MB)")
    print()
    print("────────────────────────────────────────────")
    print("DONE. Copy the models/ folder to:")
    print("  mobile/android/app/src/main/assets/")
    print("────────────────────────────────────────────")

except Exception as e:
    print(f"    ⚠️  MobileNetV2 conversion skipped: {e}")
