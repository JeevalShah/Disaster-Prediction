import streamlit as st
import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn.functional as F  # for softmax

class_names = ['Cyclone', 'Earthquake', 'Flood', 'Wildfire']

# --- Load model ---
model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, len(class_names))
model.load_state_dict(torch.load("resnet.pth", map_location=torch.device('cpu')))
model.eval()

# --- Preprocessing ---
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406], 
        std=[0.229, 0.224, 0.225]
    )
])

# --- Streamlit UI ---
st.title("ResNet50 Image Classifier")

uploaded_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    input_tensor = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = F.softmax(outputs, dim=1)  # convert logits to probabilities
        conf, preds = torch.max(probs, 1)
        predicted_class = class_names[preds.item()]
        confidence = conf.item() * 100

    st.success(f"Prediction: **{predicted_class}** ({confidence:.2f}% confidence)")