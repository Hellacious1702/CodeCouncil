"""
CodeCouncil ML Engine — Tier 2: CodeBERT Neural Inference
Uses Microsoft's pre-trained CodeBERT model for semantic vulnerability detection.
Binary classification: Secure vs Insecure code.
Runs on CPU — no GPU required.
"""

import os
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


# Global model cache (loaded once on startup)
_model = None
_tokenizer = None
_model_name = "mrm8488/codebert-base-finetuned-detect-insecure-code"
_is_loading = False
_load_error = None


def _load_model():
    """Lazy-load model on first inference call."""
    global _model, _tokenizer, _is_loading, _load_error
    
    if _model is not None:
        return True
    
    if _load_error:
        return False
    
    _is_loading = True
    try:
        print(f"[ML Engine] Loading CodeBERT model: {_model_name}")
        print(f"[ML Engine] This will download ~500MB on first run...")
        
        _tokenizer = AutoTokenizer.from_pretrained(_model_name)
        _model = AutoModelForSequenceClassification.from_pretrained(
            _model_name,
            num_labels=2
        )
        _model.eval()  # Set to inference mode
        
        print(f"[ML Engine] CodeBERT loaded successfully. Ready for inference.")
        _is_loading = False
        return True
        
    except Exception as e:
        _load_error = str(e)
        _is_loading = False
        print(f"[ML Engine] FAILED to load CodeBERT: {e}")
        print(f"[ML Engine] Falling back to AST-only analysis.")
        return False


def predict_vulnerability(code: str, language: str = "python") -> dict:
    """
    Run CodeBERT inference on a code snippet.
    Returns vulnerability probability and classification.
    """
    if not _load_model():
        return {
            "available": False,
            "error": _load_error or "Model not loaded",
            "fallback": "AST-only analysis active"
        }
    
    try:
        # Tokenize
        inputs = _tokenizer(
            code,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding="max_length"
        )
        
        # Inference (no gradient computation needed)
        with torch.no_grad():
            outputs = _model(**inputs)
        
        # Process results
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)
        
        secure_prob = float(probs[0][0])
        insecure_prob = float(probs[0][1])
        
        # Classification
        is_vulnerable = insecure_prob > 0.5
        
        # Confidence tier
        if insecure_prob > 0.85:
            risk_level = "CRITICAL"
            risk_desc = "CodeBERT is highly confident this code contains security vulnerabilities."
        elif insecure_prob > 0.65:
            risk_level = "HIGH"
            risk_desc = "CodeBERT detects likely vulnerability patterns in this code."
        elif insecure_prob > 0.45:
            risk_level = "MEDIUM"
            risk_desc = "CodeBERT finds some concerning patterns. Manual review recommended."
        elif insecure_prob > 0.25:
            risk_level = "LOW"
            risk_desc = "CodeBERT finds minor concerns. Code appears mostly safe."
        else:
            risk_level = "SAFE"
            risk_desc = "CodeBERT classifies this code as secure with high confidence."
        
        return {
            "available": True,
            "is_vulnerable": is_vulnerable,
            "confidence": round(insecure_prob * 100, 2),
            "secure_probability": round(secure_prob * 100, 2),
            "risk_level": risk_level,
            "risk_description": risk_desc,
            "model": _model_name
        }
        
    except Exception as e:
        return {
            "available": True,
            "error": str(e),
            "is_vulnerable": None,
            "confidence": 0
        }


def get_model_status() -> dict:
    """Return current model status."""
    return {
        "model_name": _model_name,
        "loaded": _model is not None,
        "loading": _is_loading,
        "error": _load_error
    }
