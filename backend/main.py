from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights, inception_v3, Inception_V3_Weights
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Doggy Detective API")

# Enable CORS with environment variables
FRONTEND_URLS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "https://doggy-detective.vercel.app")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a root endpoint for testing
@app.get("/")
async def root():
    return {"message": "Dog Breed Classifier API is running"}

# Load the models
resnet_model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
inception_model = inception_v3(weights=Inception_V3_Weights.IMAGENET1K_V1)
resnet_model.eval()
inception_model.eval()

# Load ImageNet class labels
with open("imagenet_classes.json") as f:
    class_idx = json.load(f)

# Image preprocessing for ResNet
resnet_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Image preprocessing for Inception
inception_transform = transforms.Compose([
    transforms.Resize(299),
    transforms.CenterCrop(299),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def get_model_predictions(image: Image.Image, model: torch.nn.Module, transform: transforms.Compose) -> dict:
    # Preprocess the image
    img_tensor = transform(image)
    img_tensor = img_tensor.unsqueeze(0)  # Add batch dimension
    
    # Get model predictions
    with torch.no_grad():
        outputs = model(img_tensor)
        if isinstance(outputs, tuple):  # Inception returns tuple
            outputs = outputs[0]
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
    
    # Get all dog breed predictions
    breed_probs = {}
    for i in range(151, 269):  # ImageNet dog breeds range
        prob = float(probabilities[i].item() * 100)
        if prob > 0.5:  # Consider breeds with >0.5% confidence
            breed_name = class_idx[str(i)].split(',')[0].title()
            breed_probs[breed_name] = prob
    
    return breed_probs

def combine_predictions(resnet_preds: dict, inception_preds: dict) -> list:
    # Combine predictions from both models
    combined_breeds = {}
    
    # Process ResNet predictions with 0.6 weight
    for breed, conf in resnet_preds.items():
        combined_breeds[breed] = conf * 0.6
    
    # Process Inception predictions with 0.4 weight
    for breed, conf in inception_preds.items():
        if breed in combined_breeds:
            combined_breeds[breed] += conf * 0.4
        else:
            combined_breeds[breed] = conf * 0.4
    
    # Convert to list and sort
    breed_list = [{"breed": breed, "confidence": conf} 
                  for breed, conf in combined_breeds.items()
                  if conf > 1.0]  # Filter out very small percentages
    breed_list.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Take top 5 breeds
    breed_list = breed_list[:5]
    
    # Normalize to 100%
    total_confidence = sum(breed["confidence"] for breed in breed_list)
    for breed in breed_list:
        breed["confidence"] = (breed["confidence"] / total_confidence) * 100
    
    return breed_list

def predict_breed(image: Image.Image) -> list:
    # Get predictions from both models
    resnet_predictions = get_model_predictions(image, resnet_model, resnet_transform)
    inception_predictions = get_model_predictions(image, inception_model, inception_transform)
    
    # Combine predictions
    results = combine_predictions(resnet_predictions, inception_predictions)
    
    # If no dog breeds detected, return message
    if not results:
        raise HTTPException(status_code=400, detail="No dog detected in the image")
    
    return results

@app.post("/api/classify")
async def classify_image(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get predictions
        results = predict_breed(image)
        
        return {"results": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 