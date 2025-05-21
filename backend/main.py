from fastapi import FastAPI, File, UploadFile, HTTPException, Request
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
from datetime import datetime
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Load environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://dog-breed-classifier-yotam-shekrels-projects.vercel.app")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://dog-breed-classifier-yotam-shekrels-projects.vercel.app,http://localhost:5173,https://localhost:5173").split(",")

app = FastAPI(title="Doggy Detective API")

# Enable CORS with more permissive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,  # Changed to True to match frontend configuration
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

# Add these constants after the existing ones
DOG_BREEDS = [
    "Labrador Retriever", "German Shepherd", "Golden Retriever", "French Bulldog",
    "Bulldog", "Poodle", "Beagle", "Rottweiler", "Dachshund", "Yorkshire Terrier",
    "Boxer", "Chihuahua", "Great Dane", "Shih Tzu", "Siberian Husky"
]

BREED_DESCRIPTIONS = {
    "Labrador Retriever": "Friendly, outgoing, and high-spirited companions who have more than enough affection to go around for a family looking for a medium-to-large dog.",
    "German Shepherd": "Intelligent and capable working dogs. Their devotion and courage are unmatched.",
    "Golden Retriever": "Intelligent, friendly, and devoted. These dogs are easy to train and get along with just about everyone.",
    "French Bulldog": "Adaptable, playful, and smart. They're compact but sturdy, with a friendly, easygoing temperament.",
    "Bulldog": "Calm, courageous, and friendly. They're dignified but amusing, and make excellent companions.",
    "Poodle": "Exceptionally smart and active dogs. They're eager to please and make wonderful family pets.",
    "Beagle": "Friendly, curious, and merry. They're excellent with children and generally good with other dogs.",
    "Rottweiler": "Loyal, loving, and confident guardians. They're natural protectors and very intelligent.",
    "Dachshund": "Lively, clever, and courageous. They're known for their distinctive shape and spirited personality.",
    "Yorkshire Terrier": "Bold, confident, and courageous. They're small but mighty, with a big personality.",
    "Boxer": "Patient, playful, and energetic. They're great with children and make excellent family dogs.",
    "Chihuahua": "Graceful, charming, and sassy. They're the smallest breed but have a big personality.",
    "Great Dane": "Friendly, patient, and dependable. They're gentle giants who make excellent family pets.",
    "Shih Tzu": "Affectionate, playful, and outgoing. They're known for their beautiful long coat and sweet nature.",
    "Siberian Husky": "Loyal, mischievous, and outgoing. They're known for their striking appearance and friendly nature."
}

BREED_CHARACTERISTICS = {
    "Labrador Retriever": {
        "size": "Large",
        "lifespan": "10-12 years",
        "exercise": "High",
        "grooming": "Moderate"
    },
    "German Shepherd": {
        "size": "Large",
        "lifespan": "9-13 years",
        "exercise": "High",
        "grooming": "Moderate"
    },
    "Golden Retriever": {
        "size": "Large",
        "lifespan": "10-12 years",
        "exercise": "High",
        "grooming": "Moderate"
    },
    "French Bulldog": {
        "size": "Small",
        "lifespan": "10-12 years",
        "exercise": "Low",
        "grooming": "Low"
    },
    "Bulldog": {
        "size": "Medium",
        "lifespan": "8-10 years",
        "exercise": "Low",
        "grooming": "Low"
    }
}

# Add training tips data
TRAINING_TIPS = {
    "Labrador Retriever": [
        {
            "title": "Basic Obedience Training",
            "description": "Essential commands for your Labrador",
            "difficulty": "Beginner",
            "duration": "4-6 weeks",
            "steps": [
                "Start with sit command",
                "Move to stay command",
                "Practice recall training",
                "Add down command"
            ],
            "proTips": [
                "Use positive reinforcement",
                "Keep sessions short and fun",
                "Be consistent with commands"
            ],
            "commonMistakes": [
                "Inconsistent training schedule",
                "Using punishment-based methods",
                "Expecting too much too soon"
            ]
        }
    ],
    "German Shepherd": [
        {
            "title": "Advanced Training",
            "description": "Advanced commands for German Shepherds",
            "difficulty": "Advanced",
            "duration": "8-12 weeks",
            "steps": [
                "Master basic commands",
                "Introduce complex commands",
                "Add distance commands",
                "Practice precision training"
            ],
            "proTips": [
                "Use clear hand signals",
                "Maintain high energy",
                "Challenge their intelligence"
            ],
            "commonMistakes": [
                "Moving too fast",
                "Not providing enough mental stimulation",
                "Inconsistent training methods"
            ]
        }
    ]
}

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
async def classify_image(request: Request, file: UploadFile = File(...)):
    # Log the origin of the request
    origin = request.headers.get("origin", "unknown")
    logger.info(f"Request received from origin: {origin}")
    
    logger.info(f"Received image: {file.filename}")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        logger.warning(f"Invalid file type: {file.content_type}")
        return JSONResponse(
            status_code=400,
            content={"detail": "File must be an image"},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
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
                content={"detail": "No dog breeds detected in the image"},
                headers={
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                }
            )
            
        # Clear memory
        del contents, image
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        response_data = {"results": results}
        logger.info(f"Sending response to {origin}: {response_data}")
        return JSONResponse(
            content=response_data,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        logger.exception("Full error traceback:")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )

@app.get("/api/breeds/daily")
async def get_breed_of_the_day():
    """Get the breed of the day"""
    # Use the current date to determine the breed of the day
    today = datetime.now().strftime("%Y-%m-%d")
    random.seed(today)  # This ensures the same breed is returned for the same day
    breed = random.choice(DOG_BREEDS)
    
    return {
        "name": breed,
        "description": BREED_DESCRIPTIONS.get(breed, "A wonderful companion dog."),
        "imageUrl": f"https://source.unsplash.com/featured/?{breed.replace(' ', '+')}+dog",
        "funFact": f"Did you know? {breed}s are known for their unique characteristics!"
    }

@app.get("/api/breeds/compare")
async def compare_breeds(breed1: str, breed2: str):
    """Compare two dog breeds"""
    if breed1 not in DOG_BREEDS or breed2 not in DOG_BREEDS:
        raise HTTPException(status_code=404, detail="One or both breeds not found")
    
    # Generate some comparison data
    similarities = [
        "Both breeds make excellent family pets",
        "Both require regular exercise",
        "Both are known for their loyalty"
    ]
    
    differences = [
        f"{breed1}s are generally {BREED_CHARACTERISTICS[breed1]['size'].lower()} while {breed2}s are {BREED_CHARACTERISTICS[breed2]['size'].lower()}",
        f"{breed1}s typically live {BREED_CHARACTERISTICS[breed1]['lifespan']} while {breed2}s live {BREED_CHARACTERISTICS[breed2]['lifespan']}",
        f"{breed1}s require {BREED_CHARACTERISTICS[breed1]['exercise'].lower()} exercise while {breed2}s need {BREED_CHARACTERISTICS[breed2]['exercise'].lower()} exercise"
    ]
    
    # Calculate a compatibility score (just for demonstration)
    compatibility_score = random.randint(60, 95)
    
    return {
        "breed1": breed1,
        "breed2": breed2,
        "similarities": similarities,
        "differences": differences,
        "compatibilityScore": compatibility_score
    }

@app.get("/api/breeds/{breed}/analysis")
async def get_breed_analysis(breed: str):
    """Get detailed analysis of a specific breed"""
    if breed not in DOG_BREEDS:
        raise HTTPException(status_code=404, detail="Breed not found")
    
    return {
        "name": breed,
        "description": BREED_DESCRIPTIONS.get(breed, "A wonderful companion dog."),
        "temperament": ["Friendly", "Loyal", "Intelligent", "Playful"],
        "characteristics": BREED_CHARACTERISTICS.get(breed, {
            "size": "Medium",
            "lifespan": "10-12 years",
            "exercise": "Moderate",
            "grooming": "Moderate"
        }),
        "health": {
            "commonIssues": ["Hip dysplasia", "Eye conditions", "Heart disease"],
            "considerations": ["Regular vet check-ups", "Proper diet", "Exercise"]
        },
        "training": {
            "difficulty": random.randint(1, 10),
            "tips": [
                "Start training early",
                "Use positive reinforcement",
                "Be consistent with commands"
            ]
        },
        "exercise": {
            "dailyNeeds": "30-60 minutes of exercise",
            "activities": ["Walking", "Playing fetch", "Swimming"]
        },
        "grooming": {
            "frequency": "Weekly",
            "requirements": ["Brushing", "Bathing", "Nail trimming"]
        }
    }

@app.get("/api/breeds/random")
async def get_random_breed():
    """Get a random dog breed"""
    breed = random.choice(DOG_BREEDS)
    return await get_breed_analysis(breed)

@app.post("/api/breeds/mix")
async def calculate_mix(breeds: list):
    """Calculate characteristics of mixed breeds"""
    if not breeds:
        raise HTTPException(status_code=400, detail="No breeds provided")
    
    # Validate breeds
    for breed in breeds:
        if breed["name"] not in DOG_BREEDS:
            raise HTTPException(status_code=404, detail=f"Breed {breed['name']} not found")
    
    # Calculate mix characteristics
    characteristics = {
        "size": "Medium",
        "temperament": ["Friendly", "Loyal", "Intelligent"],
        "exercise": "Moderate",
        "grooming": "Moderate"
    }
    
    return {
        "breeds": breeds,
        "characteristics": characteristics,
        "health": {
            "considerations": [
                "Regular vet check-ups",
                "Watch for breed-specific conditions",
                "Maintain healthy weight"
            ]
        },
        "care": {
            "training": [
                "Start training early",
                "Use positive reinforcement",
                "Be consistent"
            ],
            "exercise": [
                "Daily walks",
                "Play sessions",
                "Mental stimulation"
            ],
            "grooming": [
                "Regular brushing",
                "Bathing as needed",
                "Nail trimming"
            ]
        }
    }

@app.get("/api/training/{breed}")
async def get_training_tips(breed: str):
    """Get training tips for a specific breed"""
    if breed not in TRAINING_TIPS:
        raise HTTPException(status_code=404, detail="Training tips not found for this breed")
    return TRAINING_TIPS[breed]

@app.post("/api/breeds/guess")
async def guess_breed(file: UploadFile = File(...)):
    """Process an image and return breed guess"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        results = get_predictions(image)
        
        if not results:
            raise HTTPException(status_code=400, detail="No dog breeds detected in the image")
            
        top_result = results[0]
        return {
            "breed": top_result["breed"],
            "confidence": top_result["confidence"],
            "description": BREED_DESCRIPTIONS.get(top_result["breed"], "A wonderful companion dog."),
            "characteristics": BREED_CHARACTERISTICS.get(top_result["breed"], {
                "size": "Medium",
                "lifespan": "10-12 years",
                "exercise": "Moderate",
                "grooming": "Moderate"
            })
        }
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/guess/check")
async def check_breed_guess(guess: str):
    """Check if a breed guess is correct"""
    # In a real application, this would compare against the actual breed
    # For now, we'll just return a mock response
    return {
        "correct": random.choice([True, False]),
        "actualBreed": random.choice(DOG_BREEDS)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 