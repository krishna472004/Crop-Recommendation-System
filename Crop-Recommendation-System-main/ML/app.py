from flask import Flask, request, jsonify
import numpy as np
import joblib

app = Flask(__name__)

# Load model and scalers
model = joblib.load("model.pkl")
sc = joblib.load("standscaler.pkl")
ms = joblib.load("minmaxscaler.pkl")

crop_dict = {
    1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya",
    7: "Orange", 8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes",
    12: "Mango", 13: "Banana", 14: "Pomegranate", 15: "Lentil", 16: "Blackgram",
    17: "Mungbean", 18: "Mothbeans", 19: "Pigeonpeas", 20: "Kidneybeans",
    21: "Chickpea", 22: "Coffee"
}


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        N = data["nitrogen"]
        P = data["phosphorus"]
        K = data["potassium"]
        temp = data["temperature"]
        humidity = data["humidity"]
        ph = data["ph"]
        rainfall = data.get("rainfall", 200)

        features = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)

        # Scale and predict
        scaled_features = ms.transform(features)
        final_features = sc.transform(scaled_features)
        probs = model.predict_proba(final_features)[0]

        # Top 5 crops
        top_indices = np.argsort(probs)[::-1][:5]
        top_crops = [
            {"crop": crop_dict[i+1], "confidence": round(probs[i]*100, 2)}
            for i in top_indices
        ]

        return jsonify({"top_crops": top_crops})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
