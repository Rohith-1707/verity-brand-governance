"""Visual analysis using OpenCV for marketing and brand media assets.
Checks resolution, blurriness (Laplacian variance), contrast, and aspect ratio.
"""
from __future__ import annotations
import io
import cv2
import numpy as np


def analyze_image_bytes(data: bytes, filename: str = "image.png") -> dict:
    """Analyze image content for visual quality, brand readiness, and clarity."""
    try:
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"valid": False, "error": "Unable to decode image file format."}
        
        height, width, channels = img.shape
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur check using Laplacian variance (higher = sharper, < 80 = blurry)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < 80.0
        
        # Brightness and contrast check
        mean_brightness = float(np.mean(gray))
        contrast = float(np.std(gray))
        
        aspect_ratio = round(width / max(1, height), 2)
        megapixels = round((width * height) / 1_000_000, 2)
        
        warnings = []
        if is_blurry:
            warnings.append(f"Image appears blurry (sharpness score: {laplacian_var:.1f}/100, minimum threshold: 80).")
        if width < 600 or height < 400:
            warnings.append(f"Low resolution ({width}x{height}px). Recommended minimum for brand assets is 800x600px.")
        if contrast < 25.0:
            warnings.append("Low contrast detected. Text or brand elements may be hard to distinguish.")
        if mean_brightness < 20 or mean_brightness > 240:
            warnings.append("Extreme brightness detected (image is either severely underexposed or overexposed).")
            
        return {
            "valid": True,
            "filename": filename,
            "width": width,
            "height": height,
            "megapixels": megapixels,
            "aspect_ratio": aspect_ratio,
            "sharpness": round(laplacian_var, 1),
            "is_blurry": is_blurry,
            "brightness": round(mean_brightness, 1),
            "contrast": round(contrast, 1),
            "warnings": warnings,
            "status": "warning" if warnings else "pass"
        }
    except Exception as e:
        return {"valid": False, "error": f"Image processing failed: {e}"}
