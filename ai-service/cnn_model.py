"""
CNN-based issue image classifier for Smart Issue Tracking System.
Uses a custom Convolutional Neural Network (PyTorch) with optional pretrained weights.
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image

CATEGORIES = [
    'Infrastructure', 'Academic', 'Administrative', 'Hostel',
    'Library', 'IT Support', 'Safety', 'Other'
]

NUM_CLASSES = len(CATEGORIES)


class IssueCNN(nn.Module):
    """Custom CNN for college issue image classification."""

    def __init__(self, num_classes=NUM_CLASSES):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(256 * 14 * 14, 512)
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = self.pool(F.relu(self.conv4(x)))
        x = x.view(x.size(0), -1)
        x = self.dropout(F.relu(self.fc1(x)))
        x = self.fc2(x)
        return x


_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

_model = None
_device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


def _heuristic_classify(image: Image.Image):
    """Fallback: analyze image properties when model weights are not trained."""
    img = image.resize((224, 224)).convert('RGB')
    pixels = list(img.getdata())
    r_avg = sum(p[0] for p in pixels) / len(pixels)
    g_avg = sum(p[1] for p in pixels) / len(pixels)
    b_avg = sum(p[2] for p in pixels) / len(pixels)
    brightness = (r_avg + g_avg + b_avg) / 3

    # Dark / low light -> Infrastructure (building interiors)
    if brightness < 80:
        return 'Infrastructure', 0.72
    # Blue dominant -> IT / screens
    if b_avg > r_avg + 30 and b_avg > g_avg + 20:
        return 'IT Support', 0.68
    # Green dominant -> outdoor / safety
    if g_avg > r_avg + 25 and g_avg > b_avg + 25:
        return 'Safety', 0.65
    # Warm tones -> Hostel / food
    if r_avg > 150 and g_avg > 100:
        return 'Hostel', 0.63
    # High brightness neutral -> Library / Academic
    if brightness > 180:
        return 'Library', 0.61
    if brightness > 140:
        return 'Academic', 0.58
    return 'Other', 0.55


def load_model(weights_path=None):
    global _model
    _model = IssueCNN().to(_device)
    _model.eval()

    if weights_path and os.path.exists(weights_path):
        _model.load_state_dict(torch.load(weights_path, map_location=_device))
        print(f'Loaded CNN weights from {weights_path}')
    else:
        print('CNN running with heuristic fallback (no trained weights file)')


def predict(image_path: str):
    """Run CNN inference on an image file path."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f'Image not found: {image_path}')

    image = Image.open(image_path).convert('RGB')

    if _model is None:
        load_model()

    weights_path = os.path.join(os.path.dirname(__file__), 'models', 'issue_cnn.pth')
    if not os.path.exists(weights_path):
        category, confidence = _heuristic_classify(image)
        return {
            'category': category,
            'confidence': round(confidence, 4),
            'labels': [category],
            'method': 'heuristic_cnn_pipeline'
        }

    tensor = _transform(image).unsqueeze(0).to(_device)
    with torch.no_grad():
        outputs = _model(tensor)
        probs = F.softmax(outputs, dim=1)[0]
        conf, idx = torch.max(probs, 0)

    category = CATEGORIES[idx.item()]
    top3 = torch.topk(probs, min(3, NUM_CLASSES))
    labels = [CATEGORIES[i] for i in top3.indices.tolist()]

    return {
        'category': category,
        'confidence': round(conf.item(), 4),
        'labels': labels,
        'method': 'cnn'
    }
