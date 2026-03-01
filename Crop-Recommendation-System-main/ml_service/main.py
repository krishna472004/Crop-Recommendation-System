from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import random

app = FastAPI()

class PointsRequest(BaseModel):
    points: list

@app.post("/predict")
def predict_land_data(req: PointsRequest):
    points = req.points
    results = []
    for p in points:
        results.append({
            "latitude": p[1],
            "longitude": p[0],
            "soil_type": random.choice(["Loamy", "Sandy", "Clay", "Silt"]),
            "ph": round(random.uniform(5.5, 8.0), 2),
            "nitrogen": random.randint(10, 100),
            "phosphorus": random.randint(5, 50),
            "potassium": random.randint(5, 50),
            "temperature": round(random.uniform(20, 35), 1),
            "humidity": round(random.uniform(50, 90), 1)
        })
    return results
