# Dog Breed Classifier Web App

A web application that uses deep learning to classify dog breeds from uploaded photos. Built with React, FastAPI, and PyTorch.

## Features

- Upload photos through drag-and-drop or file selection
- Real-time dog breed classification
- Confidence scores for predictions
- Support for multiple dog breed detection
- Modern, responsive UI

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Setup

### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000

### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Upload a dog photo using the drag-and-drop area or file selector
3. Wait for the analysis to complete
4. View the predicted dog breeds and their confidence scores

## Technical Details

- Frontend: React with TypeScript, Tailwind CSS for styling
- Backend: FastAPI with PyTorch for ML inference
- Model: ResNet50 pre-trained on ImageNet, fine-tuned for dog breed classification
- Image Processing: PIL for image handling, torchvision for transformations

## Error Handling

The application includes robust error handling for:
- Non-image file uploads
- Images without detectable dogs
- Server errors
- Network issues

## Performance

- Average inference time: <2 seconds
- Supports images up to 10MB
- Handles concurrent requests efficiently

## License

MIT 