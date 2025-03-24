from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from model.NamePredictor import MedicalReportNameClassifier
from model.extractData import extract_health_data, update_patient_data

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

preprocessor = joblib.load("model/medical_condition_preprocessor.pkl")
model = joblib.load("model/medical_condition_model.pkl")

# Load the classifier
classifier = MedicalReportNameClassifier()

@app.route("/predict", methods=["POST"])
def predict():
    """API endpoint to predict report type from user input."""
    try:
        data = request.get_json()
        report_name = data.get("report_name", "")

        if not report_name:
            return jsonify({"error": "Report name is required!"}), 400

        if len(report_name) > 50:
            # If input is too long, treat it as report content
            predictions = classifier.suggest_from_content(report_name)
        else:
            # Otherwise, treat it as a report name
            predictions = classifier.find_best_match(report_name)

        if not predictions:
            return jsonify({"message": "No suitable match found!"}), 404

        response = [
            {"report": p[0], "category": p[1], "confidence": round(p[2], 2)}
            for p in predictions
        ]

        return jsonify({"predictions": response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/extractText', methods=['POST'])
def process_text():
    data = request.get_json()

    if not data or "extracted_text" not in data or "upload_date" not in data or "existing_patient_data" not in data:
        return jsonify({"error": "Missing required fields (extracted_text, upload_date, existing_patient_data)"}), 400

    extracted_text = data["extracted_text"]
    upload_date = data["upload_date"]
    existing_patient_data = data["existing_patient_data"]

    new_data = extract_health_data(extracted_text, upload_date)

    # Update existing data with new data
    updated_data = update_patient_data(existing_patient_data, new_data)

    return jsonify({"message": "Text processed successfully", "data": updated_data})


@app.route('/predict_condition', methods=['POST'])
def predict_medical_condition():
    """
    API Endpoint to predict medical condition based on input data.

    Expected JSON input:
    {
        "age": 65,
        "gender": "Male",
        "smoking_status": "Former-Smoker",
        "bmi": 28.5,
        "blood_pressure": 145,
        "glucose_levels": 120
    }

    Returns:
    {
        "predicted_condition": "Diabetic",
        "probabilities": {
            "Cancer": 0.12,
            "Pneumonia": 0.25,
            "Diabetic": 0.63
        }
    }
    """
    try:
        # Parse input JSON data
        data = request.get_json()

        # Convert to DataFrame
        input_data = pd.DataFrame([data])

        # Preprocess the data
        processed_data = preprocessor.transform(input_data)

        # Predict condition
        prediction = model.predict(processed_data)[0]
        probabilities = model.predict_proba(processed_data)[0]

        # Create a dictionary of condition probabilities
        condition_probabilities = dict(zip(model.classes_, probabilities))

        return jsonify({
            "predicted_condition": prediction,
            "probabilities": condition_probabilities
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

