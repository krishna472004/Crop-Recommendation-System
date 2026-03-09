from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# ===============================
# Load trained model and scalers
# ===============================

model = joblib.load("model.pkl")
sc = joblib.load("standscaler.pkl")
ms = joblib.load("minmaxscaler.pkl")

# ===============================
# Crop ID → Crop Name Mapping
# ===============================

crop_dict = {
1: "Rice",
2: "Maize",
3: "Chickpea",
4: "Kidney Beans",
5: "Pigeon Peas",
6: "Moth Beans",
7: "Mung Bean",
8: "Black Gram",
9: "Lentil",
10: "Pomegranate",
11: "Banana",
12: "Mango",
13: "Grapes",
14: "Watermelon",
15: "Muskmelon",
16: "Apple",
17: "Orange",
18: "Papaya",
19: "Coconut",
20: "Cotton",
21: "Jute",
22: "Coffee"
}

# Get labels used in the model
crop_ids = model.classes_

# ===============================
# Home Route
# ===============================

@app.route("/")
def home():
    return "🌾 Crop Recommendation API is running"

# ===============================
# Prediction Route
# ===============================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        # ===============================
        # Extract input values
        # ===============================

        N = float(data["nitrogen"])
        P = float(data["phosphorus"])
        K = float(data["potassium"])
        temp = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data.get("rainfall", 200))

        # ===============================
        # Prepare feature array
        # ===============================

        features = np.array([[N, P, K, temp, humidity, ph, rainfall]])

        print("📥 Input Features:", features)

        # ===============================
        # Apply scalers
        # ===============================

        scaled = ms.transform(features)
        final_features = sc.transform(scaled)

        # ===============================
        # Get prediction probabilities
        # ===============================

        probs = model.predict_proba(final_features)[0]

        print("📊 Probabilities:", probs)

        # ===============================
        # Get Top 5 Crops
        # ===============================

        top_indices = np.argsort(probs)[::-1][:5]

        top_crops = []

        for idx in top_indices:

            crop_id = int(crop_ids[idx])
            crop_name = crop_dict.get(crop_id, str(crop_id))

            confidence = round(float(probs[idx]) * 100, 2)

            top_crops.append({
                "crop": crop_name,
                "confidence": confidence
            })

        print("🌾 Top 5 Recommendations:", top_crops)

        return jsonify({
            "success": True,
            "recommendations": top_crops
        })

    except Exception as e:

        print("❌ Prediction error:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ===============================
# Run Flask Server
# ===============================

if __name__ == "__main__":

    print("✅ Model Loaded")
    print("Available crop IDs in model:", crop_ids)

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )