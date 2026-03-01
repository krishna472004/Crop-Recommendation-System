import numpy as np
from PIL import Image

def preprocess_image(image_path):
    img = Image.open(image_path).resize((128, 128))
    img = np.array(img) / 255.0
    return np.expand_dims(img, axis=0)
