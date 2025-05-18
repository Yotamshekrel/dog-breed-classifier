from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
FRONTEND_URLS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "https://doggy-detective.vercel.app")
]

app = FastAPI(title="Doggy Detective API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    mem_used = None
    if torch.cuda.is_available():
        mem_used = torch.cuda.memory_allocated() / 1024**2
    return {
        "message": "Dog Breed Classifier API is running",
        "memory_usage_mb": mem_used
    }

def get_predictions(image: Image.Image) -> list:
    try:
        # Preprocess the image
        img_tensor = transform(image).unsqueeze(0)
        if torch.cuda.is_available():
            img_tensor = img_tensor.cuda()
        
        # Get model predictions
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
        
        # Get all dog breed predictions
        breed_probs = []
        for i in range(151, 269):  # ImageNet dog breeds range
            prob = float(probabilities[i].item() * 100)
            if prob > 1.0:  # Only consider confident predictions
                breed_name = class_idx[str(i)].split(',')[0].title()
                breed_probs.append({"breed": breed_name, "confidence": prob})
        
        # Sort by confidence and take top 5
        breed_probs.sort(key=lambda x: x["confidence"], reverse=True)
        breed_probs = breed_probs[:5]
        
        # Normalize to 100%
        if breed_probs:
            total = sum(b["confidence"] for b in breed_probs)
            for breed in breed_probs:
                breed["confidence"] = (breed["confidence"] / total) * 100
        
        return breed_probs
    except Exception as e:
        logger.error(f"Error in predictions: {str(e)}")
        raise

@app.post("/api/classify")
async def classify_image(file: UploadFile = File(...)):
    logger.info(f"Received image: {file.filename}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type: {file.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get predictions
        results = get_predictions(image)
        
        if not results:
            logger.warning("No dog breeds detected in the image")
            raise HTTPException(status_code=400, detail="No dog detected in the image")
        
        # Clear memory
        del contents, image
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info(f"Successfully classified image. Found breeds: {[r['breed'] for r in results]}")
        return {"results": results}
    
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 