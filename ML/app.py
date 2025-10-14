from flask import Flask, request, render_template
import numpy as np
import joblib

# Load trained model and scalers
model = joblib.load('model.pkl')
sc = joblib.load('standscaler.pkl')
ms = joblib.load('minmaxscaler.pkl')

# Crop mapping
crop_dict = {1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
             8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
             14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans",
             19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"}

# Flask app
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input from form
        N = float(request.form['Nitrogen'])
        P = float(request.form['Phosporus'])
        K = float(request.form['Potassium'])
        temp = float(request.form['Temperature'])
        humidity = float(request.form['Humidity'])
        ph = float(request.form['Ph'])
        rainfall = float(request.form['Rainfall'])

        # Create feature array
        features = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)

        # Scale features
        scaled_features = ms.transform(features)
        final_features = sc.transform(scaled_features)

        # Predict probabilities
        probs = model.predict_proba(final_features)[0]

        # Get top 5 crops
        top_indices = np.argsort(probs)[::-1][:5]
        top_crops = [(crop_dict.get(i+1, "Unknown"), round(probs[i]*100, 2)) for i in top_indices]

        # Create reason text
        reasons = []
        for crop, prob in top_crops:
            reason = f"{crop}: suitable with confidence {prob}% based on soil nutrients and weather."
            reasons.append(reason)

        return render_template('index.html', result="\n".join(reasons))

    except Exception as e:
        return render_template('index.html', result=f"Error: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)
