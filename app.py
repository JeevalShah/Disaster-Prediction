import streamlit as st
import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn.functional as F  

class_names = ['Cyclone', 'Earthquake', 'Flood', 'Normal', 'Wildfire']


model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
num_ftrs = model.fc.in_features
model.fc = torch.nn.Linear(num_ftrs, len(class_names))
model.load_state_dict(torch.load("resnet50.pth", map_location=torch.device('cpu')))
model.eval()

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

st.title("🌍 Natural Disaster Image Classifier (ResNet50)")
st.write("Upload an image to classify it as Cyclone, Earthquake, Flood, Normal, or Wildfire.")

uploaded_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Load image
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_container_width=True)

    # Preprocess
    input_tensor = preprocess(image).unsqueeze(0)

    # Predict
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = F.softmax(outputs, dim=1)
        conf, preds = torch.max(probs, 1)
        predicted_class = class_names[preds.item()]
        confidence = conf.item() * 100

    # --- Display result ---
    st.success(f"Prediction: **{predicted_class}** ({confidence:.2f}% confidence)")

    # Optional: show full probability distribution
    st.subheader("Class Probabilities")
    prob_dict = {class_names[i]: f"{p*100:.2f}%" for i, p in enumerate(probs[0])}
    st.json(prob_dict)