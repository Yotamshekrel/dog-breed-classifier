import tensorflow as tf
import numpy as np
from typing import List, Dict, Any
import json
import os

class DogBreedClassifier:
    def __init__(self):
        self.model = None
        self.class_names: List[str] = []
        self.model_path = "model"  # Will store model path here
        self.load_model()

    def load_model(self):
        """
        Load the pre-trained model. For now, we'll use MobileNetV2 as a base model.
        In production, this should be replaced with a fine-tuned model for dog breeds.
        """
        try:
            # Load base model
            self.model = tf.keras.applications.MobileNetV2(
                weights='imagenet',
                include_top=True
            )
            
            # Load ImageNet class names
            with open('imagenet_classes.json', 'r') as f:
                self.class_names = json.load(f)
                
        except Exception as e:
            print(f"Error loading model: {e}")
            # Fallback to ensure the service can still run
            self.model = None
            self.class_names = []

    def predict(self, image_array: np.ndarray) -> List[Dict[str, Any]]:
        """
        Make a prediction on the preprocessed image.
        Returns list of predictions with confidence scores.
        """
        if self.model is None:
            return [{"breed": "Model not loaded", "confidence": 0.0}]

        try:
            predictions = self.model.predict(image_array)
            decoded_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=3)[0]
            
            # Format predictions
            return [
                {
                    "breed": self._format_breed_name(pred[1]),
                    "confidence": float(pred[2])
                }
                for pred in decoded_predictions
            ]
        except Exception as e:
            print(f"Prediction error: {e}")
            return [{"breed": "Error during prediction", "confidence": 0.0}]

    def _format_breed_name(self, name: str) -> str:
        """Format the breed name to be more readable"""
        return name.replace('_', ' ').title()

# Create a singleton instance
classifier = DogBreedClassifier() 