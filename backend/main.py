from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v2, MobileNet_V2_Weights  # Using MobileNet instead of ResNet
import json
import os
import gc  # For garbage collection
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Load environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://dog-breed-classifier-*.vercel.app")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://dog-breed-classifier-*.vercel.app,https://*.vercel.app").split(",")

app = FastAPI(title="Doggy Detective API")

# Enable CORS with more permissive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Global variables for model
model = None
class_idx = None

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize(224),  # MobileNet input size
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.on_event("startup")
async def load_model():
    global model, class_idx
    try:
        logger.info("Loading MobileNetV2 model...")
        model = mobilenet_v2(weights=MobileNet_V2_Weights.IMAGENET1K_V1)
        model.eval()
        
        # Enable model optimization
        if torch.cuda.is_available():
            model = model.cuda()
        else:
            model = torch.quantization.quantize_dynamic(
                model, {torch.nn.Linear, torch.nn.Conv2d}, dtype=torch.qint8
            )
        
        logger.info("Loading ImageNet class labels...")
        with open("imagenet_classes.json") as f:
            class_idx = json.load(f)
        
        # Clear any unused memory
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint that also returns model status"""
    mem_used = None
    model_loaded = model is not None
    class_idx_loaded = class_idx is not None
    
    if torch.cuda.is_available():
        mem_used = torch.cuda.memory_allocated() / 1024**2
    
    return {
        "status": "running",
        "model_loaded": model_loaded,
        "class_idx_loaded": class_idx_loaded,
        "memory_usage_mb": mem_used
    }

def get_predictions(image: Image.Image) -> list:
    try:
        if model is None:
            logger.error("Model not loaded")
            raise RuntimeError("Model not initialized")
            
        if class_idx is None:
            logger.error("Class index not loaded")
            raise RuntimeError("Class labels not initialized")
            
        logger.info("Starting image preprocessing...")
        # Log image details
        logger.info(f"Input image size: {image.size}, mode: {image.mode}")
        
        # Preprocess the image
        img_tensor = transform(image).unsqueeze(0)
        logger.info(f"Preprocessed tensor shape: {img_tensor.shape}")
        
        if torch.cuda.is_available():
            img_tensor = img_tensor.cuda()
            logger.info("Moved tensor to GPU")
            
        logger.info("Image preprocessing complete")
        
        # Get model predictions
        logger.info("Running model inference...")
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            logger.info(f"Raw output shape: {outputs.shape}, probability shape: {probabilities.shape}")
        logger.info("Model inference complete")
        
        # Get all dog breed predictions
        breed_probs = []
        logger.info("Processing breed probabilities...")
        
        # Log top 10 overall predictions for debugging
        top_probs, top_indices = torch.topk(probabilities, 10)
        logger.info("Top 10 overall predictions:")
        for i, (prob, idx) in enumerate(zip(top_probs, top_indices)):
            class_name = class_idx.get(str(idx.item()), "unknown")
            logger.info(f"  {i+1}. Class {idx.item()} ({class_name}): {prob.item()*100:.2f}%")
        
        # Process dog breed predictions
        for i in range(151, 269):  # ImageNet dog breeds range
            prob = float(probabilities[i].item() * 100)
            if prob > 1.0:  # Only consider confident predictions
                breed_name = class_idx[str(i)].split(',')[0].title()
                breed_probs.append({"breed": breed_name, "confidence": prob})
                logger.info(f"Found dog breed: {breed_name} with confidence: {prob:.2f}%")
                
        logger.info(f"Found {len(breed_probs)} breeds above threshold")
        
        # Sort by confidence and take top 5
        breed_probs.sort(key=lambda x: x["confidence"], reverse=True)
        breed_probs = breed_probs[:5]
        
        # Normalize to 100%
        if breed_probs:
            total = sum(b["confidence"] for b in breed_probs)
            for breed in breed_probs:
                breed["confidence"] = (breed["confidence"] / total) * 100
                logger.info(f"Normalized {breed['breed']}: {breed['confidence']:.2f}%")
        else:
            logger.warning("No breeds met the confidence threshold")
        
        logger.info(f"Final predictions: {breed_probs}")
        return breed_probs
    except Exception as e:
        logger.error(f"Error in predictions: {str(e)}")
        logger.exception("Full prediction error traceback:")
        raise

@app.post("/api/classify")
async def classify_image(file: UploadFile = File(...)):
    logger.info(f"Received image: {file.filename}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type: {file.content_type}")
        return JSONResponse(
            status_code=400,
            content={"detail": "File must be an image"}
        )
    
    try:
        # Read and process the image
        contents = await file.read()
        logger.info(f"Read file contents, size: {len(contents)} bytes")
        
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        logger.info(f"Converted image to RGB, size: {image.size}")
        
        # Get predictions
        logger.info("Starting prediction...")
        results = get_predictions(image)
        logger.info(f"Raw prediction results: {results}")
        
        if not results:
            logger.warning("No dog breeds detected in the image")
            return JSONResponse(
                status_code=400,
                content={"detail": "No dog breeds detected in the image"}
            )
            
        # Clear memory
        del contents, image
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        response_data = {"results": results}
        logger.info(f"Sending response: {response_data}")
        return JSONResponse(content=response_data)
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        logger.exception("Full error traceback:")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 